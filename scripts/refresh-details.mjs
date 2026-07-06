/**
 * Actualiza datos de Google (español, horarios, accesibilidad…) sin re-descargar fotos.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isStrictMontilla,
  localizeName,
  typesToSpanish,
  formatAccessibility,
  formatPayment,
  businessStatusEs,
} from "./lib/montilla.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

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
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FIELD_MASK =
  "id,displayName,formattedAddress,shortFormattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,location,regularOpeningHours,currentOpeningHours,rating,userRatingCount,priceLevel,editorialSummary,types,primaryType,businessStatus,accessibilityOptions,paymentOptions";

async function details(placeId) {
  const id = placeId.replace(/^places\//, "");
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=es`, {
    headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELD_MASK },
  });
  if (!res.ok) return null;
  return res.json();
}

function priceFromLevel(level) {
  if (level == null) return null;
  return "€".repeat(Math.min(Math.max(level, 1), 4));
}

function enrichDescription(name, category, editorial, existing) {
  if (editorial && !existing?.includes(editorial.slice(0, 50))) {
    return editorial + (existing ? `\n\n${existing}` : "");
  }
  if (existing && existing.length > 80) return existing;
  const hints = {
    bodegas: `${name} es una bodega de la D.O. Montilla-Moriles en Montilla (Córdoba). El vino de la zona —fino, amontillado, oloroso y Pedro Ximénez— se elabora con uva local bajo el sistema de criaderas y soleras.`,
    restaurantes: `${name} es un establecimiento de hostelería en Montilla (14550), en el corazón de la comarca del vino Montilla-Moriles.`,
    monumentos: `${name} forma parte del patrimonio histórico y cultural de Montilla, localidad vinculada al Inca Garcilaso y a la tradición vitivinícola.`,
    parques: `${name} es un espacio verde de Montilla, ideal para pasear en familia o descansar entre visitas al casco y las bodegas.`,
  };
  return hints[category] ?? existing ?? `${name} en Montilla (Córdoba).`;
}

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const reg = Object.fromEntries(JSON.parse(await readFile(REG, "utf-8")).map((r) => [r.slug, r]));

let updated = 0;
let skipped = 0;

for (const b of businesses) {
  const entry = reg[b.slug];
  const placeId = b.placeId ?? entry?.placeId;
  if (!placeId) {
    skipped++;
    continue;
  }
  const place = await details(placeId);
  if (!place || !isStrictMontilla(place)) {
    skipped++;
    continue;
  }

  const fb = entry?.fallback ?? {};
  b.name = localizeName(place.displayName?.text ?? b.name, fb, null);
  b.address = place.formattedAddress ?? b.address;
  b.shortAddress = place.shortFormattedAddress ?? null;
  b.phone = place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? b.phone;
  b.web = place.websiteUri ?? b.web;
  b.googleMapsUrl = place.googleMapsUri ?? b.googleMapsUrl;
  b.hoursList = place.regularOpeningHours?.weekdayDescriptions ?? b.hoursList ?? null;
  b.hours = b.hoursList?.join(" · ") ?? b.hours;
  b.currentHours = place.currentOpeningHours?.weekdayDescriptions ?? null;
  b.rating = place.rating ?? b.rating;
  b.reviewCount = place.userRatingCount ?? b.reviewCount;
  b.priceRange = priceFromLevel(place.priceLevel) ?? b.priceRange;
  b.placeTypes = typesToSpanish(place.types ?? []);
  b.primaryType = place.primaryType ? typesToSpanish([place.primaryType])[0] : null;
  b.accessibility = formatAccessibility(place.accessibilityOptions);
  b.payment = formatPayment(place.paymentOptions);
  b.businessStatus = place.businessStatus ?? b.businessStatus;
  b.businessStatusLabel = businessStatusEs(place.businessStatus);
  b.description = enrichDescription(b.name, b.category, place.editorialSummary?.text, b.description);
  b.tagline = (b.description.split(/[.!?\n]/)[0] || b.name).slice(0, 120);
  updated++;
  if (updated % 25 === 0) console.log(`  … ${updated} fichas`);
  await sleep(220);
}

await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
console.log(`✓ ${updated} fichas actualizadas desde Google (es), ${skipped} sin cambios API`);
await import("./patch-names.mjs");
await import("./enrich-businesses.mjs");
