/**
 * Descripciones estilo guía local — concretas, sin relleno SEO ni bloques repetidos.
 * Estructura: gancho (1 frase) + contexto de visita + detalle opcional.
 * No duplica dirección, teléfono ni horarios (ya están en la ficha).
 */

const SLUG_EXTRA = {
  "kyvera-digital":
    "Agencia de marketing digital, diseño web, SEO e IA con sede en Montilla. Montan webs, posicionamiento local y automatización para pymes de la Campiña Sur y el resto de España. Son el equipo detrás de Guía Montilla.",
  "bodega-boutique-finca-buytron":
    "Casa rural de alojamiento en finca junto a la N-331, a las afueras de Montilla. Ideal como base para visitar bodegas, patrimonio y la Campiña Sur sin dormir en el casco.",
  "bodegas-alvear":
    "Fundada en 1729, es una de las bodegas más antiguas de España y referencia mundial en Pedro Ximénez, soleras y vinos generosos. Las visitas por bodegas subterráneas explican el sistema de criaderas que define al Montilla-Moriles.",
  "bodegas-perez-barquero":
    "Tradición familiar y soleras centenarias en una de las bodegas más visitadas de Montilla. Sus catas de fino y amontillado son parada casi obligada en cualquier ruta enoturística.",
  "bodegas-robles":
    "Pionera en viticultura ecológica certificada, integra viñedo, olivar y bodega en una apuesta sostenible muy valorada por enoturistas.",
  "bodegas-cruz-conde":
    "Saga vitivinícola montillana con soleras que conservan la memoria del vino generoso cordobés y visitas que acercan al proceso de crianza bajo velo de flor.",
  "bodegas-caballero":
    "Tradición bodeguera de raíces familiares con tienda y visitas en un entorno donde madera y vino acompañan cada nave de crianza.",
  "bodegas-navarro":
    "Referencia histórica del vino de Montilla, con soleras que han marcado generaciones de viticultores en la D.O.",
  "bodegas-los-raigones":
    "Lagar y bodega en entorno rural de la Campiña Sur, ideal para enoturismo con viñedos y olivos de fondo.",
  "cooperativa-san-isidro":
    "Concentra la tradición cooperativista del vino en Montilla: mosto, criaderas y soleras compartidas por viticultores locales.",
  "castillo-montilla":
    "Fortaleza del siglo XIV vinculada al Gran Capitán. Desde sus muros se domina la Campiña Sur y se entiende la posición estratégica de la villa en la Edad Media.",
  "casa-del-inca":
    "Casa natal de Inca Garcilaso de la Vega, cronista del Perú y figura capital de la literatura hispanoamericana. Hoy acoge espacio museístico y actividades culturales.",
  "convento-santa-clara":
    "Convento de clausura de monjas clarisas con portada plateresca del XVI, patio porticado y puerta principal de madera tallada. Una de las imágenes más reconocibles del casco histórico.",
  "basilica-pontificia-de-san-juan-de-avila":
    "Templo barroco ligado a San Juan de Ávila, uno de los grandes referentes del patrimonio religioso montillano.",
  "parroquia-santiago":
    "Iglesia histórica del casco empedrado, parada habitual en las rutas de patrimonio religioso.",
  "palacio-de-los-duques-de-medinaceli":
    "Gran conjunto civil señorial en el centro histórico, testimonio del poder ducal en la Montilla moderna.",
  "puerta-aguilar":
    "Resto visible de la antigua muralla medieval que protegía la villa, integrado en el laberinto de calles del casco.",
  "taberna-bolero":
    "Taberna centenaria con patios andaluces, carta de vinos Moriles y cocina de tradición renovada. Parada imprescindible del tapeo montillano.",
  "taberna-la-chiva":
    "Local con solera en la hostelería montillana: vino de la tierra y tapas de barrio en pleno centro.",
  "taberna-rincon-del-conde":
    "Ambiente de taberna clásica donde el fino de grifo y los guisos de la Campiña marcan la experiencia.",
  "asador-la-plaza":
    "Referencia en carnes a la brasa y comidas generosas, ideal después de visitar bodegas.",
  "hostal-bellido":
    "Alojamiento con encanto en el centro histórico: patio andaluz y ambiente familiar que lleva décadas recibiendo enoturistas.",
  "oficina-turismo-montilla":
    "Punto de información oficial para planificar visitas a bodegas, rutas patrimoniales y eventos. Conviene pasar al llegar.",
  "mercado-municipal-de-abastos-montilla":
    "Pescado, carne, fruta y producto local de la Campiña Sur en un solo edificio. Buen lugar para ver la vida cotidiana montillana.",
  "teatro-garnelo":
    "Principal escenario escénico municipal, con teatro, música y actos culturales a lo largo del año.",
  "plaza-toros-montilla":
    "Plaza de la Rosa: equipamiento taurino con historia en el casco urbano, ligado a feria y fiestas.",
  "olivo-milenario":
    "Olivo centenario testimonio del paisaje agrícola donde viñedos, olivos y dehesas conviven en la Campiña Sur.",
  "catas-dirigidas":
    "Catas dirigidas de vinos Montilla-Moriles para aprender a distinguir fino, amontillado y oloroso con explicación profesional.",
  "sca-almazara-de-montillana":
    "Cooperativa oleícola que conecta la tradición del aceite virgen extra con la cultura del vino de la comarca.",
  "laguna-de-jarata":
    "Espacio natural periurbano con aves, vegetación de ribera y paseo tranquilo, contraste verde respecto al casco y las bodegas.",
  "plaza-de-munda":
    "Plaza reformada con zona infantil, naranjos y edificios históricos de fondo. Pausa verde en pleno casco.",
};

