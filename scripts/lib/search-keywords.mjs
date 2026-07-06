/** Palabras clave y sinónimos para búsqueda inteligente (es). */

export const CATEGORY_KEYWORDS = {
  bodegas: [
    "bodega", "bodegas", "vino", "vinos", "fino", "amontillado", "oloroso", "moriles",
    "enoturismo", "cata", "catas", "lagar", "viñedo", "viñedos", "bodeguero", "PX", "sherry",
    "copas", "degustar", "solera", "cooperativa",
  ],
  restaurantes: [
    "restaurante", "restaurantes", "comer", "comida", "cenar", "cena", "almorzar", "almuerzo",
    "menu", "menú", "tapas", "tapa", "asador", "asadores", "taberna", "tabernas", "marisquería",
    "pizzeria", "pizzería", "kebab", "brasa", "cocina", "mesón", "gastro",
  ],
  "bares-cafes": [
    "bar", "bares", "café", "cafe", "cafetería", "cafeteria", "copas", "terraza", "terrazas",
    "heladería", "heladeria", "helado", "helados", "churros", "churrería", "desayuno", "desayunos",
    "tapa", "tapeo", "cerveza", "vino de barra",
  ],
  alimentacion: [
    "supermercado", "supermercados", "comprar comida", "compra", "alimentación", "alimentacion",
    "panadería", "panaderia", "pan", "obrador", "pastelería", "pasteleria", "frutería", "fruteria",
    "fruta", "frutas", "carnicería", "carniceria", "carne", "mercadona", "lidl", "coviran",
    "ultramarinos", "tienda comida", "bebidas", "jamón", "jamon", "aceite", "almazara",
  ],
  alojamiento: [
    "hotel", "hoteles", "hostal", "hostales", "dormir", "pernoctar", "alojamiento", "alojarse",
    "casa rural", "apartamento", "pensión", "pension", "habitación", "habitacion", "hospedaje",
  ],
  monumentos: [
    "monumento", "monumentos", "iglesia", "iglesias", "castillo", "convento", "ermita", "basílica",
    "basilica", "parroquia", "patrimonio", "histórico", "historico", "arco", "palacio", "fuente",
    "mural", "murales", "templo", "santuario",
  ],
  museos: [
    "museo", "museos", "exposición", "exposicion", "exposiciones", "garnelo", "inca garcilaso",
    "gran capitán", "gran capitan", "interpretación", "interpretacion",
  ],
  parques: [
    "parque", "parques", "paseo", "paseos", "plaza", "plazas", "verde", "naturaleza", "jardín",
    "jardin", "aire libre", "pasear", "niños", "infantil",
  ],
  "cultura-ocio": [
    "teatro", "biblioteca", "feria", "mercado", "mercadillo", "turismo", "ocio", "deporte",
    "deportes", "gimnasio", "gym", "fitness", "padel", "pádel", "polideportivo", "casino",
    "plaza toros", "toros", "recinto ferial", "envidarte", "baile", "academia baile", "viajes",
    "bomberos", "agenda", "cultura",
  ],
  comercios: [
    "tienda", "tiendas", "comercio", "comercios", "moda", "ropa", "ferretería", "ferreteria",
    "floristería", "floristeria", "flores", "flor", "ramo", "ramos", "planta", "plantas", "jardín",
    "regalo", "regalos", "librería", "libreria", "libros", "papelería", "papeleria", "muebles",
    "decoración", "decoracion", "electrónica", "electronica", "informática", "informatica",
    "joyería", "joyeria", "óptica", "optica", "gafas", "zapatería", "zapateria", "mascotas",
    "pajarería", "pajareria", "estanco", "tabaco", "regalos", "hogar", "textil", "colchones",
  ],
  salud: [
    "farmacia", "farmacias", "medicamento", "medicamentos", "medicina", "dentista", "dental",
    "clínica", "clinica", "médico", "medico", "doctor", "veterinario", "veterinaria", "mascota",
    "salud", "fisioterapia", "podólogo", "podologo", "órtopedia", "ortopedia", "reconocimiento médico",
  ],
  belleza: [
    "peluquería", "peluqueria", "peluquero", "peluquera", "barbero", "barbería", "barberia",
    "corte", "corte pelo", "pelo", "estética", "estetica", "belleza", "uñas", "manicura",
    "depilación", "depilacion", "spa", "masaje", "cosmética", "cosmetica", "peinado",
  ],
  profesionales: [
    "abogado", "abogados", "gestoría", "gestoria", "gestor", "asesoría", "asesoria", "inmobiliaria",
    "inmobiliario", "seguro", "seguros", "banco", "bancos", "notaría", "notaria", "contable",
    "contabilidad", "fiscal", "hacienda", "inss", "seguridad social", "tramite", "trámite",
    "gestiones", "oficina", "agencia tributaria", "aeat",
  ],
  motor: [
    "taller", "talleres", "mecánico", "mecanico", "gasolinera", "gasolineras", "gasolina",
    "coche", "coches", "motor", "automóvil", "automovil", "neumáticos", "neumaticos", "ruedas",
    "grúa", "grua", "itv", "chapa", "pintura", "concesionario", "recambios", "lavado",
  ],
  educacion: [
    "colegio", "colegios", "instituto", "institutos", "escuela", "escuelas", "educación", "educacion",
    "guardería", "guarderia", "formación", "formacion", "ies", "ceip", "profesores", "alumnos",
  ],
};

