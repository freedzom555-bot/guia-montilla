/**
 * Descarga fotos del negocio (no genéricas de Montilla) + galería por ficha.
 * Fuentes: webs oficiales (og:image) + Wikimedia del negocio/categoría.
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MAP = join(ROOT, "data/image-map.json");
const BIZ = join(ROOT, "data/businesses.json");
const IMG_ROOT = join(ROOT, "public/images/negocios");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function curlDownload(url, dest) {
  await mkdir(dirname(dest), { recursive: true });
  await exec("curl.exe", [
    "-sL", "--max-time", "45", "--retry", "2", "--retry-delay", "2",
    "-A", "GuiaMontillaBot/1.0 (+local directory)",
    "-o", dest, url,
  ]);
  const buf = await readFile(dest);
  if (buf.length < 4000) throw new Error(`archivo inválido (${buf.length} B)`);
  return buf.length;
}

async function fetchHtml(url) {
  const { stdout } = await exec("curl.exe", [
    "-sL", "--max-time", "20",
    "-A", "GuiaMontillaBot/1.0",
    url,
  ]);
  return stdout;
}

function extractOgImages(html, baseUrl) {
  const found = [];
  const patterns = [
    /property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/gi,
    /content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/gi,
    /name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) {
      try {
        found.push(new URL(m[1], baseUrl).href);
      } catch { /* skip */ }
    }
  }
  return [...new Set(found)];
}

async function downloadGallery(slug, items) {
  const dir = join(IMG_ROOT, slug);
  await mkdir(dir, { recursive: true });
  const gallery = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const file = `${String(i + 1).padStart(2, "0")}.jpg`;
    const dest = join(dir, file);
    try {
      await sleep(900);
      await curlDownload(item.url, dest);
      gallery.push({ src: `/images/negocios/${slug}/${file}`, alt: item.alt });
      console.log(`    ✓ ${file} — ${item.alt}`);
    } catch (e) {
      console.warn(`    ✗ ${file}: ${e.message}`);
    }
    if (gallery.length >= 4) break;
  }

  return gallery;
}

async function buildSources(b, map) {
  const sources = [];
  const seen = new Set();

  const push = (url, alt) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    sources.push({ url, alt });
  };

  if (b.web) {
    try {
      const html = await fetchHtml(b.web);
      for (const u of extractOgImages(html, b.web)) {
        push(u, `${b.name} — foto oficial`);
      }
    } catch (e) {
      console.warn(`  web ${b.slug}: ${e.message}`);
    }
  }

  const mapped = map.galleries?.[b.slug] ?? [];
  for (const item of mapped) push(item.url, item.alt);

  if (sources.length === 0 && map.businesses?.[b.slug]) {
    push(map.businesses[b.slug], b.name);
  }

  const pool = map.categoryPools?.[b.category] ?? [];
  for (const item of pool) {
    if (sources.length >= 4) break;
    push(item.url, item.alt.replace("{name}", b.name));
  }

  return sources.slice(0, 4);
}

async function main() {
  const map = JSON.parse(await readFile(MAP, "utf-8"));
  const businesses = JSON.parse(await readFile(BIZ, "utf-8"));

  console.log("Descargando fotos de negocios (galería por ficha)…\n");

  for (const b of businesses) {
    console.log(`→ ${b.name}`);
    const sources = await buildSources(b, map);
    const gallery = await downloadGallery(b.slug, sources);

    if (gallery.length === 0) {
      console.warn(`  ⚠ Sin fotos para ${b.slug}`);
      continue;
    }

    b.gallery = gallery;
    b.image = gallery[0].src;
  }

  await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
  console.log(`\n✓ ${businesses.length} negocios con galería`);
}

main();