const VISIT_HINTS = {
  bodegas: [
    "Conviene reservar visita con antelación, sobre todo en vendimia y fines de semana.",
    "Pregunta por catas de fino, amontillado y PX; la tienda suele abrir mañana y tarde entre semana.",
    "Ideal combinarla con otra bodega del casco o del entorno rural en la misma jornada.",
  ],
  restaurantes: [
    "La mesa montillana se entiende con vino de la D.O.: fino, amontillado u oloroso según el plato.",
    "Reserva mesa en viernes y sábado noche; muchos locales cierran domingo por la noche.",
    "Buena opción para almuerzo largo después de una mañana de bodegas.",
  ],
  "bares-cafes": [
    "El tapeo aquí sigue el ritmo del barrio: copa, montadito y conversación bajo el toldo.",
    "Terraza o barra de confianza para parar entre visita y visita por el centro.",
    "Prueba el fino de grifo antes de volver a las bodegas por la tarde.",
  ],
  alimentacion: [
    "Producto de proximidad para quien se aloja varios días y quiere cocinar con ingredientes de la Campiña.",
    "Pan recién horneado, fruta de temporada y aceite de oliva son compras típicas del visitante.",
    "Complementa la experiencia enoturística con lo que no encuentras fuera de Montilla.",
  ],
  alojamiento: [
    "Base cómoda para una escapada de fin de semana: bodegas por la mañana, patrimonio al mediodía, tapas por la noche.",
    "Reserva con antelación en feria (septiembre) y Semana Santa.",
    "Muchos alojamientos están a poca distancia a pie del castillo y las tabernas del centro.",
  ],
  monumentos: [
    "Mejor visitarlo caminando el casco histórico, en la misma ruta que castillo, arcos e iglesias.",
    "Consulta horarios en turismo si quieres acceso interior; la fachada ya merece la parada.",
    "Forma parte del legado del Gran Capitán, el Inca Garcilaso y siglos de cultura del vino.",
  ],
  museos: [
    "Parada imprescindible para entender Montilla más allá de la copa de vino.",
    "Combínalo con la Casa del Inca y el castillo en una misma mañana cultural.",
    "Consulta programación temporal en la web de turismo o el ayuntamiento.",
  ],
  parques: [
    "Pausa al aire libre entre bodega y bodega, sobre todo en verano.",
    "Acceso libre durante el día; sombra de árboles y zonas infantiles en varios puntos.",
    "Ralentiza el ritmo de la visita y te sitúa en la vida cotidiana del pueblo.",
  ],
  "cultura-ocio": [
    "Consulta agenda según la época: feria, teatro, mercadillos y eventos deportivos marcan el calendario.",
    "Equipamiento donde el pueblo se reúne más allá del turismo de bodegas.",
    "Revisa horarios antes de desplazarte; la programación cambia según temporada.",
  ],
  comercios: [
    "Comercio de proximidad que mantiene vivo el casco junto a bodegas y hostelería.",
    "Horario partido habitual: mañana y tarde entre semana.",
    "Apoyar el comercio local forma parte de la experiencia en un pueblo de tamaño humano.",
  ],
  salud: [
    "Farmacias con turno de guardia rotativo en la comarca; confirma el calendario del Colegio de Farmacéuticos de Córdoba.",
    "Consulta médica o clínica dental: conviene pedir cita previa.",
    "Red de salud de referencia para vecinos y visitantes que pasan varios días en Montilla.",
  ],
  belleza: [
    "Pide cita previa, sobre todo en vísperas de festividades locales.",
    "Servicio de barrio con el ritmo pausado del pueblo.",
    "Complementa una escapada en la que también hay tiempo para cuidarse.",
  ],
  profesionales: [
    "Gestoría, asesoría, abogacía o seguros para trámites en Montilla y alrededores.",
    "Horario de oficina habitual: mañana y tarde entre semana.",
    "Pide cita o presupuesto por teléfono antes de desplazarte.",
  ],
  motor: [
    "Útil en ruta enoturística o de paso por la N-331 y conexiones con Córdoba capital.",
    "Talleres suelen trabajar con cita; gasolineras atienden tránsito y local.",
    "Servicio de confianza en una comarca agrícola y vinícola.",
  ],
  educacion: [
    "Centro educativo de referencia en un municipio de tradición agrícola y vinícola.",
    "Forma parte del tejido social junto a bodegas, comercios y hostelería del casco.",
    "Horario lectivo según calendario escolar de Andalucía.",
  ],
};