/** Término buscado → categorías relacionadas */
export const QUERY_TO_CATEGORIES = {
  flores: ["comercios"],
  flor: ["comercios"],
  ramo: ["comercios"],
  plantas: ["comercios"],
  regalo: ["comercios"],
  comer: ["restaurantes", "bares-cafes"],
  cenar: ["restaurantes"],
  tapas: ["restaurantes", "bares-cafes"],
  vino: ["bodegas", "alimentacion"],
  fino: ["bodegas", "bares-cafes"],
  dormir: ["alojamiento"],
  hotel: ["alojamiento"],
  farmacia: ["salud"],
  dentista: ["salud"],
  peluqueria: ["belleza"],
  peluquería: ["belleza"],
  corte: ["belleza"],
  abogado: ["profesionales"],
  gestoria: ["profesionales"],
  gestoría: ["profesionales"],
  taller: ["motor"],
  gasolina: ["motor"],
  colegio: ["educacion"],
  instituto: ["educacion"],
  iglesia: ["monumentos"],
  castillo: ["monumentos"],
  parque: ["parques"],
  museo: ["museos"],
  gimnasio: ["cultura-ocio"],
  feria: ["cultura-ocio"],
  fontanero: ["profesionales", "comercios"],
  fontaneria: ["profesionales", "comercios"],
  fontanería: ["profesionales", "comercios"],
  electricista: ["profesionales", "comercios"],
  carpintero: ["profesionales", "comercios"],
  pintor: ["profesionales", "comercios"],
  almorzar: ["restaurantes", "bares-cafes"],
  tapear: ["bares-cafes", "restaurantes"],
  desayunar: ["bares-cafes"],
};

/** Palabras en nombre/tipo → keywords extra */
export const NAME_HINTS = [
  [/flor/i, ["flores", "floristería", "floristeria", "ramo", "plantas", "regalo"]],
  [/peluquer|barber|estet|belleza|nail|uñas/i, ["peluquería", "corte", "belleza", "estética"]],
  [/farmaci|farma/i, ["farmacia", "medicamentos", "salud"]],
  [/dent|odont/i, ["dentista", "dental", "salud"]],
  [/veterin/i, ["veterinario", "mascotas", "salud"]],
  [/bodega|lagar|vin/i, ["bodega", "vino", "enoturismo", "cata"]],
  [/restaur|asador|taberna|meson|mesón|pizzer|kebab|marisquer/i, ["restaurante", "comer", "comida", "tapas"]],
  [/bar|cafeter|café|cafe|churrer|helader/i, ["bar", "café", "copas", "terraza"]],
  [/hotel|hostal|alojam|pension|pensión|casa rural/i, ["hotel", "dormir", "alojamiento"]],
  [/ferreter/i, ["ferretería", "herramientas", "bricolaje"]],
  [/supermerc|mercadona|lidl|coviran|aliment/i, ["supermercado", "comida", "comprar"]],
  [/panader|obrador|pasteler|tahona/i, ["pan", "panadería", "bollería"]],
  [/taller|gasolin|automoc|mecan|neum/i, ["taller", "motor", "coche", "gasolinera"]],
  [/abogad|gestor|asesor|inmobiliar|segur/i, ["abogado", "gestoría", "inmobiliaria", "seguros"]],
  [/fontan/i, ["fontanero", "fontanería", "agua", "grifo"]],
  [/electric/i, ["electricista", "electricidad", "luz"]],
  [/librer|papeler/i, ["librería", "libros", "papelería"]],
  [/optica|óptica|gafas/i, ["óptica", "gafas", "vista"]],
  [/joyer/i, ["joyería", "joyas", "anillos"]],
  [/colegio|instituto|escuela|i\.?e\.?s|ceip/i, ["colegio", "instituto", "educación"]],
  [/iglesia|convento|ermita|parroquia|basilica|basílica/i, ["iglesia", "monumento", "patrimonio"]],
  [/parque|paseo|plaza/i, ["parque", "paseo", "aire libre"]],
  [/museo|exposici/i, ["museo", "exposición", "cultura"]],
  [/gimnasio|fitness|deport|padel|pádel/i, ["gimnasio", "deporte", "fitness"]],
  [/fisioter|podolog|clinica|clínica/i, ["salud", "clínica", "fisioterapia"]],
];

export function keywordsForBusiness(b, categoryLabel) {
  const words = new Set();
  const add = (s) => {
    if (!s) return;
    for (const w of String(s).toLowerCase().split(/[\s,.·\-/|]+/)) {
      const t = w.normalize("NFD").replace(/\p{M}/gu, "").trim();
      if (t.length >= 3) words.add(t);
    }
  };

  add(b.name);
  add(categoryLabel);
  add(b.tagline);
  add(b.shortAddress);
  for (const t of b.placeTypes ?? []) add(t);
  if (b.primaryType) add(b.primaryType);
  for (const t of b.tags ?? []) add(t);

  for (const [re, hints] of NAME_HINTS) {
    if (re.test(b.name) || re.test(b.slug)) hints.forEach((h) => words.add(h));
  }

  return [...words];
}
