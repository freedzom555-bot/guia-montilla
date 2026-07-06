/**
 * Regenera descripciones, taglines y highlights con el nuevo enfoque editorial.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { richDescription, richTagline, richHighlights } from "./lib/descriptions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));

let updated = 0;
const next = businesses.map((b) => {
  const description = richDescription(b);
  const tagline = richTagline(b);
  const highlights = richHighlights(b);
  updated++;
  return { ...b, description, tagline, highlights: highlights.length ? highlights : b.highlights };
});

await writeFile(BIZ, JSON.stringify(next, null, 2), "utf-8");
console.log(`✓ Descripciones regeneradas: ${updated} fichas`);
