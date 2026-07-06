/**
 * Elimina duplicados: mismo placeId, lista manual o nombre muy parecido.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
const CURATED = join(ROOT, "data/place-registry.curated.json");

const MANUAL_DUPLICATE_OF = {
  "lagar-canada-navarro-insensatos": "bodegas-canada-navarro",
  "lagar-los-raigones": "bodegas-los-raigones",
  "casa-del-inca-garcilaso": "casa-del-inca",
  "asador-la-plaza-de-montilla": "asador-la-plaza",
  "restaurante-taberna-la-chiva": "taberna-la-chiva",
  "ruta-del-vino-montilla-moriles": "ayuntamiento-de-montilla",
  "comercial-los-raigones": "bodegas-los-raigones",
  "monasterio-de-santa-clara": "convento-santa-clara",
  "lugar-oiun1fbg": "estetica-avanzada-y-spa-capilar-mireia-torreblanca",
  "cocinamovil-comida-casera-para-llevar": "flamenquincordobes-com",
  "perez-barquero": "bodegas-perez-barquero",
  "coviran": "coviran-qlikbs",
  "mercadona-rpl9qg": "mercadona",
  "supermercados-el-jamon-ln2g-g": "supermercados-el-jamon",
  "flores-eva-s-l-czzars": "flores-eva-s-l",
  "bbva-292mka": "bbva",
  "kutxabank-cwhdgi": "kutxabank",
  "unicaja-banco-orvcsg": "unicaja-banco",
  "oficina-caja-rural-del-sur-b7eueq": "oficina-caja-rural-del-sur",
  "oficina-de-correos-1i1e_i": "oficina-de-correos",
  "estacion-de-servicio-repsol-1bjrpm": "estacion-de-servicio-repsol",
  "estacion-de-servicio-cepsa": "estacion-de-servicio-cepsa-cmrri4",
  "parque-infantil-qlsejw": "parque-infantil",
};

function normalizeName(name) {
  return (name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\b(s\.?l\.?u?\.?|s\.?l\.?|s\.?a\.?|cb|sca)\b/gi, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isGenericAddress(addr) {
  if (!addr) return true;
  const a = addr.toLowerCase().replace(/, españa$/, "").trim();
  if (a.length < 12) return true;
  if (/^14550 montilla/i.test(a) && !/\d/.test(a.split("montilla")[1] ?? "")) return true;
  if (!/\d/.test(a) && !/\b(n-331|pk|av\.|calle|c\.|pl\.|paseo|carretera)/i.test(a)) return true;
  return false;
}

function addressKey(addr) {
  if (!addr || isGenericAddress(addr)) return "generic";
  return addr
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 48);
}

function hasPhotos(b) {
  return Boolean(b.image || b.gallery?.length);
}

function qualityScore(b, curated) {
  let s = 0;
  if (hasPhotos(b)) s += 2000 + (b.gallery?.length ?? 0) * 40;
  if (curated.has(b.slug)) s += 200;
  if (b.featured) s += 100;
  if (!isGenericAddress(b.address)) s += 150;
  s += Math.min(b.reviewCount ?? 0, 500);
  s += (b.rating ?? 0) * 10;
  if (b.web) s += 30;
  if (b.phone) s += 20;
  if (!/-[a-z0-9_]{4,12}$/i.test(b.slug)) s += 40;
  s -= Math.min(b.slug.length, 80);
  if (/^lugar-|^\.+$|^[-\s]+$/.test(b.slug) || /^[-\s.]+$/.test(b.name ?? "")) s -= 5000;
  return s;
}

function score(slug, curated) {
  let s = 0;
  if (curated.has(slug)) s += 100;
  if (slug.length < 40) s += 10;
  return s;
}

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const registry = JSON.parse(await readFile(REG, "utf-8"));
const curated = new Set(JSON.parse(await readFile(CURATED, "utf-8")).map((r) => r.slug));

const duplicateOf = new Map(Object.entries(MANUAL_DUPLICATE_OF));
const removed = [];

// Mismo placeId
const byPlaceId = new Map();
for (const b of businesses) {
  if (!b.placeId) continue;
  if (!byPlaceId.has(b.placeId)) byPlaceId.set(b.placeId, []);
  byPlaceId.get(b.placeId).push(b);
}

for (const [, group] of byPlaceId) {
  if (group.length < 2) continue;
  group.sort(
    (a, b) =>
      qualityScore(b, curated) - qualityScore(a, curated) ||
      score(b.slug, curated) - score(a.slug, curated)
  );
  const keep = group[0].slug;
  for (const dup of group.slice(1)) {
    if (!duplicateOf.has(dup.slug)) duplicateOf.set(dup.slug, keep);
  }
}

// Nombre normalizado parecido
const byName = new Map();
for (const b of businesses) {
  const key = normalizeName(b.name);
  if (!key || key.length < 3 || /^[-\s.]+$/.test(key)) continue;
  if (!byName.has(key)) byName.set(key, []);
  byName.get(key).push(b);
}

for (const [, group] of byName) {
  if (group.length < 2) continue;
  group.sort((a, b) => qualityScore(b, curated) - qualityScore(a, curated));

  const kept = [];
  for (const b of group) {
    if (duplicateOf.has(b.slug)) continue;
    const addr = addressKey(b.address);
    const clash = kept.find((k) => {
      const kAddr = addressKey(k.address);
      if (addr !== "generic" && kAddr !== "generic" && addr !== kAddr) return false;
      return true;
    });
    if (clash) {
      duplicateOf.set(b.slug, clash.slug);
    } else {
      kept.push(b);
    }
  }
}

const keepSlugs = new Set();
for (const b of businesses) {
  const canonical = duplicateOf.get(b.slug);
  if (canonical) {
    removed.push({ slug: b.slug, name: b.name, reason: "nombre-duplicado", keep: canonical });
    continue;
  }
  if (/^lugar-/.test(b.slug) || /^[-\s.]+$/.test(b.name ?? "")) {
    removed.push({ slug: b.slug, name: b.name, reason: "basura", keep: null });
    continue;
  }
  keepSlugs.add(b.slug);
}

const filtered = businesses.filter((b) => keepSlugs.has(b.slug));

for (const r of registry) {
  const canonical = duplicateOf.get(r.slug);
  if (canonical) r.duplicateOf = canonical;
}

await writeFile(BIZ, JSON.stringify(filtered, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");

console.log(`✓ ${filtered.length} fichas (${removed.length} duplicados eliminados)\n`);
for (const r of removed) {
  console.log(`  ✗ ${r.slug}${r.keep ? ` → ${r.keep}` : ""}`);
}

const pids = new Map();
for (const b of filtered) {
  if (!b.placeId) continue;
  pids.set(b.placeId, (pids.get(b.placeId) || 0) + 1);
}
const left = [...pids.entries()].filter(([, n]) => n > 1);
if (left.length) console.warn("\n⚠ placeId repetidos:", left);
else console.log("\n✓ Sin placeId duplicados");