function variant(slug, n) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h) % n;
}

function cleanName(name) {
  return String(name ?? "").trim();
}

function locationPhrase(b) {
  const short = b.shortAddress?.trim();
  if (short && short.length > 4 && !/^montilla$/i.test(short)) {
    if (/montilla/i.test(short)) return `Está en ${short} (14550).`;
    return `Está en ${short}, Montilla (14550).`;
  }
  const addr = b.address?.replace(/, España$/, "").trim();
  if (addr) {
    const street = addr.split(",")[0]?.trim();
    if (street && street.length > 5) return `Está en ${street}, Montilla (14550).`;
  }
  return "En Montilla (14550), en la comarca del vino Montilla-Moriles.";
}

function ratingPhrase(b) {
  if (!b.rating || !b.reviewCount || b.reviewCount < 8) return null;
  if (b.rating >= 4.5 && b.reviewCount >= 30) {
    return `En Google Maps acumula ${b.rating}/5 con más de ${b.reviewCount} opiniones, una señal clara de confianza local.`;
  }
  if (b.rating >= 4.2 && b.reviewCount >= 15) {
    return `Valorado en ${b.rating}/5 por quienes lo conocen (${b.reviewCount} opiniones en Google Maps).`;
  }
  return null;
}

function inferKind(b) {
  if (b.slug === "bodega-boutique-finca-buytron") return "lodging";
  if (b.slug === "kyvera-digital") return "professional";
  const n = cleanName(b.name).toLowerCase();
  const types = (b.placeTypes ?? []).join(" ").toLowerCase();
  const cat = b.category;

  if (/bodega|lagar|cooperativa|almazara|vinícola|vinicola/.test(n) || /winery|liquor/.test(types)) return "winery";
  if (/taberna|restaurante|asador|marisquer|pizzer|kebab|cervec|mesón|meson/.test(n) || /restaurant/.test(types)) return "restaurant";
  if (/bar |café|cafe|cafeter|churrer|helader/.test(n) || /bar|cafe/.test(types)) return "bar";
  if (/hotel|hostal|alojamiento|casa rural|apartamento/.test(n) || /lodging/.test(types)) return "lodging";
  if (/ortopedia/.test(n) || /ortopedia/.test(types)) return "orthopedics";
  if (/farmacia/.test(n) || /pharmacy/.test(types)) return "pharmacy";
  if (/dentista|dental|odontolog|clínica dental|clinica dental/.test(n)) return "dental";
  if (/peluquer|barber|estética|estetica|uñas|unas/.test(n) || /hair|beauty/.test(types)) return "beauty";
  if (/taller|gasolin|neumát|neumatic|automóvil|automovil|mecánic|mecanic/.test(n)) return "motor";
  if (/iglesia|basílica|basilica|parroquia|ermita|convento|capilla|santuario/.test(n) || /church|place of worship/.test(types)) return "temple";
  if (/parque|plaza|paseo|jardín|jardin|laguna|olivo/.test(n) || /park|natural/.test(types)) return "outdoor";
  if (/museo|teatro|biblioteca/.test(n) || /museum|library/.test(types)) return "culture";
  if (/c\.e\.i\.p|ies |colegio|guarder|academia|escuela/.test(n) || cat === "educacion") return "school";
  if (/abogad|asesor|gestor|seguro|inmobiliar|notar/.test(n)) return "professional";
  if (/supermerc|panader|fruter|carnicer|aliment|coviran|mercad/.test(n)) return "foodshop";

  const byCat = {
    bodegas: "winery",
    restaurantes: "restaurant",
    "bares-cafes": "bar",
    alimentacion: "foodshop",
    alojamiento: "lodging",
    monumentos: "heritage",
    museos: "culture",
    parques: "outdoor",
    "cultura-ocio": "culture",
    comercios: "shop",
    salud: "health",
    belleza: "beauty",
    profesionales: "professional",
    motor: "motor",
    educacion: "school",
  };
  return byCat[cat] ?? "generic";
}

