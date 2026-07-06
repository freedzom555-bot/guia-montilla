/**
 * Actualiza nombres al español y filtra fichas que no son de Montilla.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { localizeName } from "./lib/montilla.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const REG = join(ROOT, "data/place-registry.json");

const OTHER_TOWNS =
  /puente genil|aguilar de la frontera|montoro|lucena|espejo|belalc[aá]zar|baena|doña mencía|nueva carteya|montemayor/i;

const biz = JSON.parse(await readFile(BIZ, "utf-8"));
const reg = JSON.parse(await readFile(REG, "utf-8"));
const regBySlug = Object.fromEntries(reg.map((r) => [r.slug, r]));

const extras = {
  "bodegas-caballero": "Bodegas Caballero",
  "cooperativa-san-isidro": "Cooperativa San Isidro (Bodegas San Acacio)",
  "parque-la-serna": "Parque La Serna (Paseo de Cervantes)",
  "parque-la-villa": "Parque de la Rejoya (La Villa)",
  "parque-tierno-galvan": "Parque Tierno Galván",
  "paseo-mercedes": "Paseo de las Mercedes",
  "plaza-toros-montilla": "Plaza de Toros (Plaza de la Rosa)",
  "recinto-ferial-montilla": "Complejo Envidarte (Recinto Ferial)",
  "oficina-turismo-montilla": "Oficina de Turismo de Montilla",
  "puerta-aguilar": "Puerta de Aguilar",
  "iglesia-encarnacion": "Basílica de San Juan de Ávila (Encarnación)",
  "taberna-la-chiva": "Taberna La Chiva",
  "bodegas-robles": "Bodegas Robles",
  "bodegas-alvear": "Bodegas Alvear",
  "bodegas-perez-barquero": "Bodegas Pérez Barquero",
  "asador-la-plaza": "Asador La Plaza",
  "asador-el-jarriero": "Asador El Jarriero",
  "casa-don-manuel": "Casa Don Manuel",
  "bodegas-gracia": "Bodegas Gracia Hermanos",
  "bodegas-canada-navarro": "Bodegas Cañada Navarro",
  "bodegas-los-raigones": "Bodega Los Raigones",
  "castillo-montilla": "Castillo de Montilla",
  "casa-del-inca": "Casa del Inca Garcilaso de la Vega",
  "parroquia-santiago": "Parroquia de Santiago Apóstol",
  "convento-santa-clara": "Convento de Santa Clara",
  "palacio-duques-medina": "Palacio de los Duques de Medinaceli",
  "mercado-abastos": "Mercado de Abastos de Montilla",
  "mercadillo-montilla": "Mercadillo de Montilla",
  "teatro-municipal-montilla": "Teatro Garnelo",
  "hotel-don-gonzalo": "Hotel Restaurante Don Gonzalo",
  "hostal-bellido": "Hostal Bellido",
  "hotel-alfar": "Hotel Alfar",
  "taberna-bolero": "Taberna Bolero",
  "taberna-rincon-del-conde": "Taberna Rincón del Conde",
  "bodegas-cruz-conde": "Bodegas Cruz Conde",
  "bodegas-navarro": "Bodegas Navarro",
};

const REMOVE_SLUGS = new Set([
  "prueba",
  "aparcamiento-el-coto",
  "carretera-de-montilla",
  "magazin-romanesc-montilla",
  "montilla-moriles",
  "perez-barquero",
  "plaza-88-viviendas",
  "monasterio-de-santa-clara",
  "lagar-canada-navarro-insensatos",
  "lagar-los-raigones",
  "casa-del-inca-garcilaso",
  "asador-la-plaza-de-montilla",
  "restaurante-taberna-la-chiva",
  "ruta-del-vino-montilla-moriles",
  "comercial-los-raigones",
  "lugar-oiun1fbg",
  "cocinamovil-comida-casera-para-llevar",
]);

const filtered = [];
const removed = [];

for (const b of biz) {
  if (REMOVE_SLUGS.has(b.slug)) {
    removed.push({ slug: b.slug, reason: "entrada basura" });
    continue;
  }
  const addr = b.address ?? "";
  if (OTHER_TOWNS.test(addr)) {
    removed.push({ slug: b.slug, reason: "otro municipio" });
    continue;
  }
  if (addr && !/montilla|14550/i.test(addr)) {
    removed.push({ slug: b.slug, reason: "sin Montilla en dirección" });
    continue;
  }
  if (/^(calle |cajero|parking|atm )/i.test(b.name)) {
    removed.push({ slug: b.slug, reason: "nombre basura" });
    continue;
  }

  const entry = regBySlug[b.slug];
  if (extras[b.slug]) {
    b.name = extras[b.slug];
  } else   if (entry) {
    b.name = localizeName(b.name, entry.fallback, null);
  }

  if (b.gallery?.length) {
    b.gallery = b.gallery.map((g, i) => ({
      ...g,
      alt: `${b.name} — foto ${i + 1} (Google Maps)`,
    }));
  }
  filtered.push(b);
}

await writeFile(BIZ, JSON.stringify(filtered, null, 2), "utf-8");
console.log(`✓ ${filtered.length} fichas, ${removed.length} eliminadas (no Montilla)`);
if (removed.length) console.log("Fuera:", removed.slice(0, 15).map((r) => r.slug).join(", "));
