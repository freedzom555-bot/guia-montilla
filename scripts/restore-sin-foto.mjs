/** Reintegra fichas eliminadas por sin-foto usando registry + Google Places. */
import { readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { localizeName, typesToSpanish, inferCategory, formatAccessibility, formatPayment, businessStatusEs } from "./lib/montilla.mjs";
import { richDescription, richTagline } from "./lib/descriptions.mjs";
import { HERITAGE_MANUAL } from "./lib/heritage-addresses.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
const AUDIT = join(ROOT, "data/montilla-audit.json");
const TURISMO = "+34 957 65 23 54";

function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, ".env"), "utf-8").split("\n")) {
      const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch { /* */ }
}
loadEnv();
const KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FIELD_MASK =
  "id,displayName,formattedAddress,shortFormattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,location,regularOpeningHours,currentOpeningHours,rating,userRatingCount,types,primaryType,businessStatus,accessibilityOptions,paymentOptions";

async function details(placeId) {
  const id = placeId.replace(/^places\//, "");
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=es`, {
    headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELD_MASK },
  });
  if (!res.ok) return null;
  return res.json();
}

function build(entry, place) {
  const manual = HERITAGE_MANUAL[entry.slug];
  const fb = entry.fallback ?? {};
  const name = localizeName(place?.displayName?.text ?? fb.name ?? entry.slug, fb, null);
  const placeTypes = typesToSpanish(place?.types ?? []);
  const category = inferCategory({ name, slug: entry.slug, placeTypes, types: place?.types ?? [] }) ?? entry.category;
  const b = {
    id: entry.slug,
    slug: entry.slug,
    name,
    category,
    address: manual?.address ?? place?.formattedAddress ?? fb.address ?? null,
    shortAddress: manual?.shortAddress ?? place?.shortFormattedAddress ?? null,
    phone: place?.internationalPhoneNumber ?? place?.nationalPhoneNumber ?? fb.phone ?? TURISMO,
    email: null,
    web: place?.websiteUri ?? fb.web ?? "https://www.montillaturismo.es/",
    googleMapsUrl: place?.googleMapsUri ?? null,
    placeId: (place?.id ?? entry.placeId)?.replace(/^places\//, ""),
    lat: manual?.lat ?? place?.location?.latitude ?? null,
    lng: manual?.lng ?? place?.location?.longitude ?? null,
    hours: place?.regularOpeningHours?.weekdayDescriptions?.join(" · ") ?? null,
    hoursList: place?.regularOpeningHours?.weekdayDescriptions ?? null,
    currentHours: place?.currentOpeningHours?.weekdayDescriptions ?? null,
    rating: place?.rating ?? null,
    reviewCount: place?.userRatingCount ?? null,
    priceRange: "€",
    social: [],
    featured: entry.featured ?? false,
    tags: [category.replace(/-/g, " "), "montilla"],
    placeTypes,
    primaryType: place?.primaryType ? typesToSpanish([place.primaryType])[0] : null,
    accessibility: formatAccessibility(place?.accessibilityOptions),
    payment: formatPayment(place?.paymentOptions),
    businessStatus: place?.businessStatus ?? "OPERATIONAL",
    businessStatusLabel: businessStatusEs(place?.businessStatus) ?? "Abierto",
    gallery: [],
    image: null,
  };
  b.description = richDescription(b);
  b.tagline = richTagline(b);
  return b;
}

const audit = JSON.parse(await readFile(AUDIT, "utf-8"));
const slugs = audit.removedList.filter((r) => r.reason === "sin-foto").map((r) => r.slug);
const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const existing = new Set(businesses.map((b) => b.slug));
const registry = Object.fromEntries(JSON.parse(await readFile(REG, "utf-8")).map((r) => [r.slug, r]));

let added = 0;
for (const slug of slugs) {
  if (existing.has(slug)) continue;
  const entry = registry[slug];
  if (!entry?.placeId) continue;
  await sleep(150);
  const place = await details(entry.placeId);
  businesses.push(build(entry, place));
  added++;
  console.log(`+ ${slug}`);
}

businesses.sort((a, b) => a.name.localeCompare(b.name, "es"));
await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
console.log(`\n✓ ${added} fichas reintegradas · ${businesses.length} total`);