const OPENERS = {
  winery: (b) => {
    const v = variant(b.slug, 3);
    const opts = [
      `${b.name} elabora y envejece vinos bajo la Denominación de Origen Montilla-Moriles.`,
      `${b.name} forma parte del paisaje vitivinícola de Montilla, donde Pedro Ximénez y las soleras definen el carácter del pueblo.`,
      `En ${b.name} se entiende la tradición bodeguera montillana: crianza, cata y memoria en roble americano.`,
    ];
    return opts[v];
  },
  restaurant: (b) => {
    const v = variant(b.slug, 3);
    const opts = [
      `${b.name} es parada de cocina montillana, donde mesa generosa y vino de la tierra van de la mano.`,
      `En ${b.name} se come con el ritmo del pueblo: tapas, platos de temporada y ambiente de barrio.`,
      `${b.name} concentra parte de la oferta gastronómica local en Montilla.`,
    ];
    return opts[v];
  },
  bar: (b) =>
    `${b.name} es parte del tejido de bares y cafés del pueblo, donde la copa y la conversación marcan el día.`,
  lodging: (b) =>
    `${b.name} permite usar Montilla como base de escapada: bodegas, patrimonio y tapeo a poca distancia.`,
  pharmacy: (b) => `${b.name} integra la red de farmacias de Montilla (14550).`,
  orthopedics: (b) => `${b.name} ofrece ortopedia técnica y material sanitario en Montilla.`,
  dental: (b) => `${b.name} ofrece atención odontológica en Montilla.`,
  beauty: (b) => `${b.name} presta servicios de peluquería, estética o barbería en el pueblo.`,
  motor: (b) => `${b.name} atiende motoristas y conductores en Montilla y la comarca.`,
  temple: (b) =>
    `${b.name} es pieza del patrimonio religioso del casco histórico, visible en cualquier ruta a pie.`,
  outdoor: (b) =>
    `${b.name} ofrece un respiro verde o un espacio de paseo dentro del municipio.`,
  culture: (b) =>
    `${b.name} concentra actividad cultural o expositiva en Montilla.`,
  school: (b) => `${b.name} forma parte de la red educativa del municipio.`,
  professional: (b) => `${b.name} presta servicios profesionales a vecinos y empresas de Montilla.`,
  foodshop: (b) =>
    `${b.name} abastece con producto de proximidad en el día a día montillano.`,
  shop: (b) => `${b.name} mantiene el comercio de barrio en el casco o en el ensanche.`,
  health: (b) => `${b.name} forma parte de la oferta de salud en Montilla.`,
  heritage: (b) =>
    `${b.name} es testimonio del legado histórico de la villa, entre iglesias, arcos y palacios del centro.`,
  generic: (b) => `${b.name} está en Montilla, en el corazón de la comarca del vino Montilla-Moriles.`,
};

