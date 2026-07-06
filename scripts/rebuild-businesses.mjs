/**
 * Reconstruye businesses.json + galerías SOLO desde Google Places API.
 * Borra fotos anteriores y descarga hasta 10 fotos por ficha desde Google Maps.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  isStrictMontilla,
  localizeName,
  typesToSpanish,
  formatAccessibility,
  formatPayment,
  businessStatusEs,
  inferCategory,
  MONTILLA_CENTER,
} from "./lib/montilla.mjs";

const exec = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnv() {
  const envPath = join(ROOT, ".env");
  try {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch { /* no .env */ }
}

loadEnv();

const REGISTRY = join(ROOT, "data/place-registry.json");
const OUT = join(ROOT, "data/businesses.json");
const IMG_ROOT = join(ROOT, "public/images/negocios");
const TURISMO = "https://www.montillaturismo.es";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const MAX_PHOTOS_DEFAULT = 8;
const MAX_PHOTOS_BY_CAT = { servicios: 4, "que-hacer": 5, parques: 6, monumentos: 7, bodegas: 10, restaurantes: 10, alojamiento: 8 };
const MONTILLA = MONTILLA_CENTER;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FIELD_MASK =
  "id,displayName,formattedAddress,shortFormattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,location,regularOpeningHours,currentOpeningHours,photos,rating,userRatingCount,priceLevel,editorialSummary,types,primaryType,businessStatus,accessibilityOptions,paymentOptions";

async function curlDownload(url, dest) {
  await mkdir(dirname(dest), { recursive: true });
  await exec("curl.exe", [
    "-sL", "--max-time", "90", "--retry", "2", "--retry-delay", "2",
    "-A", "GuiaMontilla/2.0",
    "-o", dest, url,
  ]);
  const buf = await readFile(dest);
  if (buf.length < 2000) throw new Error(`archivo inválido (${buf.length} B)`);
  if (buf[0] === 0x3c && buf[1] === 0x21) throw new Error("HTML en lugar de imagen");
  return buf.length;
}

async function fetchTurismo(slug) {
  try {
    const res = await fetch(`${TURISMO}/${slug}`, { redirect: "follow" });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) return null;
    const data = JSON.parse(m[1]);
    return data;
  } catch {
    return null;
  }
}

function formatHours(specs) {
  if (!specs?.length) return null;
  return specs
    .map((s) => {
      const days = Array.isArray(s.daysOfWeek) ? s.daysOfWeek.join(", ") : s.daysOfWeek;
      return `${days}: ${s.opens}–${s.closes}`;
    })
    .join(" · ");
}

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function pickWeb(sameAs = []) {
  return asArray(sameAs).find(
    (u) =>
      typeof u === "string" &&
      u.startsWith("http") &&
      !/facebook|instagram|twitter|x\.com|tiktok|youtube|linkedin/i.test(u)
  );
}

function pickSocial(sameAs = []) {
  return asArray(sameAs).filter((u) =>
    typeof u === "string" && /facebook|instagram|twitter|x\.com|tiktok|youtube|linkedin/i.test(u)
  );
}

function isNearMontilla(place) {
  return isStrictMontilla(place);
}

function nameMatches(entry, place) {
  const expected = (
    entry.fallback?.name ??
    entry.googleQuery ??
    entry.slug.replace(/-/g, " ")
  ).toLowerCase();
  const got = (place.displayName?.text ?? "").toLowerCase();
  const stop = new Set(["bodegas", "bodega", "restaurante", "taberna", "hotel", "montilla", "cordoba", "córdoba", "spain", "españa"]);
  const keywords = expected.split(/[\s,]+/).filter((w) => w.length > 3 && !stop.has(w));
  if (keywords.length === 0) return true;
  const hits = keywords.filter((k) => got.includes(k));
  return hits.length >= Math.min(2, keywords.length) || hits.length >= 1 && keywords.length === 1;
}

function cleanWeb(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.search = "";
    let href = u.origin + u.pathname;
    if (href.endsWith("/") && u.pathname.length > 1) href = href.slice(0, -1);
    return href;
  } catch {
    return url.split("?")[0];
  }
}

