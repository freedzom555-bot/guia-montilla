export const MONTILLA_CENTER = { latitude: 37.5863, longitude: -4.6381 };

const OTHER_TOWNS =
  /puente genil|aguilar de la frontera|montoro|lucena|espejo|belalc[aá]zar|baena|doña mencía|agujero|nueva carteya|montemayor|puentegenil|14500|14520|14530|14540|14720|14900|14920/i;

const SKIP_NAME =
  /^(calle |cajero|atm |parking|aparcamiento|plaza de aparcamiento|estacionamiento|sin nombre|unnamed)/i;

const EN_TO_ES = {
  "Basilica of St. John of Avila": "Basílica de San Juan de Ávila",
  "Rejoya Park": "Parque de la Rejoya",
  "Tierno Galván Park": "Parque Tierno Galván",
  "Federico García Lorca Park": "Parque Federico García Lorca",
  "Castle Montilla": "Castillo de Montilla",
  "Montilla City Council. Envidarte": "Complejo Envidarte (Ayuntamiento)",
  "Cerro de la Alcoba Periurban Park": "Parque periurbano Cerro de la Alcoba",
};

export const TYPE_ES = {
  restaurant: "Restaurante",
  bar: "Bar",
  cafe: "Cafetería",
  bakery: "Panadería",
  winery: "Bodega",
  liquor_store: "Vinoteca",
  lodging: "Alojamiento",
  hotel: "Hotel",
  guest_house: "Pensión",
  park: "Parque",
  playground: "Parque infantil",
  church: "Iglesia",
  museum: "Museo",
  pharmacy: "Farmacia",
  supermarket: "Supermercado",
  grocery_store: "Alimentación",
  convenience_store: "Tienda de conveniencia",
  store: "Tienda",
  tourist_attraction: "Atracción turística",
  hair_care: "Peluquería",
  beauty_salon: "Centro de belleza",
  gym: "Gimnasio",
  dentist: "Dentista",
  doctor: "Consulta médica",
  veterinary_care: "Veterinario",
  car_repair: "Taller mecánico",
  gas_station: "Gasolinera",
  bank: "Banco",
  lawyer: "Abogado",
  accounting: "Asesoría",
  real_estate_agency: "Inmobiliaria",
  insurance_agency: "Seguros",
  hospital: "Hospital",
  school: "Centro educativo",
  primary_school: "Colegio",
  secondary_school: "Instituto",
  library: "Biblioteca",
  event_venue: "Recinto de eventos",
  performing_arts_theater: "Teatro",
  city_hall: "Ayuntamiento",
  night_club: "Discoteca",
  meal_takeaway: "Comida para llevar",
  wine_bar: "Bar de vinos",
  shopping_mall: "Centro comercial",
  hardware_store: "Ferretería",
  florist: "Floristería",
  book_store: "Librería",
  electronics_store: "Electrónica",
  pet_store: "Tienda de mascotas",
  butcher: "Carnicería",
  furniture_store: "Muebles",
  clothing_store: "Moda",
  home_goods_store: "Hogar",
  post_office: "Correos",
  bus_station: "Estación de autobuses",
  police: "Policía",
  fire_station: "Parque de bomberos",
};

