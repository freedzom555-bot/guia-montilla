/**
 * Añade horarios, highlights, tips y priceRange a cada negocio.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "../data/businesses.json");

const CATEGORY_DEFAULTS = {
  bodegas: {
    hours: "Visitas: consultar horario en web o teléfono. Tienda habitualmente mañanas y tardes entre semana.",
    priceRange: "€€",
    tips: "Reserva la visita con antelación en temporada alta. Pregunta por catas de fino y amontillado.",
  },
  restaurantes: {
    hours: "Comidas: 13:00–16:00 · Cenas: 20:30–23:30 (aprox.). Domingo noche cerrado en muchos locales.",
    priceRange: "€€",
    tips: "Pide maridaje con vino Montilla-Moriles. El salmorejo y las alcachofas son imprescindibles en la zona.",
  },
  "bares-cafes": {
    hours: "Mañanas y tardes; algunos abren hasta la noche en fin de semana.",
    priceRange: "€",
    tips: "Prueba el fino de grifo en las tabernas del centro y combina con montaditos locales.",
  },
  alimentacion: {
    hours: "Supermercados: 9:00–21:00 · Panaderías: madrugada y tarde.",
    priceRange: "€",
    tips: "En el mercado de abastos encontrarás producto de la Campiña Sur.",
  },
  alojamiento: {
    hours: "Recepción: 24 h o 8:00–22:00 según establecimiento. Check-in desde 14:00, check-out 12:00.",
    priceRange: "€€",
    tips: "Reserva en feria (septiembre) y Semana Santa con semanas de antelación.",
  },
  monumentos: {
    hours: "Consultar horarios de visita en oficina de turismo o en la ficha.",
    priceRange: "€",
    tips: "Combina el castillo, el Inca Garcilaso y las iglesias en una ruta a pie por el casco.",
  },
  museos: {
    hours: "Consultar horario en web del ayuntamiento o turismo de Montilla.",
    priceRange: "€",
    tips: "Visita la Casa del Inca Garcilaso y el museo histórico para entender la ciudad.",
  },
  parques: {
    hours: "Acceso libre durante el día.",
    priceRange: "€",
    tips: "El Paseo de Cervantes (La Serna) y La Rejoya son ideales al atardecer.",
  },
  "cultura-ocio": {
    hours: "Consultar programación en web del ayuntamiento o turismo de Montilla.",
    priceRange: "€",
    tips: "Revisa la agenda de feria, teatro y mercadillos según la época del año.",
  },
  comercios: {
    hours: "Horario comercial: 9:00–14:00 y 17:00–20:00.",
    priceRange: "€",
    tips: "Apoya el comercio de proximidad del casco histórico.",
  },
  salud: {
    hours: "Farmacias: turnos de guardia. Consultas: cita previa.",
    priceRange: "€",
    tips: "Consulta la farmacia de guardia en la web del Colegio de Farmacéuticos de Córdoba.",
  },
  belleza: {
    hours: "Mañanas y tardes entre semana; sábados por la mañana.",
    priceRange: "€",
    tips: "Pide cita previa en peluquerías y centros de estética.",
  },
  profesionales: {
    hours: "Horario de oficina: 9:00–14:00 y 17:00–19:00.",
    priceRange: "€",
    tips: "Pide cita o presupuesto por teléfono antes de desplazarte.",
  },
  motor: {
    hours: "Talleres: 8:00–14:00 y 16:00–19:00. Gasolineras: muchas 24 h.",
    priceRange: "€€",
    tips: "Reserva cita en talleres; las gasolineras de la N-331 atienden tránsito y local.",
  },
  educacion: {
    hours: "Horario lectivo según calendario escolar.",
    priceRange: null,
    tips: "Centros educativos públicos de referencia en la comarca.",
  },
};

const HIGHLIGHTS = {
  "bodegas-alvear": ["Fundada en 1729", "Visitas a bodegas subterráneas", "Referencia mundial en PX y amontillado"],
  "bodegas-robles": ["Vino ecológico certificado", "Visitas guiadas", "Tienda en bodega"],
  "bodegas-perez-barquero": ["Soleras centenarias", "Crianza biológica bajo velo de flor", "Bodega visitable"],
  "castillo-montilla": ["Siglo XIV", "Vinculado al Gran Capitán", "Vistas sobre la Campiña"],
  "casa-del-inca": ["Casa natal de Inca Garcilaso", "Museo y programación cultural", "Plaza de Santiago"],
  "hotel-don-gonzalo": ["Salmorejo y cocina cordobesa", "Maridajes Moriles", "Hotel con piscina"],
  "taberna-bolero": ["Taberna de referencia", "Carta de vinos local", "Ambiente de barrio"],
  "hostal-bellido": ["Centro histórico", "Patio andaluz", "Pequeña bodega para degustar"],
  "convento-santa-clara": ["Portada plateresca del siglo XVI", "Convento de monjas clarisas", "Patio porticado con columnas de piedra"],
};

function highlightsFor(b) {
  if (HIGHLIGHTS[b.slug]) return HIGHLIGHTS[b.slug];
  const cat = CATEGORY_DEFAULTS[b.category] ?? CATEGORY_DEFAULTS.comercios;
  const base = [b.tagline];
  if (b.tags?.length) base.push(...b.tags.slice(0, 2).map((t) => t.charAt(0).toUpperCase() + t.slice(1)));
  if (b.featured) base.push("Destacado en Guía Montilla");
  return base.slice(0, 4);
}

async function main() {
  const businesses = JSON.parse(await readFile(FILE, "utf-8"));
  const updated = businesses.map((b) => {
    const defaults = CATEGORY_DEFAULTS[b.category] ?? CATEGORY_DEFAULTS.comercios;
    return {
      ...b,
      hours: b.hoursList?.length ? b.hours : (b.hours ?? defaults.hours),
      priceRange: b.priceRange ?? defaults.priceRange,
      tips: b.tips ?? defaults.tips,
      highlights: b.highlights ?? highlightsFor(b),
    };
  });
  await writeFile(FILE, JSON.stringify(updated, null, 2), "utf-8");
  console.log(`✓ ${updated.length} fichas enriquecidas`);
}

main();
