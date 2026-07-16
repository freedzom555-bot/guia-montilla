/** Fotos reales de fichas Montilla (public/images/negocios/…) */
export const CATEGORY_PHOTOS: Record<string, string> = {
  bodegas: "/images/negocios/bodegas-alvear/01.jpg",
  restaurantes: "/images/negocios/taberna-bolero/01.jpg",
  monumentos: "/images/negocios/castillo-montilla/01.jpg",
  museos: "/images/negocios/museo-garnelo/01.jpg",
  parques: "/images/negocios/parque-la-serna/01.jpg",
  "cultura-ocio": "/images/negocios/teatro-garnelo/01.jpg",
  rutas: "/images/hero/ruta.jpg",
  negocios: "/images/negocios/hotel-don-gonzalo/01.jpg",
  "marketing-digital": "/images/negocios/kyvera-digital/01.png",
  "bares-cafes": "/images/negocios/bar-berlanga/01.jpg",
  alimentacion: "/images/negocios/ama/01.jpg",
  alojamiento: "/images/negocios/hotel-don-gonzalo/01.jpg",
  comercios: "/images/negocios/libreria-del-arbol/01.jpg",
  salud: "/images/negocios/clinica-dental-avenida/01.jpg",
  belleza: "/images/negocios/amalay-mari-carmen-aguilar-peluqueria-estetica-spa/01.jpg",
  profesionales: "/images/negocios/kyvera-digital/01.png",
  motor: "/images/negocios/autos-serycar-s-l/01.jpg",
  educacion: "/images/negocios/colegio-san-francisco-solano-salesianos/01.jpg",
};

/** Categorías que viven bajo /negocios/ */
export const NEGOCIO_CATEGORY_IDS = [
  "bares-cafes",
  "alimentacion",
  "alojamiento",
  "comercios",
  "salud",
  "belleza",
  "profesionales",
  "motor",
] as const;

/** Secciones del índice de la home (Negocios = hub) */
export const HOME_SECTION_IDS = [
  "bodegas",
  "restaurantes",
  "monumentos",
  "museos",
  "parques",
  "cultura-ocio",
  "rutas",
  "negocios",
] as const;

export function photoForCategory(id: string): string {
  return CATEGORY_PHOTOS[id] ?? "/images/hero/vinedo.jpg";
}
