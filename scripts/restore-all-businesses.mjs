/**
 * Restaura todas las fichas del registry en businesses.json (sin llamar a Google).
 * Reutiliza datos existentes y galerías en public/images/negocios/.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { inferCategory, shouldSkipPlace } from "./lib/montilla.mjs";
import { EXCLUDE_NOT_MONTILLA } from "./lib/exclusions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REG = join(ROOT, "data/place-registry.json");
const BIZ = join(ROOT, "data/businesses.json");
const IMG = join(ROOT, "public/images/negocios");

async function galleryFor(slug, name) {
  try {
    const files = (await readdir(join(IMG, slug)))
      .filter((f) => /\.(jpe?g|webp|png)$/i.test(f))
      .sort();
    return files.map((f, i) => ({
      src: `/images/negocios/${slug}/${f}`,
      alt: `${name} — foto ${i + 1}`,
    }));
  } catch {
    return [];
  }
}

function displayName(entry, existing) {
  if (existing?.name) return existing.name;
  return entry.fallback?.name ?? entry.slug.replace(/-/g, " ");
}

function buildRecord(entry, existing, gallery) {
  const name = displayName(entry, existing);
  const category =
    inferCategory({
      name,
      slug: entry.slug,
      placeTypes: existing?.placeTypes ?? [],
      types: entry.types ?? [],
    }) ?? entry.category ?? "comercios";

  const base = existing ?? {};
  return {
    id: entry.slug,
    slug: entry.slug,
    name,
    category,
    tagline: base.tagline ?? `${name} en Montilla (Córdoba).`,
    description: base.description ?? `${name} en Montilla (14550), Córdoba.`,
    address: base.address ?? "14550 Montilla, Córdoba, España",
    shortAddress: base.shortAddress ?? null,
    phone: base.phone ?? entry.fallback?.phone ?? null,
    email: base.email ?? null,
    web: base.web ?? entry.fallback?.web ?? null,
    googleMapsUrl:
      base.googleMapsUrl ??
      (entry.placeId
        ? `https://www.google.com/maps/place/?q=place_id:${entry.placeId}`
        : null),
    placeId: base.placeId ?? entry.placeId ?? null,
    lat: base.lat ?? entry.fallback?.lat ?? null,
    lng: base.lng ?? entry.fallback?.lng ?? null,
    hours: base.hours ?? null,
    hoursList: base.hoursList ?? null,
    currentHours: base.currentHours ?? null,
    rating: base.rating ?? null,
    reviewCount: base.reviewCount ?? null,
    priceRange: base.priceRange ?? null,
    social: base.social ?? [],
    featured: entry.featured ?? base.featured ?? false,
    tags: base.tags ?? [category.replace(/-/g, " "), "montilla"],
    placeTypes: base.placeTypes ?? [],
    primaryType: base.primaryType ?? null,
    accessibility: base.accessibility ?? null,
    payment: base.payment ?? null,
    businessStatus: base.businessStatus ?? null,
    businessStatusLabel: base.businessStatusLabel ?? null,
    turismoUrl: entry.turismoSlug ? `https://www.montillaturismo.es/${entry.turismoSlug}` : base.turismoUrl ?? null,
    gallery,
    image: gallery[0]?.src ?? base.image ?? null,
    highlights: base.highlights ?? null,
    tips: base.tips ?? null,
  };
}

const registry = JSON.parse(await readFile(REG, "utf-8"));
let existing = [];
try {
  existing = JSON.parse(await readFile(BIZ, "utf-8"));
} catch {
  /* vacío */
}
const bySlug = Object.fromEntries(existing.map((b) => [b.slug, b]));

const restored = [];
let skipped = 0;

for (const entry of registry) {
  if (entry.duplicateOf) continue;
  if (EXCLUDE_NOT_MONTILLA.has(entry.slug)) {
    entry.excluded = true;
    continue;
  }

  delete entry.excluded;
  delete entry.excludeReason;

  const name = displayName(entry, bySlug[entry.slug]);
  if (shouldSkipPlace(name, entry.types ?? [])) {
    skipped++;
    continue;
  }
  if (/^(calle-|cajero-|parking-|atm-|prueba$)/i.test(entry.slug)) {
    skipped++;
    continue;
  }

  const gallery = await galleryFor(entry.slug, name);
  restored.push(buildRecord(entry, bySlug[entry.slug], gallery));
}

restored.sort((a, b) => a.name.localeCompare(b.name, "es"));

await writeFile(BIZ, JSON.stringify(restored, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");

console.log(`✓ ${restored.length} fichas restauradas (${skipped} omitidas por basura)\n`);