function normalizePhone(t) {
  if (!t) return null;
  const raw = Array.isArray(t) ? t[0] : t;
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 9) {
    const national = digits.startsWith("34") ? digits.slice(2) : digits;
    if (national.length === 9) {
      return `+34 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
    }
    return digits.startsWith("34") ? `+${digits}` : `+34 ${digits}`;
  }
  return raw;
}

function mapsUrl({ placeId, lat, lng, name, address }) {
  if (placeId) return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const q = encodeURIComponent(`${name} ${address ?? ""} Montilla`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

async function searchPlaces(query, max = 5) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": `places.${FIELD_MASK.split(",").join(",places.")}`,
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "es",
      regionCode: "ES",
      maxResultCount: max,
      locationBias: { circle: { center: MONTILLA, radius: 10000 } },
    }),
  });
  if (!res.ok) {
    console.warn(`  search error: ${res.status}`);
    return [];
  }
  const json = await res.json();
  return json.places ?? [];
}

async function placesDetails(placeId) {
  const id = placeId.replace(/^places\//, "");
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=es`, {
    headers: {
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Place details (${placeId}): ${res.status} ${err}`);
  }
  return res.json();
}

async function resolvePlace(entry, turismoData) {
  if (entry.placeId) {
    try {
      const details = await placesDetails(entry.placeId);
      if (details && isNearMontilla(details)) return details;
    } catch { /* continue */ }
  }

  const queries = [
    entry.googleQuery,
    entry.altQuery,
    turismoData?.name ? `${turismoData.name}, 14550 Montilla, Córdoba, España` : null,
    entry.fallback?.name ? `${entry.fallback.name}, 14550 Montilla, Córdoba, España` : null,
  ].filter(Boolean);

  if (turismoData?.geo?.latitude && turismoData?.geo?.longitude) {
    const near = await placesNearby(
      turismoData.geo.latitude,
      turismoData.geo.longitude,
      turismoData.name
    );
    if (near && isNearMontilla(near)) return near;
  }

  for (const q of queries) {
    await sleep(280);
    const candidates = await searchPlaces(q, 5);
    for (const found of candidates) {
      if (!found?.id || !isNearMontilla(found)) continue;
      if (entry.strictName && !nameMatches(entry, found)) continue;
      await sleep(180);
      const details = await placesDetails(found.id);
      if (details) return details;
    }
  }

  return null;
}

async function placesNearby(lat, lng, nameHint) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": `places.${FIELD_MASK.split(",").join(",places.")}`,
    },
    body: JSON.stringify({
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: 800 },
      },
      maxResultCount: 5,
      languageCode: "es",
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const places = json.places ?? [];
  if (!places.length) return null;
  const hint = (nameHint ?? "").toLowerCase();
  const words = hint.split(/\s+/).filter((w) => w.length > 3);
  const best = places.find((p) => {
    const n = (p.displayName?.text ?? "").toLowerCase();
    return words.filter((w) => n.includes(w)).length >= Math.min(2, words.length);
  });
  if (!best?.id) return null;
  return placesDetails(best.id);
}

async function downloadPlacePhoto(photoName, dest) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1600&maxWidthPx=1600&key=${API_KEY}`;
  await curlDownload(url, dest);
}

async function buildGallery(slug, place, category, entry = {}) {
  const dir = join(IMG_ROOT, slug);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const name = place.displayName?.text ?? slug;
  const skip = new Set(entry.skipPhotoIndexes ?? []);
  const photos = (place.photos ?? []).filter((_, i) => !skip.has(i));
  const max = MAX_PHOTOS_BY_CAT[category] ?? MAX_PHOTOS_DEFAULT;
  const gallery = [];

  const tasks = [];
  for (let i = 0; i < Math.min(max, photos.length); i++) {
    const file = `${String(i + 1).padStart(2, "0")}.jpg`;
    const dest = join(dir, file);
    tasks.push({ i, file, dest, photoName: photos[i].name });
  }

  for (let b = 0; b < tasks.length; b += 3) {
    const batch = tasks.slice(b, b + 3);
    await Promise.all(
      batch.map(async ({ i, file, dest, photoName }) => {
        try {
          await downloadPlacePhoto(photoName, dest);
          gallery[i] = {
            src: `/images/negocios/${slug}/${file}`,
            alt: `${name} — foto ${i + 1} (Google Maps)`,
          };
        } catch (e) {
          console.warn(`    ✗ ${file}: ${e.message}`);
        }
      })
    );
  }

  return gallery.filter(Boolean);
}

function priceFromLevel(level) {
  if (level == null) return null;
  return "€".repeat(Math.min(Math.max(level, 1), 4));
}

function tagsFor(entry, place) {
  if (entry.tags) return entry.tags;
  const types = place?.types ?? [];
  const cat = entry.category;
  const TAGS = {
    bodegas: ["bodega", "montilla-moriles"],
    restaurantes: ["restaurante", "montilla"],
    "bares-cafes": ["bar", "café", "montilla"],
    alimentacion: ["alimentación", "montilla"],
    alojamiento: ["alojamiento", "montilla"],
    monumentos: ["patrimonio", "historia", "montilla"],
    museos: ["museo", "cultura", "montilla"],
    parques: ["parque", "naturaleza", "montilla"],
    "cultura-ocio": ["cultura", "ocio", "montilla"],
    comercios: ["comercio", "tienda", "montilla"],
    salud: ["salud", "montilla"],
    belleza: ["belleza", "montilla"],
    profesionales: ["servicio", "profesional", "montilla"],
    motor: ["motor", "taller", "montilla"],
    educacion: ["educación", "montilla"],
  };
  if (TAGS[cat]) return TAGS[cat];
  if (types.includes("restaurant") || types.includes("bar")) return ["restaurante", "montilla"];
  if (types.includes("lodging")) return ["alojamiento", "montilla"];
  return ["montilla"];
}

function buildDescription(name, entry, turismoData, place, fb) {
  const parts = [];
  const editorial = place.editorialSummary?.text;
  if (editorial) parts.push(editorial);
  if (turismoData?.description && !parts.some((p) => p.includes(turismoData.description.slice(0, 40)))) {
    parts.push(turismoData.description);
  }
  if (fb.description && !parts.some((p) => p.includes(fb.description.slice(0, 40)))) {
    parts.push(fb.description);
  }
  if (parts.length === 0) {
    const cat = entry.category;
    const hints = {
      bodegas: `${name} es una bodega de la D.O. Montilla-Moriles en el municipio de Montilla (Córdoba). El vino de la zona —fino, amontillado, oloroso y PX— se elabora con uva pedro ximénez bajo el sistema de criaderas y soleras.`,
      restaurantes: `${name} es un establecimiento de hostelería en Montilla (14550), en el corazón de la comarca del vino Montilla-Moriles. La gastronomía local combina tapas, guisos de campo y maridaje con vinos de la zona.`,
      monumentos: `${name} forma parte del patrimonio histórico y cultural de Montilla, localidad cordobesa con raíces medievales, vinculada al Inca Garcilaso de la Vega y a la tradición vitivinícola.`,
      parques: `${name} es uno de los espacios verdes y de paseo de Montilla, ideal para disfrutar al aire libre en familia o entre visitas al casco histórico y las bodegas.`,
      alojamiento: `${name} ofrece alojamiento en Montilla (Córdoba), punto de partida ideal para rutas enoturísticas, visitas a bodegas y paseos por el centro histórico.`,
      "que-hacer": `${name} es un lugar de interés en Montilla (Córdoba), municipio de la D.O. Montilla-Moriles con amplia oferta cultural, festiva y turística.`,
      servicios: `${name} es un comercio o servicio en Montilla (14550), localidad de la Campiña Sur cordobesa.`,
    };
    parts.push(hints[cat] ?? `${name} en Montilla (Córdoba), en la comarca del vino Montilla-Moriles.`);
  }
  return parts.join("\n\n");
}

function buildBusiness(entry, turismoData, place) {
  const fb = entry.fallback ?? {};
  const rawName = place.displayName?.text ?? entry.slug;
  const name = localizeName(rawName, fb, turismoData?.name);
  const address = place.formattedAddress ?? fb.address ?? null;
  const shortAddress = place.shortFormattedAddress ?? null;
  const lat = place.location?.latitude ?? turismoData?.geo?.latitude;
  const lng = place.location?.longitude ?? turismoData?.geo?.longitude;
  const placeId = place.id?.replace(/^places\//, "") ?? null;
  const phone =
    place.internationalPhoneNumber ??
    place.nationalPhoneNumber ??
    normalizePhone(turismoData?.telephone) ??
    fb.phone ??
    null;
  const web = cleanWeb(place.websiteUri ?? pickWeb(turismoData?.sameAs) ?? fb.web);
  const email = turismoData?.email ?? fb.email ?? null;
  const hoursList = place.regularOpeningHours?.weekdayDescriptions ?? null;
  const hours = hoursList?.join(" · ") ?? formatHours(turismoData?.openingHoursSpecification) ?? fb.hours ?? null;
  const currentHours = place.currentOpeningHours?.weekdayDescriptions ?? null;
  const googleMapsUrl = place.googleMapsUri ?? mapsUrl({ placeId, lat, lng, name, address });
  const description = buildDescription(name, entry, turismoData, place, fb);
  const tagline = (description.split(/[.!?\n]/)[0] || name).slice(0, 120);
  const placeTypes = typesToSpanish(place.types ?? []);
  const primaryType = place.primaryType ? (typesToSpanish([place.primaryType])[0] ?? null) : null;
  const accessibility = formatAccessibility(place.accessibilityOptions);
  const payment = formatPayment(place.paymentOptions);
  const statusLabel = businessStatusEs(place.businessStatus);
  const category =
    inferCategory({
      name,
      slug: entry.slug,
      placeTypes,
      types: place.types ?? [],
    }) ?? entry.category;

  return {
    id: entry.slug,
    slug: entry.slug,
    name,
    category,
    tagline,
    description,
    address,
    shortAddress,
    phone,
    email,
    web,
    googleMapsUrl,
    placeId,
    lat,
    lng,
    hours,
    hoursList,
    currentHours,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    priceRange: priceFromLevel(place.priceLevel) ?? null,
    social: pickSocial(turismoData?.sameAs),
    featured: entry.featured ?? false,
    tags: tagsFor(entry, place),
    placeTypes,
    primaryType,
    accessibility,
    payment,
    businessStatus: place.businessStatus ?? null,
    businessStatusLabel: statusLabel,
    turismoUrl: entry.turismoSlug ? `${TURISMO}/${entry.turismoSlug}` : null,
  };
}

async function clearAllImages() {
  try {
    await rm(IMG_ROOT, { recursive: true, force: true });
    await mkdir(IMG_ROOT, { recursive: true });
    console.log("✓ Fotos anteriores eliminadas\n");
  } catch {
    await mkdir(IMG_ROOT, { recursive: true });
  }
}

async function main() {
  if (!API_KEY) {
    console.error("ERROR: Define GOOGLE_PLACES_API_KEY en .env");
    process.exit(1);
  }

  const registry = JSON.parse(await readFile(REGISTRY, "utf-8"));
  console.log(`Reconstruyendo ${registry.length} fichas con Google Places API…\n`);
  await clearAllImages();

  const businesses = [];
  const failed = [];

  for (const entry of registry) {
    if (entry.duplicateOf) continue;
    console.log(`→ ${entry.slug}`);
    try {
      const turismoData = entry.turismoSlug ? await fetchTurismo(entry.turismoSlug) : null;
      const place = await resolvePlace(entry, turismoData);

      if (!place) {
        console.warn(`  ✗ No encontrado en Google Maps`);
        failed.push(entry.slug);
        continue;
      }

      const gallery = entry.localPhotos
        ? []
        : await buildGallery(entry.slug, place, entry.category, entry);
      if (entry.localPhotos) {
        try {
          const existing = JSON.parse(await readFile(OUT, "utf-8"));
          const prev = existing.find((b) => b.slug === entry.slug);
          if (prev?.gallery?.length) {
            gallery.push(...prev.gallery);
          }
        } catch { /* primera vez */ }
      }
      if (gallery.length === 0 && !entry.allowNoPhotos && !entry.localPhotos) {
        console.warn(`  ✗ Sin fotos en Google Maps`);
        failed.push(entry.slug);
        continue;
      }

      const biz = buildBusiness(entry, turismoData, place);
      if (gallery.length > 0) {
        biz.gallery = gallery;
        biz.image = gallery[0].src;
      }
      businesses.push(biz);
      console.log(`  ✓ ${biz.name} — ${gallery.length} fotos Google Maps`);
    } catch (e) {
      console.warn(`  ✗ Error: ${e.message}`);
      failed.push(entry.slug);
    }
    await sleep(120);
  }

  await writeFile(OUT, JSON.stringify(businesses, null, 2), "utf-8");
  console.log(`\n✓ ${businesses.length} fichas publicadas`);
  if (failed.length) console.log(`⚠ No publicadas (${failed.length}): ${failed.join(", ")}`);

  // Nombres legibles + sin duplicados + secciones
  await import("./patch-names.mjs");
  await import("./dedupe-businesses.mjs");
  await import("./curate-businesses.mjs");
  await import("./enrich-businesses.mjs");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
