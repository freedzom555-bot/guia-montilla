/**
 * Genera índice de búsqueda inteligente (sinónimos, categorías, tipos).
 * Solo fichas ya filtradas de Montilla en businesses.json.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { keywordsForBusiness, CATEGORY_KEYWORDS, QUERY_TO_CATEGORIES } from "./lib/search-keywords.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const OUT = join(ROOT, "data/search-index.json");

const categories = JSON.parse(await readFile(join(ROOT, "data/categories.json"), "utf-8"));

const catLabels = Object.fromEntries(categories.map((c) => [c.id, c.name]));
const catSlugs = Object.fromEntries(categories.map((c) => [c.id, c.slug]));

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));

const index = businesses.map((b) => {
  const categoryLabel = catLabels[b.category] ?? b.category;
  const keywords = keywordsForBusiness(b, categoryLabel);
  return {
    slug: b.slug,
    name: b.name,
    tagline: b.tagline ?? "",
    category: b.category,
    categoryLabel,
    categoryUrl: `/${catSlugs[b.category] ?? b.category}/`,
    featured: Boolean(b.featured),
    keywords,
    searchBlob: [b.name, categoryLabel, b.tagline, ...(b.placeTypes ?? []), ...keywords]
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, ""),
  };
});

await writeFile(
  OUT,
  JSON.stringify(
    {
      version: 1,
      locale: "es",
      total: index.length,
      categoryKeywords: CATEGORY_KEYWORDS,
      queryToCategories: QUERY_TO_CATEGORIES,
      items: index,
    },
    null,
    2
  ),
  "utf-8"
);

console.log(`✓ Índice de búsqueda: ${index.length} fichas Montilla`);
