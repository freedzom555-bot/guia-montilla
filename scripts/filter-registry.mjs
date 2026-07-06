/**
 * Filtra place-registry.json: solo Montilla (14550), sin basura ni pueblos vecinos.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isStrictMontilla, shouldSkipPlace } from "./lib/montilla.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REG = join(ROOT, "data/place-registry.json");

const registry = JSON.parse(await readFile(REG, "utf-8"));
const kept = [];
const removed = [];

for (const entry of registry) {
  if (entry.curated) {
    kept.push(entry);
    continue;
  }
  const name = entry.fallback?.name ?? entry.slug.replace(/-/g, " ");
  if (shouldSkipPlace(name, [])) {
    removed.push({ slug: entry.slug, reason: "nombre basura" });
    continue;
  }
  if (/^(calle-|cajero-|parking-|atm-)/i.test(entry.slug)) {
    removed.push({ slug: entry.slug, reason: "slug basura" });
    continue;
  }
  kept.push(entry);
}

await writeFile(REG, JSON.stringify(kept, null, 2), "utf-8");
console.log(`✓ ${kept.length} entradas conservadas, ${removed.length} eliminadas`);
if (removed.length) {
  console.log("Eliminados:", removed.slice(0, 20).map((r) => r.slug).join(", "), removed.length > 20 ? "…" : "");
}
