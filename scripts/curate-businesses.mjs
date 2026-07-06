/**
 * Organiza fichas: sección correcta + descripción larga. No elimina negocios reales.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { inferCategory } from "./lib/montilla.mjs";
import { richDescription, richTagline } from "./lib/descriptions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");

/** Solo duplicados confirmados o basura — no negocios reales. */
const REMOVE_SLUGS = new Set([
  "prueba",
  "lagar-los-raigones",
  "lagar-canada-navarro-insensatos",
  "casa-del-inca-garcilaso",
  "asador-la-plaza-de-montilla",
  "restaurante-taberna-la-chiva",
  "comercial-los-raigones",
  "monasterio-de-santa-clara",
  "ruta-del-vino-montilla-moriles",
  "perez-barquero",
  "montilla-moriles",
  "lugar-oiun1fbg",
  "paseo-de-cervantes-24-parking",
  "paseo-de-cervantes-4-parking",
]);

function shouldKeep(b) {
  if (REMOVE_SLUGS.has(b.slug)) return { keep: false, reason: "duplicado-o-basura" };

  const n = `${b.name} ${b.slug}`.toLowerCase();
  if (/^\.|unnamed|sin nombre|^calle |^cajero|^atm |^parking|^aparcamiento/.test(n)) {
    return { keep: false, reason: "basura" };
  }

  const category = inferCategory({
    name: b.name,
    slug: b.slug,
    placeTypes: b.placeTypes ?? [],
  });

  if (!category) return { keep: false, reason: "categoria-invalida" };

  return { keep: true, category };
}

const raw = JSON.parse(await readFile(BIZ, "utf-8"));
const registry = JSON.parse(await readFile(REG, "utf-8"));
const regBySlug = Object.fromEntries(registry.map((r) => [r.slug, r]));

const organized = [];
const removed = [];

for (const b of raw) {
  const decision = shouldKeep(b);
  if (!decision.keep) {
    removed.push({ slug: b.slug, name: b.name, reason: decision.reason });
    continue;
  }

  const category = decision.category;
  const description = richDescription({ ...b, category });
  const tagline = richTagline({ ...b, category });

  organized.push({
    ...b,
    category,
    description,
    tagline,
    tags: b.tags ?? [category.replace(/-/g, " "), "montilla"],
  });

  if (regBySlug[b.slug]) regBySlug[b.slug].category = category;
}

organized.sort((a, b) => a.name.localeCompare(b.name, "es"));

for (const r of registry) {
  if (REMOVE_SLUGS.has(r.slug) || removed.some((x) => x.slug === r.slug)) {
    r.excluded = true;
  } else {
    delete r.excluded;
  }
}

await writeFile(BIZ, JSON.stringify(organized, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");
await writeFile(
  join(ROOT, "data/curate-report.json"),
  JSON.stringify(
    {
      kept: organized.length,
      removed,
      byCategory: organized.reduce((a, b) => {
        a[b.category] = (a[b.category] || 0) + 1;
        return a;
      }, {}),
    },
    null,
    2
  ),
  "utf-8"
);

console.log(`✓ ${organized.length} fichas organizadas, ${removed.length} duplicados/basura eliminados\n`);
const byCat = {};
organized.forEach((b) => {
  byCat[b.category] = (byCat[b.category] || 0) + 1;
});
console.log("Por sección:", byCat);