export function distanceKm(lat, lng) {
  const dLat = ((lat - MONTILLA_CENTER.latitude) * Math.PI) / 180;
  const dLng = ((lng - MONTILLA_CENTER.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((MONTILLA_CENTER.latitude * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Solo lugares en Montilla (14550), no pueblos vecinos. */
export function isStrictMontilla(place) {
  const addr = place?.formattedAddress ?? "";
  if (OTHER_TOWNS.test(addr)) return false;
  if (!/montilla|14550/i.test(addr)) return false;
  const lat = place?.location?.latitude;
  const lng = place?.location?.longitude;
  if (lat == null || lng == null) return false;
  return distanceKm(lat, lng) <= 6.5;
}

export function shouldSkipPlace(name, types = []) {
  if (!name || SKIP_NAME.test(name)) return true;
  if (/^(aparcamiento|carretera de|prueba$)/i.test(name)) return true;
  const t = new Set(types);
  if (t.has("atm") || t.has("parking")) return true;
  if (/^calle /i.test(name) && !t.has("restaurant") && !t.has("store")) return true;
  return false;
}

export function localizeName(rawName, fallback, turismoName) {
  if (turismoName) return turismoName;
  if (fallback?.name) return fallback.name;
  if (EN_TO_ES[rawName]) return EN_TO_ES[rawName];
  return rawName;
}

export function typesToSpanish(types = []) {
  return types
    .filter((t) => !["point_of_interest", "establishment", "food", "geocode"].includes(t))
    .slice(0, 8)
    .map((t) => TYPE_ES[t] ?? t.replace(/_/g, " "));
}

export function formatAccessibility(a11y) {
  if (!a11y) return null;
  const parts = [];
  if (a11y.wheelchairAccessibleEntrance) parts.push("Entrada accesible en silla de ruedas");
  if (a11y.wheelchairAccessibleRestroom) parts.push("Aseo accesible");
  if (a11y.wheelchairAccessibleParking) parts.push("Aparcamiento accesible");
  if (a11y.wheelchairAccessibleSeating) parts.push("Asientos accesibles");
  return parts.length ? parts.join(" · ") : null;
}

export function formatPayment(pay) {
  if (!pay) return null;
  const parts = [];
  if (pay.acceptsCreditCards) parts.push("Tarjeta de crédito");
  if (pay.acceptsDebitCards) parts.push("Tarjeta de débito");
  if (pay.acceptsCashOnly) parts.push("Solo efectivo");
  if (pay.acceptsNfc) parts.push("Pago móvil (NFC)");
  return parts.length ? parts.join(" · ") : null;
}

export function businessStatusEs(status) {
  if (status === "OPERATIONAL") return "Abierto";
  if (status === "CLOSED_TEMPORARILY") return "Cerrado temporalmente";
  if (status === "CLOSED_PERMANENTLY") return "Cerrado permanentemente";
  return null;
}

const SLUG_CATEGORY = {
  "taberna-bolero": "restaurantes",
  "taberna-la-chiva": "restaurantes",
  "taberna-rincon-del-conde": "restaurantes",
  "asador-la-plaza": "restaurantes",
  "asador-el-jarriero": "restaurantes",
  "hotel-don-gonzalo": "alojamiento",
  "hotel-don-ramiro": "alojamiento",
  "c-d-p-zafiro-ensena": "educacion",
  "casa-don-manuel": "restaurantes",
  "casa-don-manuel-bar-restaurante": "restaurantes",
  "restaurante-mareli": "restaurantes",
  "catas-dirigidas": "bodegas",
  "olivo-milenario": "parques",
  "puerta-aguilar": "monumentos",
  "basilica-pontificia-de-san-juan-de-avila": "monumentos",
  "sfera-cafe-bar": "bares-cafes",
  "galaxia-heladeria-cafeteria": "bares-cafes",
  "cremolatta-heladeria-artesana": "bares-cafes",
  "komo-komo-montilla-alberti": "bares-cafes",
  "lounge-la-gastrobodega": "restaurantes",
  "la-bodeguita": "bares-cafes",
  "casa-del-inca": "museos",
  "oficina-turismo-montilla": "cultura-ocio",
  "plaza-toros-montilla": "cultura-ocio",
  "recinto-ferial-montilla": "cultura-ocio",
  "exposicion-permanente-de-el-gran-capitan": "museos",
  "museo-garnelo": "museos",
  "museo-historico-local-de-montilla": "museos",
  "montiaventura-local-cumpleanos": "cultura-ocio",
  "salon-municipal-de-exposiciones-san-juan-de-dios": "museos",
  "sca-almazara-de-montillana": "alimentacion",
  "estanco-expendeduria-n-3": "comercios",
  "casino-montillano": "cultura-ocio",
  "casa-de-la-tercia": "monumentos",
  "casa-de-la-camacha": "museos",
  "ayuntamiento-de-montilla": "monumentos",
  "cafeteria-corredera-53": "bares-cafes",
  "cafeteria-florida": "bares-cafes",
  "cafeteria-los-jacintos": "bares-cafes",
  "cafeteria-uruguay-loterias-y-apuestas-del-estado": "bares-cafes",
  "cafeteria-avant-avenida": "bares-cafes",
  "cafeteria-azahara": "bares-cafes",
  "obrador-cafeteria-san-jose": "bares-cafes",
  "el-rincon-de-lola": "bares-cafes",
  "bar-restaurante-nino-rios": "restaurantes",
  "atlas-montilla-centro-deportivo-tienda-de-suplemen": "comercios",
  "ferreteria-puerta-de-aguilar": "comercios",
  "jose-maria-luque-criado": "comercios",
  "parque-de-bomberos-de-montilla": "cultura-ocio",
  "salon-del-reino-de-los-testigos-cristianos-de-jeho": "cultura-ocio",
  "centro-diocesano-san-juan-de-avila": "cultura-ocio",
  "centro-deportivo-biofitness-gimnasio": "cultura-ocio",
  "infinity-fitness-life-montilla": "cultura-ocio",
  "centro-active": "cultura-ocio",
  "academia-de-baile-fuego-latino": "cultura-ocio",
  "inss-instituto-nacional-de-la-seguridad-social-ofi": "profesionales",
  "instituto-de-cooperacion-con-la-hacienda-local-ofi": "profesionales",
  "miguel-cruz-tienda-de-vinos": "alimentacion",
  "vinos-de-montilla-moriles": "alimentacion",
  "vinagrera-montillana": "alimentacion",
  "toneleria-j-l-rodriguez-s-l": "comercios",
  "mural-amontillate": "monumentos",
};

/** Infiere la sección correcta a partir de nombre, slug y tipos (es/en). */
export function inferCategory({ name = "", slug = "", placeTypes = [], types = [] }) {
  if (SLUG_CATEGORY[slug]) return SLUG_CATEGORY[slug];

  const rawTypes = [...placeTypes, ...types.map((t) => TYPE_ES[t] ?? t.replace(/_/g, " "))];
  const c = `${name} ${slug} ${rawTypes.join(" ")}`.toLowerCase();

  if (/^ferreteria|^ferretería/.test(slug) || (/ferreter/i.test(c) && !/^puerta-aguilar$/.test(slug))) {
    return "comercios";
  }

  if (/^cafeteria-|^cafe-bar|^cuatro-cafe|^cremolatta|^galaxia-helader|^sfera-cafe|^komo-komo|^churreria|^d-lou-bar|^el-rincon-de-lola|^el-rincon-sabroso|^tentempie|^gardenias-copas|^la-bodeguita/.test(slug)) {
    return "bares-cafes";
  }

  if (/gastrobodega|bodeguita/.test(c)) {
    return /restaurante|gastro/.test(c) ? "restaurantes" : "bares-cafes";
  }

  if (/^restaurante-|^asador-|^taberna-|^godevo|^ansia-viva|^abdul-kebab|^come-pizza|^burger-king|^moncafe|^la-alacena|^casa-gabi/.test(slug)) {
    return "restaurantes";
  }

  if (/toneler[ií]a|toneleria|barrica|cooperage/.test(c) && !/bodega|winery|lagar/.test(c)) {
    return "comercios";
  }

  if (
    /tienda de vinos|vinoteca|liquor_store|vinos de montilla|vinagrera/.test(c) &&
    !/(?:^|\s)bodega(?:s|\s|$)|winery|(?:^|\s)lagar |^lagar-|viñedo|vinedo|vineyard|hacienda bolonia/.test(c)
  ) {
    return "alimentacion";
  }

  if (
    /(?:^|\s)bodega(?:s|\s|$)|vinoteca|(?:^|\s)lagar |^lagar-|cooperativa san isidro|winery|enoturismo|viñedo|vinedo|vineyard/.test(c) &&
    !/bodeguita|gastrobodega|restaurante|taberna|asador|tienda de vinos|toneler|vinagrera/.test(c)
  ) {
    return "bodegas";
  }

  if (/inss|seguridad social|hacienda local|cooperaci[oó]n con la hacienda|registro civil|delegaci[oó]n de/.test(c)) {
    return "profesionales";
  }

  if (
    /gimnasio|gym\b|fitness|academia de baile|dance school|centro active|biofitness|infinity fitness|box montilla|open padel|padel club|centro deportivo|polideportivo|sports complex|m2 centro deportivo|fitness center/.test(c) &&
    !/^i-e-s-|^i-e-p-|^c-e-i-p-|^colegio|^cep-/.test(slug)
  ) {
    return "cultura-ocio";
  }

  if (
    /^i-e-s-|^i-e-p-|^c-e-i-p-|^e-i-|^cep-|^colegio|instituto emilio|instituto inca|centro educativo|primary_school|secondary_school|university/.test(c) ||
    (/^colegio|instituto|escuela/.test(c) && !/inss|hacienda local|seguridad social|gimnasio|fitness|baile/.test(c))
  ) {
    return "educacion";
  }

  if (
    /^gasolinera|^estacion-de-servicio|^taller-|^talleres-|motos-|peugeot-talleres|merino-automocion|solis-marques|gruas|grúas|rv-motor|recambios-marcas|lavadero-cisternas/.test(slug) ||
    (/gasolinera|taller mecánico|taller|car_repair|gas_station|concesionario|grúas|gruas|car wash|car_wash|automoción|automocion|car dealer|truck dealer/.test(c) &&
      !/restaurante|taberna/.test(c))
  ) {
    return "motor";
  }

  if (/farmacia|pharmacy|ortopedia|órtopedia|dentista|dentist|doctor|veterinario|veterinary|hospital|clínica|clinica|podolog|fisioterap|psicolog|psiquiat|consulta médica|medical clinic|gaes/.test(c)) {
    return "salud";
  }

  if (
    /peluquer|barber|beauty|belleza|estetica|estética|nail salon|uñas|depilacion|depilación|perfumer|cosmet|massage spa|massage\b|spa\b|salon belleza|salón belleza/.test(c) &&
    !/salon municipal|salón municipal|exposicion/.test(c)
  ) {
    return "belleza";
  }

  if (/abogado|lawyer|asesoría|asesoria|gestoría|gestoria|inmobiliaria|real_estate|seguros|insurance|banco|bank|notaría|contable|fiscal|consultor|consultant|administrativ|financ|gestora/.test(c)) {
    return "profesionales";
  }

  if (
    /^supermercado|^mercadona|^lidl|^coviran|^fruteria|^flimar|^ama-|^family-cash|^panader|^obrador|^pasteler|^panificadora|^tahona|^productos-manolin|^montillana-de-bebidas|^esquinita-gourmet|^flamenquincordobes/.test(slug) ||
    /supermarket|grocery|food store|butcher|carnicer|panader|obrador|pasteler|tahona|ultramarino|discount supermarket|tienda de conveniencia|alimentación|supermercado|frutería|fruteria|komo komo|contreras|el jamon|el jamón/.test(c)
  ) {
    if (!/restaurante|taberna|asador|hotel restaurante/.test(c)) return "alimentacion";
  }

  const isRestaurant =
    /restaurante|taberna|asador|mesón|meson|marisquer|pizzer|kebab|sushi|gastro|comida china|pollo frito|chicken restaurant/.test(c) ||
    /^asador-|^taberna-|^restaurante|^casa-don-manuel|^el-rincon-sabroso|^godevo|^ansia-viva|^abdul-kebab/.test(slug);

  const isBarCafe =
    /cafetería|cafeteria|cafe-bar|cafe bar|\bbar\b|churrer|helader|wine_bar|night_club|discoteca|coffee/.test(c) ||
    /^bar-|^bar |^cafe|^cafeteria|^churreria|^helader|^cremolatta|^galaxia-helader|^cuatro-cafe|^sfera-cafe|^jerin-go|^lounge-|^la-bodeguita/.test(slug);

  if (isRestaurant && !isBarCafe) return "restaurantes";
  if (isBarCafe && !/supermercado|farmacia|taller|gasolinera/.test(c)) return "bares-cafes";

  if (/hotel|hostal|alojamiento|lodging|guest_house|pensión|pension|casa rural|apartamento|cottage|bed and breakfast|rv park|mobile home park|boutique house/.test(c)) {
    return "alojamiento";
  }

  if (/museo|museum|exposicion permanente|exposición permanente|centro de interpretacion|centro de interpretación|memorias de|salón municipal de exposiciones|salon municipal de exposiciones/.test(c)) {
    return "museos";
  }

  if (/^fuente-|^fuente |fuente de |fuente del |fuente la |fuente el |^mural-/.test(slug) || (/fuente /.test(c) && !/fontanarillo hotel/.test(c)) || /^mural /.test(c)) {
    return "monumentos";
  }

  if (
    /iglesia|convento|ermita|basílica|basilica|castillo|monumento|palacio|parroquia|claustro|capilla|arco de|historical landmark|historical place|church|place of worship|duques de medinaceli|estatua |monumento-|casa de la tercia|molino |mural /.test(c) ||
    (/(?:^|\s)puerta de aguilar(?:\s|$)/.test(c) && !/ferreter|inmobiliaria|mural/.test(c))
  ) {
    if (!/sal[oó]n del reino|testigos de jehov|jehovah/.test(c)) return "monumentos";
  }

  if (/parking|aparcamiento|parking lot/.test(c)) {
    return null;
  }

  if (/parque|paseo-|paseo de|playground|laguna|dehesa|cerro |pico |city park|natural_feature|hiking|olivo milenario|caracol|parque infantil|parque de la|^plaza-/.test(c)) {
    if (!/parque de bomberos|parking|aparcamiento/.test(c)) return "parques";
  }

  if (
    /teatro|biblioteca|mercado|mercadillo|plaza de toros|plaza-toros|oficina turismo|oficina-turismo|recinto ferial|feria|ayuntamiento|city_hall|estación de autobuses|bus_station|casino|stadium|gimnasio|gym|padel|deportivo|fitness|sports complex|polideportivo|performing_arts|event_venue|turismo|post_office|correos|scenic spot|montiaventura|open padel|box montilla|centro deportivo|cumpleaños|estanco|viajes|parque de bomberos|fire_station|sal[oó]n del reino|centro diocesano|diocesano/.test(c)
  ) {
    return "cultura-ocio";
  }

  if (/almazara|aceite|aove|sca /.test(c) && !/restaurante|taberna/.test(c)) {
    return "alimentacion";
  }

  if (
    /tienda|store|ferretería|ferreteria|moda|clothing|electronics|librería|libreria|papelería|papeleria|muebles|furniture|floristería|florist|decoración|colchoner|informatica|informática|pet_store|mascotas|shopping|textil|lamparas|lámparas|optica|óptica|joyer|reloj|zeeman|phone house|mobile shop|ferreter|mueble|hogar|home goods|free-mobile|decoracion|deportes |cómics|comics|singularplus|estanco|pajarería|pajareria/.test(c)
  ) {
    return "comercios";
  }

  return "comercios";
}
