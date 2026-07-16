/**
 * Regenera descripciones, taglines, highlights y tips con enfoque editorial ampliado.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  richDescription,
  richTagline,
  richHighlights,
  richTips,
} from "./lib/descriptions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));

let updated = 0;
const next = businesses.map((b) => {
  const description = richDescription(b);
  const tagline = richTagline(b);
  const highlights = richHighlights(b);
  const tips = richTips(b);
  updated++;
  return {
    ...b,
    description,
    tagline,
    tips,
    highlights: highlights.length ? highlights : b.highlights,
  };
});

await writeFile(BIZ, JSON.stringify(next, null, 2), "utf-8");

const avg = Math.round(
  next.reduce((s, b) => s + (b.description?.length ?? 0), 0) / next.length,
);
console.log(`✓ Descripciones regeneradas: ${updated} fichas (media ${avg} caracteres)`);
