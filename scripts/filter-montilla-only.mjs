/**
 * Deja solo fichas de Montilla (14550). Elimina otros municipios (Aguilar, Baena, etc.).
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { distanceKm } from "./lib/montilla.mjs";
import { EXCLUDE_NOT_MONTILLA } from "./lib/exclusions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");

const OTHER_PHRASE =
  /puente genil|puentegenil|aguilar de la frontera|belalc[aá]zar|montemayor|14520 aguilar|baena, c[oó]rdoba|montoro,|lucena,|espejo,|doña menc[ií]a|nueva carteya|la carlota,|palma del r[ií]o|castro del r[ií]o|ca[nñ]ete de las torres/i;

const WRONG_POSTAL = /\b14500\b|\b14520\b|\b14530\b|\b14540\b|\b14720\b|\b14900\b|\b14920\b/;

function normalizeAddress(b) {
  if (b.address && /\b14450\b/.test(b.address) && /montilla/i.test(b.address)) {
    b.address = b.address.replace(/\b14450\b/g, "14550");
    if (b.shortAddress) b.shortAddress = b.shortAddress.replace(/\b14450\b/g, "14550");
  }
  return b;
}

function isOtherTown(b) {
  if (EXCLUDE_NOT_MONTILLA.has(b.slug)) return "lista-exclusion";

  const nameSlug = `${b.name} ${b.slug}`.toLowerCase();
  if (/aguilar-de-la-frontera|de aguilar de la frontera|en puente genil|castillo de belalcazar|castillo de montemayor|hipertextil baena/.test(nameSlug)) {
    return "otro-municipio-nombre";
  }

  const addr = b.address ?? "";
  if (OTHER_PHRASE.test(addr)) return "otro-municipio-direccion";
  if (WRONG_POSTAL.test(addr)) return "codigo-postal-ajeno";

  if (addr && !/montilla|14550/i.test(addr)) return "direccion-sin-montilla";

  // CP erróneo frecuente (14450 → Montilla es 14550) tras normalizar
  if (/\b14450\b/.test(addr)) return "codigo-postal-erroneo";

  // Solo coordenadas muy lejanas
  if (b.lat != null && b.lng != null && distanceKm(b.lat, b.lng) > 14) {
    return "fuera-municipio-gps";
  }

  return null;
}

function hasCompleteAddress(b) {
  const addr = (b.address ?? "").trim();
  if (!addr) return false;
  if (!/montilla|14550/i.test(addr)) return false;
  if (/^14550 Montilla, Córdoba/i.test(addr) && addr.length < 38) return false;
  if (!/\d/.test(addr) && !/\b(n-331|pk|av\.|calle|c\.|pl\.|paseo|carretera|glorieta|ron|trav)/i.test(addr)) {
    return false;
  }
  return true;
}

function hasPhone(b) {
  const p = (b.phone ?? "").replace(/\D/g, "");
  return p.length >= 9;
}

function missingFields(b) {
  const miss = [];
  if (!b.image && !b.gallery?.length) miss.push("foto");
  if (!hasPhone(b)) miss.push("teléfono");
  if (!hasCompleteAddress(b)) miss.push("dirección");
  if (!b.hours && !b.hoursList?.length) miss.push("horario");
  if (!b.googleMapsUrl && !b.placeId) miss.push("maps");
  return miss;
}

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const registry = JSON.parse(await readFile(REG, "utf-8"));
const regBySlug = Object.fromEntries(registry.map((r) => [r.slug, r]));

const kept = [];
const removed = [];

for (const b of businesses) {
  normalizeAddress(b);
  const reason = isOtherTown(b);
  if (reason) {
    removed.push({ slug: b.slug, name: b.name, reason, address: b.address });
    if (regBySlug[b.slug]) {
      regBySlug[b.slug].excluded = true;
      regBySlug[b.slug].excludeReason = reason;
    }
    continue;
  }

  if (!hasPhone(b) || !hasCompleteAddress(b)) {
    const miss = [];
    if (!hasPhone(b)) miss.push("teléfono");
    if (!hasCompleteAddress(b)) miss.push("dirección");
    removed.push({ slug: b.slug, name: b.name, reason: `sin-${miss.join("-y-")}`, address: b.address });
    if (regBySlug[b.slug]) {
      regBySlug[b.slug].excluded = true;
      regBySlug[b.slug].excludeReason = `sin-${miss.join("-y-")}`;
    }
    continue;
  }

  // Sin foto: se publica igual (mejor sin imagen que foto incorrecta)
  if (regBySlug[b.slug]) {
    delete regBySlug[b.slug].excluded;
    delete regBySlug[b.slug].excludeReason;
  }
  kept.push(b);
}

const incomplete = kept
  .map((b) => ({
    slug: b.slug,
    name: b.name,
    category: b.category,
    missing: missingFields(b),
    phone: b.phone ?? null,
    address: b.address ?? null,
  }))
  .filter((x) => x.missing.length > 0)
  .sort((a, b) => b.missing.length - a.missing.length);

const report = {
  kept: kept.length,
  removed: removed.length,
  removedList: removed,
  incompleteCount: incomplete.length,
  incomplete,
  byMissing: {
    foto: incomplete.filter((x) => x.missing.includes("foto")).length,
    telefono: incomplete.filter((x) => x.missing.includes("teléfono")).length,
    direccion: incomplete.filter((x) => x.missing.includes("dirección")).length,
    horario: incomplete.filter((x) => x.missing.includes("horario")).length,
    maps: incomplete.filter((x) => x.missing.includes("maps")).length,
  },
};

await writeFile(BIZ, JSON.stringify(kept, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");
await writeFile(join(ROOT, "data/montilla-audit.json"), JSON.stringify(report, null, 2), "utf-8");

console.log(`✓ ${kept.length} fichas publicadas · ${removed.length} eliminadas\n`);
const byReason = {};
for (const r of removed) byReason[r.reason] = (byReason[r.reason] || 0) + 1;
console.log("Motivos:", byReason);
for (const r of removed.filter((x) => !x.reason.startsWith("sin-"))) {
  console.log(`  ✗ ${r.slug} — ${r.reason}`);
}
console.log(`\n📋 Restantes con algún dato opcional incompleto: ${incomplete.length}`);
if (incomplete.length) console.log("Resumen:", report.byMissing);
