/**
 * Restaura monumentos, parques y fuentes eliminados.
 * Verifica dirección 2 veces (Details + Text Search) antes de integrar.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  distanceKm,
  localizeName,
  typesToSpanish,
  formatAccessibility,
  formatPayment,
  businessStatusEs,
  inferCategory,
} from "./lib/montilla.mjs";
import { richDescription, richTagline } from "./lib/descriptions.mjs";
import { HERITAGE_MANUAL, HERITAGE_SKIP } from "./lib/heritage-addresses.mjs";

const exec = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");
const IMG = join(ROOT, "public/images/negocios");
const REPORT = join(ROOT, "data/heritage-restore.json");

const TURISMO_PHONE = "+34 957 65 23 54";
const TURISMO_WEB = "https://www.montillaturismo.es/";

const SKIP = new Set([
  "paseo-de-cervantes-24-parking",
  "paseo-de-cervantes-4-parking",
  "parque-infantil-qlsejw",
  "centro-terapeutico-la-muela-fundacion-arco-iris",
  "aceites-bellido-molino-juan-colin-oleoturismo",
  "castillo-antonio",
  "area-de-autocaravanas-fuente-del-lavadero",
  ...HERITAGE_SKIP,
]);

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
  "id,displayName,formattedAddress,shortFormattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,location,regularOpeningHours,currentOpeningHours,photos,rating,userRatingCount,editorialSummary,types,primaryType,businessStatus,accessibilityOptions,paymentOptions";

function normAddr(a) {
  return (a ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isWrongMunicipality(addr) {
  return /14920|14530|14546|montemayor|aguilar de la frontera|puente genil|baena,|montoro,|lucena,|belalc[aá]zar|santaella|la rambla,/i.test(
    addr ?? ""
  );
}

function isMontillaPlace(place, manual = null) {
  const addr = manual?.address ?? place?.formattedAddress ?? "";
  if (isWrongMunicipality(addr)) return false;
  const lat = manual?.lat ?? place?.location?.latitude;
  const lng = manual?.lng ?? place?.location?.longitude;
  if (lat != null && lng != null) {
    if (distanceKm(lat, lng) > 14) return false;
    return /montilla|14550/i.test(addr) || distanceKm(lat, lng) <= 12;
  }
  if (!/montilla|14550/i.test(addr)) return false;
  return true;
}

function hasCompleteAddress(addr, manual = null) {
  if (manual?.address) return /14550 Montilla/i.test(manual.address);
  if (!addr) return false;
  if (!/montilla|14550/i.test(addr)) return false;
  if (isWrongMunicipality(addr)) return false;
  if (/^14550 Montilla, Córdoba/i.test(addr) && addr.length < 38) return false;
  return (
    /\d/.test(addr) ||
    /\b(n-331|pk|km|paraje|vereda|camino|ctra|av\.|calle|c\.|pl\.|paseo|carretera|glorieta|ron|trav|llano|plaza|cuesta)/i.test(
      addr
    )
  );
}

function sameStreet(a, b) {
  const pick = (s) =>
    (s ?? "")
      .toLowerCase()
      .match(/(llano de palacio|puerta de aguilar|paseo de las mercedes|mar[ií]a auxiliadora)/)?.[0];
  return pick(a) && pick(a) === pick(b);
}

function isHeritage(entry) {
  const n = `${entry.slug} ${entry.fallback?.name ?? ""} ${entry.googleQuery ?? ""}`.toLowerCase();
  if (entry.category === "parques") return true;
  if (entry.category === "monumentos") return true;
  if (/^fuente-/.test(entry.slug)) return true;
  if (/^monumento-/.test(entry.slug)) return true;
  if (/fuente |arco de|palacio|ermita|claustro|molino del|capilla |iglesia de|paseo-de-las-coronadas|paseo-del-caracol|olivo milenario|estatua /i.test(n)) return true;
  return false;
}

function resolveCategory(entry, name, placeTypes, types) {
  if (entry.category === "parques") return "parques";
  if (/^fuente-/.test(entry.slug) || /^monumento-/.test(entry.slug) || /fuente /i.test(name)) return "monumentos";
  const inferred = inferCategory({ name, slug: entry.slug, placeTypes, types });
  if (entry.category === "monumentos" || entry.category === "parques") return entry.category;
  return inferred === "monumentos" || inferred === "parques" ? inferred : entry.category;
}

async function placeDetails(placeId) {
  const id = placeId.replace(/^places\//, "");
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=es`, {
    headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELD_MASK },
  });
  if (!res.ok) return null;
  return res.json();
}

async function textSearch(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id,places.formattedAddress,places.displayName,places.location",
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "es",
      regionCode: "ES",
      locationBias: {
        circle: { center: { latitude: 37.5863, longitude: -4.6381 }, radius: 12000 },
      },
      maxResultCount: 5,
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.places ?? [];
}

async function verifyAddressTwice(entry, placeId) {
  const manual = HERITAGE_MANUAL[entry.slug] ?? null;
  const pid = (manual?.placeId ?? placeId).replace(/^places\//, "");

  const details1 = await placeDetails(pid);
  if (!details1) {
    if (manual?.lat != null && manual?.lng != null && manual.address) {
      return {
        ok: true,
        details: {
          id: pid,
          displayName: { text: entry.fallback?.name ?? entry.slug },
          formattedAddress: manual.address,
          shortFormattedAddress: manual.shortAddress ?? null,
          location: { latitude: manual.lat, longitude: manual.lng },
          photos: [],
        },
        verifiedAddress: manual.address,
        manual,
      };
    }
    return { ok: false, reason: "sin-detalles-google", details: null };
  }

  if (!isMontillaPlace(details1, manual)) {
    if (!manual) return { ok: false, reason: "details-no-montilla", details: details1 };
  }

  const addr1 = manual?.address ?? details1.formattedAddress ?? "";
  if (!hasCompleteAddress(details1.formattedAddress, manual)) {
    return { ok: false, reason: "direccion-incompleta", details: details1 };
  }

  await sleep(280);
  const details2 = await placeDetails(pid);
  const addr2 = manual?.address ?? details2?.formattedAddress;
  if (!details2 || normAddr(addr2) !== normAddr(addr1)) {
    if (!manual) {
      return { ok: false, reason: "direccion-inestable", details: details1, addr2: details2?.formattedAddress };
    }
  }

  if (manual) {
    if (!manual.source1 || !manual.source2) {
      return { ok: false, reason: "manual-sin-doble-fuente", details: details1 };
    }
    if (!isMontillaPlace(details1, manual)) {
      return { ok: false, reason: "manual-fuera-montilla", details: details1 };
    }
    return {
      ok: true,
      details: {
        ...details1,
        formattedAddress: addr1,
        shortFormattedAddress: manual.shortAddress ?? details1.shortFormattedAddress,
        displayName: { text: entry.fallback?.name ?? entry.slug, languageCode: "es" },
      },
      verifiedAddress: addr1,
      manual,
    };
  }

  const q = `${entry.fallback?.name ?? entry.googleQuery ?? entry.slug}, 14550 Montilla, Córdoba, España`;
  await sleep(320);
  const hits = await textSearch(q);
  const matchById = hits.find((h) => (h.id ?? "").replace(/^places\//, "") === pid);
  const matchByAddr = hits.find((h) => normAddr(h.formattedAddress) === normAddr(addr1));

  if (!matchById && !matchByAddr) {
    const nameWords = (entry.fallback?.name ?? "").toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const fuzzy = hits.find((h) => {
      const n = (h.displayName?.text ?? "").toLowerCase();
      return nameWords.filter((w) => n.includes(w)).length >= Math.min(2, nameWords.length);
    });
    if (!fuzzy || !isMontillaPlace(fuzzy)) {
      return { ok: false, reason: "busqueda-no-confirma", details: details1, hits: hits.map((h) => h.displayName?.text) };
    }
    if (normAddr(fuzzy.formattedAddress) !== normAddr(addr1) && !sameStreet(fuzzy.formattedAddress, addr1)) {
      return { ok: false, reason: "busqueda-direccion-distinta", details: details1, fuzzy: fuzzy.formattedAddress };
    }
  }

  return { ok: true, details: details1, verifiedAddress: addr1 };
}

async function downloadPhotos(slug, name, photos) {
  const dir = join(IMG, slug);
  await mkdir(dir, { recursive: true });
  const gallery = [];
  for (let i = 0; i < Math.min(4, photos?.length ?? 0); i++) {
    const file = `${String(i + 1).padStart(2, "0")}.jpg`;
    const dest = join(dir, file);
    const url = `https://places.googleapis.com/v1/${photos[i].name}/media?maxHeightPx=1200&maxWidthPx=1200&key=${KEY}`;
    try {
      await sleep(400);
      await exec("curl.exe", ["-sL", "--max-time", "60", "-A", "GuiaMontilla/2.0", "-o", dest, url]);
      gallery.push({
        src: `/images/negocios/${slug}/${file}`,
        alt: `${name} — foto ${i + 1} (Google Maps)`,
      });
    } catch { /* */ }
  }
  return gallery;
}

