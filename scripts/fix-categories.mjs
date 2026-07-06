/**
 * Recoloca cada ficha en su sección correcta según tipos y nombre.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { inferCategory } from "./lib/montilla.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const registry = JSON.parse(await readFile(REG, "utf-8"));
const regBySlug = Object.fromEntries(registry.map((r) => [r.slug, r]));

let moved = 0;
for (const b of businesses) {
  const entry = regBySlug[b.slug];
  const inferred = inferCategory({
    name: b.name,
    slug: b.slug,
    placeTypes: b.placeTypes ?? [],
    types: entry?.types ?? [],
  });
  if (inferred) {
    if (inferred !== b.category) {
      console.log(`  ${b.slug}: ${b.category} → ${inferred}`);
      moved++;
    }
    b.category = inferred;
    if (regBySlug[b.slug]) regBySlug[b.slug].category = inferred;
  }
}

for (const r of registry) {
  const biz = businesses.find((b) => b.slug === r.slug);
  if (biz) r.category = biz.category;
  else {
    const inferred = inferCategory({
      name: r.fallback?.name ?? r.slug,
      slug: r.slug,
      placeTypes: [],
      types: [],
    });
    if (inferred && inferred !== r.category) {
      r.category = inferred;
      moved++;
    }
  }
}

await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");
console.log(`✓ ${moved} fichas recategorizadas`);
