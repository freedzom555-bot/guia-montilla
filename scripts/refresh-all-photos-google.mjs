/**
 * Regenera TODAS las fotos desde Google Places del placeId de cada ficha.
 * Sin Wikimedia, sin og:image, sin pools genéricos.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
const IMG = join(ROOT, "public/images/negocios");
const LOG = join(ROOT, "data/photo-refresh-log.json");

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
const MAX = 4;

async function googlePhotos(placeId, displayName) {
  const id = placeId.replace(/^places\//, "");
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=es`, {
    headers: { "X-Goog-Api-Key": API_KEY, "X-Goog-FieldMask": FIELD_MASK },
  });
  if (!res.ok) return [];
  const place = await res.json();
  const name = place.displayName?.text ?? displayName ?? "Negocio";
  return (place.photos ?? []).slice(0, MAX).map((p, i) => ({
    url: `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=1200&maxWidthPx=1200&key=${API_KEY}`,
    alt: `${name} — foto ${i + 1} (Google Maps)`,
  }));
}

async function wipeDir(dir) {
  await mkdir(dir, { recursive: true });
  try {
    for (const f of await readdir(dir)) {
      if (/\.(jpe?g|png|webp)$/i.test(f)) await rm(join(dir, f));
    }
  } catch { /* */ }
}

async function downloadGallery(slug, sources) {
  const dir = join(IMG, slug);
  await wipeDir(dir);
  const gallery = [];
  for (const src of sources) {
    if (gallery.length >= MAX) break;
    const file = `${String(gallery.length + 1).padStart(2, "0")}.jpg`;
    const dest = join(dir, file);
    try {
      await sleep(350);
      await exec("curl.exe", [
        "-sL", "--max-time", "60", "--retry", "2", "--retry-delay", "1",
        "-A", "GuiaMontilla/2.0", "-o", dest, src.url,
      ]);
      const buf = await readFile(dest);
      if (buf.length < 2500) {
        await rm(dest, { force: true });
        continue;
      }
      if (buf[0] === 0x3c && buf[1] === 0x21) {
        await rm(dest, { force: true });
        continue;
      }
      gallery.push({ src: `/images/negocios/${slug}/${file}`, alt: src.alt });
    } catch { /* */ }
  }
  return gallery;
}

if (!API_KEY) {
  console.error("Falta GOOGLE_PLACES_API_KEY en .env");
  process.exit(1);
}

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const registry = Object.fromEntries(JSON.parse(await readFile(REG, "utf-8")).map((r) => [r.slug, r]));

const log = { ok: 0, noPhotos: 0, noPlaceId: 0, failed: [], refreshed: [] };

console.log(`Regenerando fotos Google Maps para ${businesses.length} fichas…\n`);

for (let i = 0; i < businesses.length; i++) {
  const b = businesses[i];
  const placeId = b.placeId ?? registry[b.slug]?.placeId;
  if (!placeId) {
    b.gallery = [];
    b.image = null;
    log.noPlaceId++;
    log.failed.push({ slug: b.slug, reason: "sin-placeId" });
    continue;
  }

  process.stdout.write(`[${i + 1}/${businesses.length}] ${b.slug}… `);
  await sleep(120);
  const sources = await googlePhotos(placeId, b.name);

  if (!sources.length) {
    await wipeDir(join(IMG, b.slug));
    b.gallery = [];
    b.image = null;
    log.noPhotos++;
    console.log("sin fotos en Google");
    log.failed.push({ slug: b.slug, reason: "google-sin-fotos" });
    continue;
  }

  const gallery = await downloadGallery(b.slug, sources);
  if (!gallery.length) {
    b.gallery = [];
    b.image = null;
    log.failed.push({ slug: b.slug, reason: "descarga-fallida" });
    console.log("descarga fallida");
    continue;
  }

  b.gallery = gallery;
  b.image = gallery[0].src;
  log.ok++;
  log.refreshed.push({ slug: b.slug, photos: gallery.length });
  console.log(`✓ ${gallery.length}`);

  if ((i + 1) % 25 === 0) {
    await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
  }
}

await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
await writeFile(LOG, JSON.stringify(log, null, 2), "utf-8");

console.log(`\n✓ ${log.ok} con fotos Google · ${log.noPhotos} sin fotos en Google · ${log.noPlaceId} sin placeId`);
console.log(`→ ${LOG}`);
