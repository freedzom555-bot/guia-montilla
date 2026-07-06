/**
 * Añade ortopedias de Montilla que no entraron por descubrimiento / filtro de datos.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { typesToSpanish, formatAccessibility, formatPayment, businessStatusEs } from "./lib/montilla.mjs";
import { richDescription, richTagline } from "./lib/descriptions.mjs";

const exec = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
const CURATED = join(ROOT, "data/place-registry.curated.json");
const IMG = join(ROOT, "public/images/negocios");

const ORTOPEDIAS = [
  {
    slug: "ortopedia-tecnica-el-santo",
    placeId: "ChIJ7R0EXHkTbQ0RyPlobu8GOpE",
    googleQuery: "ORTOPEDIA TECNICA EL SANTO, Montilla",
    category: "salud",
  },
  {
    slug: "ortopedia-tecnica-manuel-baena",
    placeId: "ChIJQVZ6Dp0UbQ0Rh9DsHPDc4E0",
    googleQuery: "Ortopedia Técnica Manuel Baena, Montilla",
    category: "salud",
  },
  {
    slug: "amparo-gomez-de-tejada-munoz-farmacia-y-ortopedia-",
    placeId: "ChIJecrzCm9rbQ0Rr_UPmOSCpEE",
    googleQuery: "Farmacia y Ortopedia IPAGRO, Montilla",
    category: "salud",
  },
];

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

async function googlePlace(placeId) {
  const id = placeId.replace(/^places\//, "");
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=es`, {
    headers: {
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,shortFormattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,location,regularOpeningHours,currentOpeningHours,rating,userRatingCount,types,primaryType,businessStatus,accessibilityOptions,paymentOptions,photos",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function downloadPhotos(slug, name, photos, limit = 4) {
  const dir = join(IMG, slug);
  await mkdir(dir, { recursive: true });
  try {
    for (const f of await readdir(dir)) {
      if (/\.(jpe?g|png|webp)$/i.test(f)) await rm(join(dir, f));
    }
  } catch { /* */ }
  const gallery = [];
  for (let i = 0; i < Math.min(limit, photos?.length ?? 0); i++) {
    const file = `${String(i + 1).padStart(2, "0")}.jpg`;
    const dest = join(dir, file);
    const url = `https://places.googleapis.com/v1/${photos[i].name}/media?maxHeightPx=1200&maxWidthPx=1200&key=${KEY}`;
    try {
      await exec("curl.exe", ["-sL", "--max-time", "60", "-A", "GuiaMontilla/2.0", "-o", dest, url]);
      gallery.push({ src: `/images/negocios/${slug}/${file}`, alt: `${name} — foto ${i + 1} (Google Maps)` });
    } catch { /* */ }
  }
  return gallery;
}

function buildBiz(entry, place) {
  const name = place?.displayName?.text ?? entry.googleQuery;
  const placeTypes = typesToSpanish(place?.types ?? []);
  const biz = {
    id: entry.slug,
    slug: entry.slug,
    name,
    category: entry.category,
    address: place?.formattedAddress ?? null,
    shortAddress: place?.shortFormattedAddress ?? null,
    phone: place?.internationalPhoneNumber ?? place?.nationalPhoneNumber ?? null,
    email: null,
    web: place?.websiteUri ?? null,
    googleMapsUrl: place?.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${entry.placeId}`,
    placeId: entry.placeId,
    lat: place?.location?.latitude ?? null,
    lng: place?.location?.longitude ?? null,
    hours: place?.regularOpeningHours?.weekdayDescriptions?.join(" · ") ?? null,
    hoursList: place?.regularOpeningHours?.weekdayDescriptions ?? null,
    currentHours: place?.currentOpeningHours?.weekdayDescriptions ?? null,
    rating: place?.rating ?? null,
    reviewCount: place?.userRatingCount ?? null,
    priceRange: null,
    social: [],
    featured: false,
    tags: ["salud", "montilla", "ortopedia"],
    placeTypes,
    primaryType: place?.primaryType ? typesToSpanish([place.primaryType])[0] : "Ortopedia",
    accessibility: formatAccessibility(place?.accessibilityOptions),
    payment: formatPayment(place?.paymentOptions),
    businessStatus: place?.businessStatus ?? "OPERATIONAL",
    businessStatusLabel: businessStatusEs(place?.businessStatus) ?? "Abierto",
    turismoUrl: null,
  };
  biz.description = richDescription(biz);
  biz.tagline = richTagline(biz.description);
  biz.highlights = [
    biz.shortAddress ?? "Montilla",
    /farmacia/i.test(name) ? "Farmacia y ortopedia" : "Ortopedia técnica",
  ];
  biz.tips = "Llama antes si necesitas material a medida o adaptación de calzado ortopédico.";
  return biz;
}

let businesses = JSON.parse(await readFile(BIZ, "utf-8"));
let registry = JSON.parse(await readFile(REG, "utf-8"));
let curated = [];
try {
  curated = JSON.parse(await readFile(CURATED, "utf-8"));
} catch { /* */ }

for (const entry of ORTOPEDIAS) {
  const place = await googlePlace(entry.placeId);
  if (!place) {
    console.warn(`✗ Sin datos Google: ${entry.slug}`);
    continue;
  }

  const biz = buildBiz(entry, place);
  const gallery = await downloadPhotos(entry.slug, biz.name, place.photos);
  if (gallery.length) {
    biz.gallery = gallery;
    biz.image = gallery[0].src;
  }

  businesses = businesses.filter((b) => b.slug !== entry.slug);
  businesses.push(biz);

  const regRow = {
    slug: entry.slug,
    placeId: entry.placeId,
    category: entry.category,
    googleQuery: entry.googleQuery,
    fallback: { name: place.displayName?.text ?? entry.googleQuery },
  };
  const idx = registry.findIndex((r) => r.slug === entry.slug);
  if (idx >= 0) registry[idx] = { ...registry[idx], ...regRow, excluded: undefined, excludeReason: undefined };
  else registry.push(regRow);

  if (!curated.some((c) => c.slug === entry.slug)) {
    curated.push({ ...entry, fallback: regRow.fallback });
  }

  console.log(`✓ ${biz.name}`);
}

businesses.sort((a, b) => a.name.localeCompare(b.name, "es"));
await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");
await writeFile(CURATED, JSON.stringify(curated, null, 2), "utf-8");
console.log(`\n✓ ${businesses.length} fichas en total`);
