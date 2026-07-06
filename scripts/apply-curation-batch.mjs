/**
 * Lote de curación manual: eliminar fichas, recategorizar Hotel Don Ramiro, añadir Zafiro Enseñanza.
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
const IMG = join(ROOT, "public/images/negocios");

const REMOVE = [
  "bodegas-gracia",
  "cafeteria-uruguay-loterias-y-apuestas-del-estado",
  "copadiscos",
  "gardenias-copas",
  "flamenquincordobes-com",
  "sabores-de-pueblo",
  "vinagrera-montillana",
  "vinos-de-montilla-moriles",
  "apartamento-turistico",
  "cerro-macho",
  "comunidad-de-amor-cristiano",
  "academia-de-baile-fuego-latino",
  "salon-del-reino-de-los-testigos-cristianos-de-jeho",
  "sala-multifuncional-edificio-solera",
  "ademo-union-de-empresarios-de-montilla",
  "consejo-regulador-d-o-p-montilla-moriles-y-vinagre",
  "denet",
  "ernesto-olivares",
  "timeless-natura",
  "tienda-la-ganga",
  "trendy",
  "tu",
  "glamour",
  "allianz-seguros-agencia-seyge-hnos-jimenez-s-l",
  "allianz-seguros-agente-manuela-cerezo-urbano",
  "antonio-jesus-salido-mendoza",
  "carlos-baena-portero",
  "estudio-montilla-2005-s-l",
  "francisco-pedro-repiso-gil",
  "jose-antonio-urbano-gomez",
  "joaquin-climent-pedraza",
  "talleres-y-gruas-carrasquilla-sl",
  "e-i-ana-ximenez",
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

async function googlePhotos(placeId, name, max = 4) {
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

let businesses = JSON.parse(await readFile(BIZ, "utf-8"));
let registry = JSON.parse(await readFile(REG, "utf-8"));

for (const slug of REMOVE) {
  try {
    await rm(join(IMG, slug), { recursive: true, force: true });
  } catch { /* */ }
}
businesses = businesses.filter((b) => !REMOVE.includes(b.slug));
registry = registry.map((r) =>
  REMOVE.includes(r.slug) ? { ...r, excluded: true, excludeReason: "eliminado-manual" } : r
);
console.log(`✓ ${REMOVE.length} fichas eliminadas`);

const ramiro = businesses.find((b) => b.slug === "hotel-don-ramiro");
if (ramiro) {
  ramiro.category = "alojamiento";
  ramiro.tags = ["alojamiento", "montilla", "hotel"];
  console.log("✓ Hotel Don Ramiro → alojamiento");
}

const zafiroSlug = "c-d-p-zafiro-ensena";
const zafiroPlaceId = "ChIJadJQSWUTbQ0R-tzkgm0x5aw";
if (!businesses.some((b) => b.slug === zafiroSlug)) {
  const place = await googlePhotos(zafiroPlaceId, "C.D.P. Zafiro Enseñanza");
  const name = place?.displayName?.text ?? "C.D.P. Zafiro Enseñanza";
  const placeTypes = typesToSpanish(place?.types ?? []);
  const zafiro = {
    id: zafiroSlug,
    slug: zafiroSlug,
    name,
    category: "educacion",
    address: `${place?.formattedAddress ?? "Av. de Italia, 53, 14550 Montilla, Córdoba"}, España`,
    shortAddress: place?.shortFormattedAddress ?? "Av. de Italia, 53, Montilla",
    phone: place?.internationalPhoneNumber ?? place?.nationalPhoneNumber ?? "+34 620 40 22 92",
    email: null,
    web: place?.websiteUri ?? "http://www.zafiroeduca.com/",
    googleMapsUrl: place?.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${zafiroPlaceId}`,
    placeId: zafiroPlaceId,
    lat: place?.location?.latitude ?? 37.579551,
    lng: place?.location?.longitude ?? -4.635422,
    hours: place?.regularOpeningHours?.weekdayDescriptions?.join(" · ") ?? null,
    hoursList: place?.regularOpeningHours?.weekdayDescriptions ?? null,
    currentHours: place?.currentOpeningHours?.weekdayDescriptions ?? null,
    rating: place?.rating ?? null,
    reviewCount: place?.userRatingCount ?? null,
    priceRange: "€",
    social: [],
    featured: false,
    tags: ["educacion", "montilla", "formacion"],
    placeTypes,
    primaryType: place?.primaryType ? typesToSpanish([place.primaryType])[0] : null,
    accessibility: formatAccessibility(place?.accessibilityOptions),
    payment: formatPayment(place?.paymentOptions),
    businessStatus: place?.businessStatus ?? "OPERATIONAL",
    businessStatusLabel: businessStatusEs(place?.businessStatus) ?? "Abierto",
    turismoUrl: null,
  };
  zafiro.description = richDescription(zafiro);
  zafiro.tagline = richTagline(zafiro);
  const gallery = await downloadPhotos(zafiroSlug, name, place?.photos);
  if (gallery.length) {
    zafiro.gallery = gallery;
    zafiro.image = gallery[0].src;
  }
  businesses.push(zafiro);
  registry.push({
    slug: zafiroSlug,
    placeId: zafiroPlaceId,
    category: "educacion",
    googleQuery: "C.D.P. Zafiro Enseñanza, Montilla, Córdoba",
    fallback: { name: "C.D.P. Zafiro Enseñanza" },
  });
  console.log(`✓ Añadido ${name} (educación)`);
}

businesses.sort((a, b) => a.name.localeCompare(b.name, "es"));
await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");
console.log(`\n✓ ${businesses.length} fichas en total`);
