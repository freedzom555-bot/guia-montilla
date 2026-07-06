/**
 * Re-descarga fotos SOLO desde Google Places (placeId de cada ficha).
 * Elimina galería previa si hay duplicados con otras fichas o alt genérico.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";

const exec = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
const IMG = join(ROOT, "public/images/negocios");
const AUDIT = join(ROOT, "data/photo-audit.json");

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

const ONLY_SLUGS = process.argv.includes("--all")
  ? null
  : new Set(
      (() => {
        try {
          const audit = JSON.parse(readFileSync(AUDIT, "utf-8"));
          const slugs = new Set();
          for (const x of audit.fichasWithSharedPhotosList ?? []) slugs.add(x.slug);
          for (const x of audit.suspiciousGenericAltsList ?? []) slugs.add(x.slug);
          return [...slugs];
        } catch {
          return [];
        }
      })()
    );

async function curlDownload(url, dest) {
  await mkdir(dirname(dest), { recursive: true });
  await exec("curl.exe", [
    "-sL", "--max-time", "60", "--retry", "2", "--retry-delay", "2",
    "-A", "GuiaMontilla/2.0",
    "-o", dest, url,
  ]);
  const buf = await readFile(dest);
  if (buf.length < 2500) throw new Error(`archivo inválido (${buf.length} B)`);
  if (buf[0] === 0x3c && buf[1] === 0x21) throw new Error("HTML en lugar de imagen");
  return buf;
}

async function googlePhotos(placeId, name, max = 4) {
  if (!API_KEY || !placeId) return [];
  const id = placeId.replace(/^places\//, "");
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=es`, {
    headers: { "X-Goog-Api-Key": API_KEY, "X-Goog-FieldMask": FIELD_MASK },
  });
  if (!res.ok) return [];
  const place = await res.json();
  const urls = [];
  for (const p of (place.photos ?? []).slice(0, max)) {
    urls.push({
      url: `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=1200&maxWidthPx=1200&key=${API_KEY}`,
      alt: `${place.displayName?.text ?? name} — foto ${urls.length + 1} (Google Maps)`,
    });
  }
  return urls;
}

async function clearGalleryDir(slug) {
  const dir = join(IMG, slug);
  try {
    const files = await readdir(dir);
    for (const f of files) {
      if (/\.(jpe?g|png|webp)$/i.test(f)) await rm(join(dir, f));
    }
  } catch { /* */ }
}

async function downloadGallery(slug, name, sources) {
  const dir = join(IMG, slug);
  await mkdir(dir, { recursive: true });
  const gallery = [];
  const hashes = new Set();

  for (const src of sources) {
    if (gallery.length >= 4) break;
    const file = `${String(gallery.length + 1).padStart(2, "0")}.jpg`;
    const dest = join(dir, file);
    try {
      await sleep(450);
      const buf = await curlDownload(src.url, dest);
      const h = createHash("md5").update(buf).digest("hex");
      if (hashes.has(h)) {
        await rm(dest);
        continue;
      }
      hashes.add(h);
      gallery.push({
        src: `/images/negocios/${slug}/${file}`,
        alt: src.alt || `${name} — foto ${gallery.length + 1} (Google Maps)`,
      });
    } catch { /* siguiente */ }
  }
  return gallery;
}

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const reg = Object.fromEntries(JSON.parse(await readFile(REG, "utf-8")).map((r) => [r.slug, r]));

let refreshed = 0;
let kept = 0;
let failed = 0;
const log = [];

for (const b of businesses) {
  if (ONLY_SLUGS && !ONLY_SLUGS.has(b.slug)) {
    kept++;
    continue;
  }

  const placeId = b.placeId || reg[b.slug]?.placeId;
  if (!placeId) {
    failed++;
    log.push({ slug: b.slug, status: "sin-placeId" });
    continue;
  }

  console.log(`→ ${b.name}`);
  const sources = await googlePhotos(placeId, b.name, 4);
  if (!sources.length) {
    failed++;
    log.push({ slug: b.slug, status: "sin-fotos-google" });
    console.warn("  ⚠ Sin fotos en Google");
    continue;
  }

  await clearGalleryDir(b.slug);
  const gallery = await downloadGallery(b.slug, b.name, sources);
  if (!gallery.length) {
    failed++;
    log.push({ slug: b.slug, status: "descarga-fallida" });
    console.warn("  ⚠ Descarga fallida");
    continue;
  }

  b.gallery = gallery;
  b.image = gallery[0].src;
  refreshed++;
  log.push({ slug: b.slug, status: "ok", photos: gallery.length });
  console.log(`  ✓ ${gallery.length} foto(s) propias de Google`);
}

await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
await writeFile(
  join(ROOT, "data/photo-refresh-log.json"),
  JSON.stringify({ refreshed, kept, failed, log }, null, 2),
  "utf-8"
);

console.log(`\n✓ ${refreshed} fichas con fotos refrescadas · ${kept} sin cambios · ${failed} fallidas`);