function buildEntry(entry, place, category) {
  const fb = entry.fallback ?? {};
  const name = localizeName(place.displayName?.text ?? fb.name ?? entry.slug, fb, null);
  const placeTypes = typesToSpanish(place.types ?? []);
  const phone =
    place.internationalPhoneNumber ??
    place.nationalPhoneNumber ??
    TURISMO_PHONE;
  const hoursList = place.regularOpeningHours?.weekdayDescriptions ?? null;
  const base = {
    id: entry.slug,
    slug: entry.slug,
    name,
    category,
    address: place.formattedAddress,
    shortAddress: place.shortFormattedAddress ?? null,
    phone,
    email: null,
    web: place.websiteUri ?? TURISMO_WEB,
    googleMapsUrl: place.googleMapsUri,
    placeId: (place.id ?? entry.placeId).replace(/^places\//, ""),
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    hours: hoursList?.join(" · ") ?? "Acceso libre / consultar en Oficina de Turismo.",
    hoursList,
    currentHours: place.currentOpeningHours?.weekdayDescriptions ?? null,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    priceRange: "€",
    social: [],
    featured: entry.featured ?? false,
    tags: [category.replace(/-/g, " "), "montilla", "patrimonio"],
    placeTypes,
    primaryType: place.primaryType ? typesToSpanish([place.primaryType])[0] : null,
    accessibility: formatAccessibility(place.accessibilityOptions),
    payment: formatPayment(place.paymentOptions),
    businessStatus: place.businessStatus ?? "OPERATIONAL",
    businessStatusLabel: businessStatusEs(place.businessStatus) ?? "Abierto",
    turismoUrl: null,
    tips:
      phone === TURISMO_PHONE
        ? "Información y horarios en la Oficina de Turismo de Montilla (Calle Iglesia, 3)."
        : "Consulta horarios de visita antes de desplazarte.",
  };
  base.description = richDescription(base);
  base.tagline = richTagline(base.description);
  return base;
}

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
const registry = JSON.parse(await readFile(REG, "utf-8"));
const existing = new Set(businesses.map((b) => b.slug));

const targets = registry.filter(
  (r) => isHeritage(r) && !existing.has(r.slug) && !r.duplicateOf && !SKIP.has(r.slug) && r.placeId
);

console.log(`Restaurando ${targets.length} fichas patrimoniales…\n`);

const restored = [];
const failed = [];

for (const entry of targets) {
  process.stdout.write(`→ ${entry.fallback?.name ?? entry.slug}… `);
  const verification = await verifyAddressTwice(entry, entry.placeId);
  if (!verification.ok) {
    console.log(`✗ ${verification.reason}`);
    failed.push({ slug: entry.slug, name: entry.fallback?.name, reason: verification.reason, extra: verification });
    await sleep(200);
    continue;
  }

  const place = verification.details;
  const category = resolveCategory(entry, place.displayName?.text ?? "", typesToSpanish(place.types ?? []), place.types ?? []);
  const biz = buildEntry(entry, place, category);
  const gallery = await downloadPhotos(entry.slug, biz.name, place.photos);
  if (gallery.length) {
    biz.gallery = gallery;
    biz.image = gallery[0].src;
  }

  businesses.push(biz);
  const regRow = registry.find((r) => r.slug === entry.slug);
  if (regRow) {
    delete regRow.excluded;
    delete regRow.excludeReason;
    regRow.category = category;
  }

  restored.push({ slug: entry.slug, name: biz.name, category, address: biz.address, phone: biz.phone });
  console.log(`✓ ${biz.address}`);
  await sleep(180);
}

businesses.sort((a, b) => a.name.localeCompare(b.name, "es"));
await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
await writeFile(REG, JSON.stringify(registry, null, 2), "utf-8");
await writeFile(
  REPORT,
  JSON.stringify({ restored, failed, total: businesses.length }, null, 2),
  "utf-8"
);

console.log(`\n✓ ${restored.length} restauradas · ${failed.length} no verificadas · ${businesses.length} total`);
if (failed.length) {
  console.log("\nNo restauradas:");
  failed.forEach((f) => console.log(`  ${f.slug}: ${f.reason}`));
}
