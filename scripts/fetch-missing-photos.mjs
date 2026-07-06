/**
 * Descarga fotos solo desde Google Places (placeId). Sin web/Wikimedia/pools.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
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
const FIELD_MASK = "id,displayName,photos,websiteUri";

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
}

async function googlePhotos(placeId, max = 4) {
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
      alt: `${place.displayName?.text ?? "Negocio"} — Google Maps`,
    });
  }
  return urls;
}

async function downloadGallery(slug, name, sources) {
  const dir = join(IMG, slug);
  await mkdir(dir, { recursive: true });
  const gallery = [];

  for (let i = 0; i < sources.length && gallery.length < 4; i++) {
    const file = `${String(gallery.length + 1).padStart(2, "0")}.jpg`;
    const dest = join(dir, file);
    try {
      await sleep(400);
      await curlDownload(sources[i].url, dest);
      gallery.push({
        src: `/images/negocios/${slug}/${file}`,
        alt: sources[i].alt || `${name} — foto ${gallery.length + 1}`,
      });
    } catch { /* siguiente */ }
  }
  return gallery;
}

async function resolveSources(b) {
  if (!b.placeId) return [];
  return googlePhotos(b.placeId, 4);
}

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const reg = Object.fromEntries(JSON.parse(await readFile(REG, "utf-8")).map((r) => [r.slug, r]));

let fixed = 0;
let skipped = 0;
let failed = 0;

console.log(`Buscando fotos Google para fichas sin galería…\n`);

for (const b of businesses) {
  if (b.image && b.gallery?.length) {
    skipped++;
    continue;
  }

  if (!b.placeId && reg[b.slug]?.placeId) b.placeId = reg[b.slug].placeId;

  console.log(`→ ${b.name}`);
  const sources = await resolveSources(b);
  if (!sources.length) {
    console.warn(`  ⚠ Sin fuentes`);
    failed++;
    continue;
  }

  const gallery = await downloadGallery(b.slug, b.name, sources);
  if (!gallery.length) {
    console.warn(`  ⚠ Descarga fallida`);
    failed++;
    continue;
  }

  b.gallery = gallery;
  b.image = gallery[0].src;
  fixed++;
  console.log(`  ✓ ${gallery.length} foto(s)`);
  await sleep(250);
}

await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
const still = businesses.filter((b) => !b.image).length;
console.log(`\n✓ ${fixed} fichas con fotos nuevas · ${skipped} ya tenían · ${failed} sin éxito · ${still} aún sin foto`);
