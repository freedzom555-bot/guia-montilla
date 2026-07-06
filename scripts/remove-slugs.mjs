/** Elimina slugs del directorio y marca excluded en registry. */
import { readFile, writeFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error("Uso: node scripts/remove-slugs.mjs slug1 slug2 …");
  process.exit(1);
}

const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
const IMG = join(ROOT, "public/images/negocios");
const remove = new Set(slugs);

const businesses = JSON.parse(await readFile(BIZ, "utf-8")).filter((b) => !remove.has(b.slug));
const registry = JSON.parse(await readFile(REG, "utf-8")).map((r) =>
  remove.has(r.slug) ? { ...r, excluded: true, excludeReason: "eliminado-manual" } : r
);

for (const slug of slugs) {
  try {
    await rm(join(IMG, slug), { recursive: true, force: true });
  } catch { /* */ }
}

await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");
console.log(`✓ Eliminados: ${slugs.join(", ")} · ${businesses.length} fichas restantes`);