function buildLead(b) {
  const name = cleanName(b.name);
  if (SLUG_EXTRA[b.slug]) {
    const first = SLUG_EXTRA[b.slug].split(/(?<=[.!])\s+/)[0]?.trim();
    if (first) return first.endsWith(".") ? first : `${first}.`;
  }
  const kind = inferKind(b);
  return OPENERS[kind]?.(b) ?? OPENERS.generic(b);
}

function buildDetail(b) {
  if (SLUG_EXTRA[b.slug]) {
    const parts = SLUG_EXTRA[b.slug].split(/(?<=[.!])\s+/);
    if (parts.length > 1) return parts.slice(1).join(" ");
  }
  return ratingPhrase(b);
}

function hoursSnippet(b) {
  if (Array.isArray(b.hoursList) && b.hoursList.length) {
    const open = b.hoursList.filter((l) => !/cerrado/i.test(l)).slice(0, 2);
    if (open.length) return `Horario habitual (Google): ${open.join("; ")}.`;
  }
  if (typeof b.hours === "string" && b.hours.length > 12 && b.hours.length < 160) {
    return `Horario de referencia: ${b.hours.replace(/\s+/g, " ").trim()}.`;
  }
  return null;
}

function typeSnippet(b) {
  const label = b.primaryType?.replace(/_/g, " ");
  if (label && label.length > 2 && label.length < 48) {
    return `En fichas de Google aparece como «${label}».`;
  }
  return null;
}

function contactSnippet(b) {
  const bits = [];
  if (b.phone) bits.push(`puedes llamar al ${b.phone}`);
  if (b.web) bits.push("consulta su web para horarios y reservas");
  if (!bits.length && b.googleMapsUrl) bits.push("confirma datos actualizados en Google Maps antes de ir");
  if (!bits.length) return null;
  return `Para concretar visita o cita, ${bits.join(" o ")}.`;
}

function categoryContext(b) {
  const contexts = {
    bodegas: [
      "Montilla-Moriles se reconoce por el fino bajo velo de flor, el amontillado y el Pedro Ximénez. Visitar una bodega aquí no es solo catar: es entender criaderas, soleras y el paisaje de albariza de la Campiña Sur.",
      "El enoturismo montillano funciona mejor sin prisas: mañana de visita, paseo por el casco y mesa con vino de la tierra. Muchas bodegas combinan tienda, cata y explicación del proceso.",
    ],
    restaurantes: [
      "La cocina de Montilla se apoya en producto de Campiña, guisos de tradición y maridaje natural con los generosos locales. El ritmo es de comida larga, no de menú exprés.",
      "Entre tabernas y asadores, el visitante encuentra desde tapeo de barra hasta mesas de reserva. El fino de grifo sigue siendo el mejor termómetro del pueblo.",
    ],
    "bares-cafes": [
      "Bares y cafés marcan el día a día montillano: café de mañana, montadito al mediodía y copa al atardecer. Son el mejor sitio para preguntar qué se cuece en el pueblo.",
    ],
    alimentacion: [
      "Comprar en Montilla es entender la despensa de la comarca: pan, aceite, fruta de temporada y productos que no siempre salen del municipio.",
    ],
    alojamiento: [
      "Dormir en Montilla permite recorrer bodegas, patrimonio y tabernas a pie o en trayectos cortos. En feria y Semana Santa la ocupación sube: conviene reservar con margen.",
    ],
    monumentos: [
      "El casco histórico concentra castillo, iglesias, conventos y arcos en un perímetro caminable. Cada parada gana si la encajas en una ruta a pie, no en un salto aislado en coche.",
    ],
    museos: [
      "Los espacios museísticos ordenan la historia local —del Inca Garcilaso al Gran Capitán— y dan contexto a lo que luego ves en calles y bodegas.",
    ],
    parques: [
      "Parques y paseos son la pausa verde del municipio: sombra, juego infantil y contraste con naves de crianza y calles empedradas.",
    ],
    "cultura-ocio": [
      "Teatro, plazas, deporte e instituciones culturales completan la agenda más allá del vino. Revisa programación según temporada.",
    ],
    comercios: [
      "El comercio de proximidad mantiene vivo el centro: moda, librería, hogar y servicios de barrio con horario partido habitual.",
    ],
    salud: [
      "Farmacias, clínicas y especialistas cubren la red local. Para urgencias y guardias, confirma siempre el turno del día.",
    ],
    belleza: [
      "Peluquerías, barberías y estética trabajan sobre todo con cita. En vísperas de feria y fiestas la demanda se concentra.",
    ],
    profesionales: [
      "Asesorías, abogados, inmobiliarias y seguros atienden a vecinos y empresas de la Campiña. El teléfono sigue siendo la vía más directa para cita.",
    ],
    motor: [
      "Talleres, gasolineras y servicios de motor cubren tanto el tráfico local como el de la N-331. En talleres, la cita previa evita esperas.",
    ],
    educacion: [
      "Colegios e institutos forman parte del tejido cotidiano del municipio, junto a comercio, hostelería y bodegas.",
    ],
  };
  const list = contexts[b.category];
  if (!list?.length) return null;
  return list[variant(b.slug, list.length)];
}

