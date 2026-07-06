/**
 * Audita: solo Montilla + fotos no compartidas entre fichas distintas.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import { distanceKm } from "./lib/montilla.mjs";
import { EXCLUDE_NOT_MONTILLA } from "./lib/exclusions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const IMG = join(ROOT, "public/images/negocios");

const OTHER_PHRASE =
  /puente genil|puentegenil|aguilar de la frontera|belalc[aá]zar|montemayor|14520 aguilar|baena, c[oó]rdoba|montoro,|lucena,|espejo,|doña menc[ií]a|nueva carteya|la carlota,|palma del r[ií]o|castro del r[ií]o|ca[nñ]ete de las torres/i;
const WRONG_POSTAL = /\b14500\b|\b14520\b|\b14530\b|\b14540\b|\b14720\b|\b14900\b|\b14920\b|\b14450\b/;

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
  if (b.lat != null && b.lng != null && distanceKm(b.lat, b.lng) > 14) return "fuera-municipio-gps";
  return null;
}

function walkImages(dir, acc = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walkImages(p, acc);
    else if (/\.(jpe?g|png|webp)$/i.test(f)) acc.push(p);
  }
  return acc;
}

const businesses = JSON.parse(readFileSync(BIZ, "utf-8"));
const hashToFiles = new Map();

for (const file of walkImages(IMG)) {
  const buf = readFileSync(file);
  const h = createHash("md5").update(buf).digest("hex");
  const rel = file.replace(/\\/g, "/").replace(/^public/, "");
  if (!hashToFiles.has(h)) hashToFiles.set(h, []);
  hashToFiles.get(h).push(rel);
}

const crossSlugDupes = [];
for (const [hash, files] of hashToFiles) {
  const slugs = [...new Set(files.map((f) => f.split("/")[3]).filter(Boolean))];
  if (slugs.length > 1) crossSlugDupes.push({ hash, slugs, files, size: files.length });
}
crossSlugDupes.sort((a, b) => b.slugs.length - a.slugs.length);

const slugToShared = new Map();
for (const d of crossSlugDupes) {
  for (const slug of d.slugs) {
    if (!slugToShared.has(slug)) slugToShared.set(slug, []);
    slugToShared.get(slug).push({ hash: d.hash, with: d.slugs.filter((s) => s !== slug), file: d.files.find((f) => f.includes(`/${slug}/`)) });
  }
}

const notMontilla = businesses.filter((b) => isOtherTown(b)).map((b) => ({ slug: b.slug, name: b.name, reason: isOtherTown(b), address: b.address }));

const pathMismatch = [];
const missingFiles = [];
const noPlaceId = [];
const suspiciousSource = [];

for (const b of businesses) {
  if (!b.placeId) noPlaceId.push({ slug: b.slug, name: b.name });
  const imgs = [...new Set([b.image, ...(b.gallery ?? []).map((g) => g.src)].filter(Boolean))];
  for (const src of imgs) {
    const expected = `/images/negocios/${b.slug}/`;
    if (src.startsWith("/images/negocios/") && !src.includes(`/${b.slug}/`)) {
      pathMismatch.push({ slug: b.slug, src });
    }
    if (!existsSync(join(ROOT, "public", src))) missingFiles.push({ slug: b.slug, src });
  }
  for (const g of b.gallery ?? []) {
    const alt = (g.alt ?? "").toLowerCase();
    if (/bodegas alvear|bodegas doblas|bodegas olivares|castillo de montilla|convento de santa clara|parroquia santiago|campo de viñedos|fino montilla|cortijo san francisco|hospital de montilla/.test(alt)) {
      const nameLow = b.name.toLowerCase();
      const mentionsSelf =
        alt.includes(nameLow.slice(0, Math.min(12, nameLow.length))) ||
        (b.slug.includes("alvear") && alt.includes("alvear")) ||
        (b.slug.includes("castillo") && alt.includes("castillo")) ||
        (b.slug.includes("santa-clara") && alt.includes("santa clara")) ||
        (b.slug.includes("santiago") && alt.includes("santiago"));
      if (!mentionsSelf) suspiciousSource.push({ slug: b.slug, name: b.name, alt: g.alt, src: g.src });
    }
  }
}

const report = {
  total: businesses.length,
  notMontilla,
  crossSlugDuplicateGroups: crossSlugDupes.length,
  fichasWithSharedPhotos: slugToShared.size,
  pathMismatch,
  missingFiles,
  noPlaceId: noPlaceId.length,
  suspiciousGenericAlts: suspiciousSource.length,
  crossSlugDupes: crossSlugDupes.slice(0, 100),
  fichasWithSharedPhotosList: [...slugToShared.entries()].map(([slug, shares]) => ({
    slug,
    name: businesses.find((b) => b.slug === slug)?.name,
    sharedWith: [...new Set(shares.flatMap((s) => s.with))],
    count: shares.length,
  })),
  suspiciousGenericAltsList: suspiciousSource,
};

await writeFile(join(ROOT, "data/photo-audit.json"), JSON.stringify(report, null, 2), "utf-8");

console.log(`Fichas: ${businesses.length}`);
console.log(`No Montilla: ${notMontilla.length}`);
console.log(`Grupos foto idéntica entre fichas: ${crossSlugDupes.length}`);
console.log(`Fichas con fotos compartidas: ${slugToShared.size}`);
console.log(`Ruta imagen ≠ slug: ${pathMismatch.length}`);
console.log(`Archivos missing: ${missingFiles.length}`);
console.log(`Sin placeId: ${noPlaceId.length}`);
console.log(`Alt sospechoso (foto de otro sitio): ${suspiciousSource.length}`);

if (notMontilla.length) {
  console.log("\n--- Fuera Montilla ---");
  notMontilla.forEach((x) => console.log(`  ${x.slug} (${x.reason})`));
}

if (slugToShared.size) {
  console.log("\n--- Top fichas con fotos mezcladas ---");
  report.fichasWithSharedPhotosList
    .sort((a, b) => b.sharedWith.length - a.sharedWith.length)
    .slice(0, 25)
    .forEach((x) => console.log(`  ${x.slug} ↔ ${x.sharedWith.slice(0, 5).join(", ")}${x.sharedWith.length > 5 ? "…" : ""}`));
}

if (suspiciousSource.length) {
  console.log("\n--- Alt genérico / foto ajena ---");
  suspiciousSource.slice(0, 20).forEach((x) => console.log(`  ${x.slug}: ${x.alt}`));
}

console.log("\n→ Informe: data/photo-audit.json");
