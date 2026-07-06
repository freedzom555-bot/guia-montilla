/**
 * Verifica que la foto principal local coincide con Google Places (mismo placeId).
 * Refresca automáticamente las fichas con desajuste.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const IMG = join(ROOT, "public/images/negocios");

function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, ".env"), "utf-8").split("\n")) {
      const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch { /* */ }
}
loadEnv();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FIELD_MASK = "id,displayName,photos";

async function downloadBuffer(url) {
  const tmp = join(ROOT, ".tmp-photo-check.jpg");
  await exec("curl.exe", ["-sL", "--max-time", "45", "-A", "GuiaMontilla/2.0", "-o", tmp, url]);
  const buf = await readFile(tmp);
  await rm(tmp, { force: true });
  if (buf.length < 2500) throw new Error("invalid");
  return buf;
}

async function googlePhotoUrls(placeId, max = 4) {
  const id = placeId.replace(/^places\//, "");
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=es`, {
    headers: { "X-Goog-Api-Key": API_KEY, "X-Goog-FieldMask": FIELD_MASK },
  });
  if (!res.ok) return [];
  const place = await res.json();
  return (place.photos ?? []).slice(0, max).map((p, i) => ({
    url: `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=1200&maxWidthPx=1200&key=${API_KEY}`,
    alt: `${place.displayName?.text ?? "Negocio"} — foto ${i + 1} (Google Maps)`,
  }));
}

async function refreshSlug(b, sources) {
  const dir = join(IMG, b.slug);
  await mkdir(dir, { recursive: true });
  try {
    for (const f of await readdir(dir)) {
      if (/\.(jpe?g|png|webp)$/i.test(f)) await rm(join(dir, f));
    }
  } catch { /* */ }

  const gallery = [];
  const seen = new Set();
  for (const src of sources) {
    if (gallery.length >= 4) break;
    try {
      await sleep(400);
      const buf = await downloadBuffer(src.url);
      const h = createHash("md5").update(buf).digest("hex");
      if (seen.has(h)) continue;
      seen.add(h);
      const file = `${String(gallery.length + 1).padStart(2, "0")}.jpg`;
      await writeFile(join(dir, file), buf);
      gallery.push({ src: `/images/negocios/${b.slug}/${file}`, alt: src.alt });
    } catch { /* */ }
  }
  b.gallery = gallery;
  b.image = gallery[0]?.src ?? null;
  return gallery.length;
}

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const mismatches = [];
let ok = 0;
let refreshed = 0;
let noGoogle = 0;

console.log(`Verificando ${businesses.length} fichas contra Google Places…\n`);

for (const b of businesses) {
  const localPath = join(ROOT, "public", b.image?.replace(/^\//, "") ?? "");
  let localHash = null;
  try {
    localHash = createHash("md5").update(await readFile(localPath)).digest("hex");
  } catch {
    mismatches.push({ slug: b.slug, reason: "sin-archivo-local" });
    continue;
  }

  if (!b.placeId || !API_KEY) {
    mismatches.push({ slug: b.slug, reason: "sin-placeId" });
    continue;
  }

  await sleep(100);
  const sources = await googlePhotoUrls(b.placeId, 4);
  if (!sources.length) {
    noGoogle++;
    continue;
  }

  let googleHash = null;
  try {
    googleHash = createHash("md5").update(await downloadBuffer(sources[0].url)).digest("hex");
  } catch {
    mismatches.push({ slug: b.slug, reason: "google-download-fail" });
    continue;
  }

  if (localHash === googleHash) {
    ok++;
    continue;
  }

  mismatches.push({ slug: b.slug, name: b.name, reason: "hash-mismatch" });
  console.log(`↻ Refrescando ${b.slug} (foto no coincide con Google)`);
  const n = await refreshSlug(b, sources);
  if (n) refreshed++;
}

await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
await writeFile(
  join(ROOT, "data/photo-verify-log.json"),
  JSON.stringify({ ok, refreshed, noGoogle, mismatches }, null, 2),
  "utf-8"
);

console.log(`\n✓ Coinciden con Google: ${ok}`);
console.log(`↻ Refrescadas: ${refreshed}`);
console.log(`⚠ Sin fotos Google: ${noGoogle}`);
console.log(`⚠ Pendientes: ${mismatches.filter((m) => m.reason !== "hash-mismatch").length}`);
console.log("→ data/photo-verify-log.json");