export function richDescription(b) {
  /** Solo texto editorial. Datos prácticos van en la ficha (horario, contacto, etc.). */
  const paragraphs = [];

  const lead = buildLead(b);
  if (lead) paragraphs.push(lead);

  const detail = buildDetail(b);
  if (detail && !paragraphs.some((p) => p.includes(detail.slice(0, 36)))) {
    // ratingPhrase is data — keep it out of the story
    if (!/^En Google Maps acumula|^Valorado en /.test(detail)) {
      paragraphs.push(detail);
    }
  }

  const ctx = categoryContext(b);
  if (ctx) paragraphs.push(ctx);

  return paragraphs.filter(Boolean).join("\n\n");
}

export function richTagline(b) {
  if (!b || typeof b !== "object" || !b.name) {
    return "";
  }
  const lead = buildLead(b);
  if (lead.length <= 160) return lead;
  const cut = lead.slice(0, 157).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

export function richTips(b) {
  const hints = VISIT_HINTS[b.category] ?? [];
  if (!hints.length) return "Confirma horario el mismo día de la visita.";
  return hints[variant(b.slug + "-tip", hints.length)];
}

export function richHighlights(b) {
  if (SLUG_EXTRA[b.slug]) {
    const sentences = SLUG_EXTRA[b.slug].split(/(?<=[.!])\s+/).slice(0, 3);
    return sentences
      .map((s) => s.replace(/\.$/, "").trim())
      .filter((s) => s.length > 8)
      .map((s) => (s.length > 100 ? `${s.slice(0, 97).replace(/\s+\S*$/, "")}…` : s))
      .slice(0, 3);
  }

  const kind = inferKind(b);
  const items = [];
  const kindLabels = {
    winery: "Bodega Montilla-Moriles",
    restaurant: "Cocina y mesa local",
    bar: "Bar o cafetería",
    lodging: "Alojamiento",
    temple: "Patrimonio religioso",
    outdoor: "Aire libre",
    culture: "Cultura y ocio",
    heritage: "Patrimonio",
    pharmacy: "Farmacia",
    dental: "Clínica dental",
    beauty: "Belleza",
    motor: "Motor",
    foodshop: "Alimentación",
    shop: "Comercio local",
    professional: "Servicios profesionales",
    health: "Salud",
    school: "Educación",
  };
  if (kindLabels[kind]) items.push(kindLabels[kind]);
  if (b.rating >= 4.3 && b.reviewCount >= 20) {
    items.push(`${b.rating}/5 · ${b.reviewCount} opiniones`);
  }
  if (b.featured) items.push("Destacado en la guía");
  return items.slice(0, 3);
}

export function isGenericText(text) {
  if (!text || typeof text !== "string") return true;
  const t = text.trim();
  if (t.length < 80) return true;
  return (
    /Montilla \(14550\) es una localidad de la Campiña Sur/i.test(t) ||
    /mantiene vivo el comercio de proximidad en Montilla, un municipio agrícola/i.test(t) ||
    /invita a ralentizar el ritmo de la visita: sombra de plataneros/i.test(t) ||
    /Dirección:.*Teléfono:/i.test(t)
  );
}
