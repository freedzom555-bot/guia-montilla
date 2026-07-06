/**
 * Descubre TODOS los lugares de Montilla vía Google Places API
 * y genera data/place-registry.json (fusionado con curados).
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isStrictMontilla, shouldSkipPlace, MONTILLA_CENTER, inferCategory } from "./lib/montilla.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnv() {
  try {
    const lines = readFileSync(join(ROOT, ".env"), "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch { /* */ }
}
loadEnv();

const KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const MONTILLA = MONTILLA_CENTER;
const RADIUS = 6500;
const OUT = join(ROOT, "data/place-registry.json");
const CURATED = join(ROOT, "data/place-registry.curated.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NEARBY_TYPES = [
  "restaurant", "bar", "cafe", "bakery", "meal_takeaway", "wine_bar",
  "winery", "liquor_store", "lodging", "hotel", "guest_house",
  "park", "playground", "tourist_attraction", "museum", "church",
  "city_hall", "library", "stadium", "event_venue", "performing_arts_theater",
  "pharmacy", "supermarket", "grocery_store", "convenience_store", "shopping_mall",
  "clothing_store", "hardware_store", "home_goods_store", "furniture_store",
  "bank", "gas_station", "car_repair", "car_wash",
  "hair_care", "beauty_salon", "spa", "gym", "dentist", "doctor", "veterinary_care",
  "school", "primary_school", "secondary_school", "university",
  "real_estate_agency", "insurance_agency", "lawyer", "accounting",
  "florist", "butcher", "pet_store", "electronics_store", "book_store",
  "hospital", "police", "fire_station", "post_office", "bus_station",
  "night_club", "meal_delivery", "food", "store",
];

const TEXT_QUERIES = [
  "bodega Montilla Córdoba", "lagar Montilla", "almazara Montilla", "cooperativa vino Montilla",
  "taberna Montilla", "restaurante Montilla", "bar Montilla", "cafetería Montilla",
  "hotel Montilla", "hostal Montilla", "pensión Montilla", "alojamiento Montilla",
  "parque Montilla", "paseo Montilla", "dehesa Montilla", "sierra Montilla",
  "iglesia Montilla", "convento Montilla", "castillo Montilla", "monumento Montilla",
  "museo Montilla", "plaza Montilla", "mercado Montilla", "teatro Montilla",
  "farmacia Montilla", "ortopedia Montilla", "supermercado Montilla", "ferretería Montilla",
  "peluquería Montilla", "taller Montilla", "gestoría Montilla", "inmobiliaria Montilla",
  "veterinario Montilla", "dentista Montilla", "abogado Montilla",
  "tienda Montilla", "comercio Montilla", "negocio Montilla",
  "plaza de toros Montilla", "recinto ferial Montilla", "oficina turismo Montilla",
  "bodegas Montilla Moriles", "enoturismo Montilla",
];

const FIELD = "places.id,places.displayName,places.formattedAddress,places.types,places.location";

function slugify(name, id) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return base || `lugar-${id.slice(-8).toLowerCase()}`;
}

function categorize(types = [], name = "", slug = "") {
  return inferCategory({ name, slug, placeTypes: [], types });
}

const SKIP_NAME = /^(montilla|cordoba|córdoba|spain|españa|unnamed|sin nombre)$/i;

