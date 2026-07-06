/**
 * Descarga fotos reales de Montilla (Wikimedia Commons) y actualiza businesses.json
 */
import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MAP_FILE = join(ROOT, "data/image-map.json");
const BIZ_FILE = join(ROOT, "data/businesses.json");
const PUBLIC = join(ROOT, "public/images");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadCurl(url, dest) {
  await mkdir(dirname(dest), { recursive: true });
  await exec("curl.exe", [
    "-sL",
    "--max-time", "60",
    "--retry", "3",
    "--retry-delay", "2",
    "-A", "GuiaMontillaBot/1.0 (https://github.com/guia-montilla; local directory)",
    "-o", dest,
    url,
  ]);
  const stat = await readFile(dest).then((b) => b.length).catch(() => 0);
  if (stat < 5000) throw new Error(`archivo demasiado pequeño (${stat} bytes)`);
  return stat;
}

async function fetchOne(url, dest, label) {
  if (await exists(dest)) {
    const buf = await readFile(dest);
    if (buf.length > 5000) {
      console.log(`  · ${label} (ya existe, ${Math.round(buf.length / 1024)} KB)`);
      return true;
    }
  }
  try {
    await sleep(1200);
    const size = await downloadCurl(url, dest);
    console.log(`  ✓ ${label} (${Math.round(size / 1024)} KB)`);
    return true;
  } catch (e) {
    console.warn(`  ✗ ${label}: ${e.message}`);
    return false;
  }
}

async function main() {
  const map = JSON.parse(await readFile(MAP_FILE, "utf-8"));
  const businesses = JSON.parse(await readFile(BIZ_FILE, "utf-8"));

  await mkdir(join(PUBLIC, "hero"), { recursive: true });
  await mkdir(join(PUBLIC, "categories"), { recursive: true });
  await mkdir(join(PUBLIC, "negocios"), { recursive: true });

  console.log("Descargando hero y categorías…");
  for (const [name, meta] of Object.entries(map.hero)) {
    await fetchOne(meta.url, join(PUBLIC, "hero", `${name}.jpg`), `hero/${name}.jpg`);
  }
  for (const [name, meta] of Object.entries(map.categories)) {
    await fetchOne(meta.url, join(PUBLIC, "categories", `${name}.jpg`), `categories/${name}.jpg`);
  }
  await fetchOne(map.og.url, join(PUBLIC, "og-default.jpg"), "og-default.jpg");

  console.log("Descargando fotos de negocios (51 fichas)…");
  const counts = {};
  const fallbackPool = join(PUBLIC, "hero", "vinedo.jpg");

  for (const b of businesses) {
    const url =
      map.businesses[b.slug] ??
      map.categoryFallbacks[b.category]?.[counts[b.category] ?? 0] ??
      map.categories[b.category]?.url;
    counts[b.category] = (counts[b.category] ?? 0) + 1;

    const dest = join(PUBLIC, "negocios", `${b.slug}.jpg`);
    const ok = url ? await fetchOne(url, dest, b.slug) : false;

    if (!ok && (await exists(fallbackPool))) {
      await copyFile(fallbackPool, dest);
      console.log(`  ↪ ${b.slug} → fallback local`);
    }
    b.image = `/images/negocios/${b.slug}.jpg`;
  }

  await writeFile(BIZ_FILE, JSON.stringify(businesses, null, 2), "utf-8");
  console.log(`\n✓ ${businesses.length} negocios con rutas de imagen actualizadas`);
}

main();