async function nearbySearch(type) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": FIELD,
    },
    body: JSON.stringify({
      includedTypes: [type],
      locationRestriction: { circle: { center: MONTILLA, radius: RADIUS } },
      maxResultCount: 20,
      languageCode: "es",
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.places ?? [];
}

async function textSearch(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": FIELD,
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "es",
      regionCode: "ES",
      maxResultCount: 20,
      locationBias: { circle: { center: MONTILLA, radius: RADIUS } },
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.places ?? [];
}

async function main() {
  if (!KEY) {
    console.error("Falta GOOGLE_PLACES_API_KEY en .env");
    process.exit(1);
  }

  const byId = new Map();

  // Curados primero
  let curated = [];
  try {
    curated = JSON.parse(await readFile(CURATED, "utf-8"));
  } catch {
    curated = JSON.parse(await readFile(OUT, "utf-8"));
  }
  for (const c of curated) {
    if (c.placeId) byId.set(c.placeId, { ...c, curated: true });
  }

  console.log(`Descubriendo lugares en Montilla (${NEARBY_TYPES.length} tipos + ${TEXT_QUERIES.length} búsquedas)…\n`);

  for (const type of NEARBY_TYPES) {
    process.stdout.write(`  nearby: ${type}… `);
    const places = await nearbySearch(type);
    let n = 0;
    for (const p of places) {
      const id = p.id?.replace(/^places\//, "");
      if (!id || !isStrictMontilla(p)) continue;
      const name = p.displayName?.text ?? "";
      if (!name || SKIP_NAME.test(name) || shouldSkipPlace(name, p.types)) continue;
      if (!byId.has(id)) {
        byId.set(id, {
          slug: slugify(name, id),
          placeId: id,
          category: categorize(p.types, name, slugify(name, id)),
          googleQuery: `${name}, Montilla, Córdoba`,
          fallback: { name },
        });
        n++;
      }
    }
    console.log(`+${n}`);
    await sleep(200);
  }

  for (const q of TEXT_QUERIES) {
    process.stdout.write(`  text: ${q.slice(0, 40)}… `);
    const places = await textSearch(q);
    let n = 0;
    for (const p of places) {
      const id = p.id?.replace(/^places\//, "");
      if (!id || !isStrictMontilla(p)) continue;
      const name = p.displayName?.text ?? "";
      if (!name || SKIP_NAME.test(name) || shouldSkipPlace(name, p.types)) continue;
      if (!byId.has(id)) {
        byId.set(id, {
          slug: slugify(name, id),
          placeId: id,
          category: categorize(p.types, name, slugify(name, id)),
          googleQuery: `${name}, Montilla, Córdoba`,
          fallback: { name },
        });
        n++;
      }
    }
    console.log(`+${n}`);
    await sleep(250);
  }

  // Re-aplicar curados (sobrescriben slug/categoría/featured)
  for (const c of curated) {
    const id = c.placeId;
    if (id && byId.has(id)) {
      byId.set(id, { ...byId.get(id), ...c, placeId: id });
    } else if (id) {
      byId.set(id, c);
    } else {
      // curado sin placeId: mantener por slug
      const existing = [...byId.values()].find((x) => x.slug === c.slug);
      if (existing) byId.set(existing.placeId, { ...existing, ...c });
      else byId.set(`curated-${c.slug}`, c);
    }
  }

  // Slugs únicos
  const slugs = new Set();
  const registry = [];
  for (const entry of byId.values()) {
    if (!entry.placeId && !entry.googleQuery && !entry.turismoSlug) continue;
    let slug = entry.slug;
    if (slugs.has(slug)) slug = `${slug}-${(entry.placeId ?? entry.slug).slice(-6).toLowerCase()}`;
    slugs.add(slug);
    registry.push({ ...entry, slug });
  }

  // Curados sin placeId (por slug)
  for (const c of curated) {
    if (c.placeId) continue;
    if (!registry.some((r) => r.slug === c.slug)) registry.push(c);
  }

  registry.sort((a, b) => {
    const cat = (a.category ?? "").localeCompare(b.category ?? "");
    return cat || (a.fallback?.name ?? a.slug).localeCompare(b.fallback?.name ?? b.slug);
  });

  await writeFile(OUT, JSON.stringify(registry, null, 2), "utf-8");
  const byCat = {};
  for (const r of registry) byCat[r.category] = (byCat[r.category] ?? 0) + 1;
  console.log(`\n✓ ${registry.length} lugares en ${OUT}`);
  console.log("Por categoría:", byCat);
}

main();
