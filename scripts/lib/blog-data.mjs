const LINK_LABELS = {
  "castillo-montilla": "Castillo de Montilla",
  "bodegas-alvear": "Bodegas Alvear",
  "bodegas-perez-barquero": "Bodegas Pérez Barquero",
  "bodegas-robles": "Bodegas Robles",
  "bodegas-caballero": "Bodegas Caballero",
  "bodegas-cruz-conde": "Bodegas Cruz Conde",
  "taberna-bolero": "Taberna Bolero",
  "taberna-rincon-del-conde": "Taberna Rincón del Conde",
  "casa-del-inca": "Casa del Inca",
  "basilica-pontificia-de-san-juan-de-avila": "Basílica de San Juan de Ávila",
  "palacio-de-los-duques-de-medinaceli": "Palacio de los Duques de Medinaceli",
  "arco-de-santa-clara": "Arco de Santa Clara",
  "parroquia-santiago": "Parroquia de Santiago",
  "monumento-al-gran-capitan": "Monumento al Gran Capitán",
  "convento-santa-clara": "Convento de Santa Clara",
  "museo-historico-local-de-montilla": "Museo Histórico Local de Montilla",
  "oficina-turismo-montilla": "Oficina de Turismo de Montilla",
  "hotel-don-gonzalo": "Hotel Don Gonzalo",
  "hotel-don-ramiro": "Hotel Don Ramiro",
  "asador-la-plaza": "Asador La Plaza",
  "restaurante-taberna-los-lagares": "Restaurante Taberna Los Lagares",
  "paseo-de-las-mercedes": "Paseo de las Mercedes",
  "parque-de-la-rejoya": "Parque de la Rejoya",
  "plaza-de-munda": "Plaza de Munda",
  "teatro-garnelo": "Teatro Garnelo",
  "bodegas-navarro": "Bodegas Navarro",
  "bodegas-galan-portero": "Bodegas Galán Portero",
};

const WORDY_PRACTICAL_BLOCK =
  "Montilla se entiende mejor caminando y preguntando en barra, no solo leyendo un listado rápido. El casco histórico conserva calles empedradas que obligan a mirar despacio escaparates, patios y fachadas encaladas. A pocos minutos aparecen lagares y naves de crianza que explican por qué la D.O. Montilla-Moriles tiene una personalidad propia dentro del vino andaluz. Si vienes con poco tiempo, conviene priorizar dos o tres paradas culturales y dejar margen para una copa de fino o amontillado con tapa local. Ese equilibrio entre patrimonio, mesa y bodega es lo que hace que una visita corta no se quede en paseo fotográfico.";

const WORDY_WINE_BLOCK =
  "El vino en Montilla no es un extra para turistas: es parte del ritmo diario. En muchas tabernas, pedir una copa de fino o amontillado abre conversación sobre añadas, botas y estilos de crianza biológica u oxidativa sin necesidad de protocolo. La Campiña Sur marca el paisaje y también la lógica gastronómica: platos sencillos, producto local y vinos que funcionan en mesa sin disfraz. Quien llega por primera vez suele sorprenderse con la variedad entre bodegas históricas y proyectos más contemporáneos. La clave práctica está en reservar visitas con hora, alternar cata y comida, y dejar hueco para comprar vino directamente en bodega con mejor asesoramiento.";

const WORDY_HERITAGE_BLOCK =
  "Para entender la parte patrimonial de Montilla conviene leer la ciudad en capas: pasado medieval, peso de los linajes nobiliarios y memoria religiosa muy viva. El castillo, los templos y los edificios civiles forman un recorrido compacto que se hace bien a pie. No es una ciudad-museo congelada; conviven vida de barrio, comercio local y agenda cultural, especialmente cuando se acerca la feria de septiembre. Esa mezcla evita visitas artificiales y permite que cada parada tenga contexto real. Si te interesa la historia, merece la pena combinar monumentos con una visita al museo local para ordenar fechas y personajes antes de seguir ruta.";

const WORDY_EVENTS_BLOCK =
  "Cuando hay calendario festivo, Montilla cambia de ritmo de forma visible. La feria de septiembre mueve peñas, casetas y programación cultural; Semana Santa activa recorridos y horarios que condicionan tráfico y restauración. Para quien visita en fechas señaladas, planificar con antelación evita filas y cierres imprevistos. La ventaja es que se ve una ciudad más viva, con más opciones nocturnas y ambiente en plazas. La recomendación local es sencilla: alojamiento reservado con margen, calzado cómodo para calles empedradas y horario flexible para comer entre servicios fuertes.";

function toLink(slug) {
  return `[${LINK_LABELS[slug]}](/negocio/${slug}/)`;
}

function buildFaq(article) {
  const primary = article.keywords[0] ?? "Montilla";
  return [
    {
      q: `¿Cuánto tiempo necesito para ${primary} en Montilla?`,
      a: "Con una jornada completa puedes cubrir patrimonio, una bodega y una buena comida. Si quieres visitar varias bodegas con calma, reserva dos días.",
    },
    {
      q: "¿Es necesario reservar bodegas y restaurantes?",
      a: "Sí, especialmente viernes, sábado y festivos. Las visitas guiadas tienen aforo limitado y las tabernas más conocidas llenan pronto.",
    },
    {
      q: "¿Qué zona es mejor para empezar la ruta?",
      a: "Empieza en el centro histórico y pasa por la Oficina de Turismo para ajustar horarios. Desde ahí puedes enlazar monumentos, bodegas y zona de tapas.",
    },
  ];
}

function buildBody(article) {
  const [a, b, c] = article.relatedSlugs;
  const linkA = toLink(a);
  const linkB = toLink(b);
  const linkC = toLink(c);
  const extraLinks = article.relatedSlugs
    .slice(3)
    .map((slug) => toLink(slug))
    .join(", ");
  const section2Title =
    article.topic === "vino"
      ? "## Cómo organizar la experiencia enológica"
      : article.topic === "gastronomia"
        ? "## Dónde acertar con mesa y horario"
        : article.topic === "patrimonio"
          ? "## Recorrido patrimonial con sentido"
          : "## Ruta práctica paso a paso";

  const section3Title =
    article.topic === "vino"
      ? "## Fino, amontillado y decisiones de cata"
      : article.topic === "gastronomia"
        ? "## Vino local en la mesa: lo que funciona"
        : "## Claves locales que marcan diferencia";

  const dynamicEvents =
    article.slug.includes("feria") || article.slug.includes("semana-santa")
      ? WORDY_EVENTS_BLOCK
      : "Aunque no coincidas con grandes eventos, pregunta por agenda cultural en taquilla y turismo porque suele haber catas, visitas teatralizadas y actividad en el Teatro Garnelo durante buena parte del año.";

  return `## Qué responde esta guía
${article.hook}. ${WORDY_PRACTICAL_BLOCK}

Montilla no vive de una sola postal. Puedes empezar por ${linkA}, continuar con ${linkB} y cerrar en ${linkC} sin perder tiempo en desplazamientos largos. En el centro vas a pisar calles empedradas, plazas con vida diaria y rincones donde el vino aparece en la conversación sin forzar. Ese contexto local importa para decidir qué ver primero y qué dejar para otra visita.

${section2Title}
Si buscas ${article.searchIntent}, esta secuencia suele funcionar: primera hora para patrimonio y orientación, media mañana para visita técnica, mediodía para mesa, y tarde para paseo o compras. En la práctica, la parada en la [Oficina de Turismo de Montilla](/negocio/oficina-turismo-montilla/) evita errores de horarios, porque algunos espacios adaptan pases según temporada.

El bloque histórico se disfruta mejor con dos referencias claras: ${toLink("castillo-montilla")} y ${toLink("museo-historico-local-de-montilla")}. Después, conviene bajar el ritmo y pasar por una taberna del centro para aterrizar lo visto en la copa. Si el viaje es en fin de semana, reserva con antelación y deja márgenes entre actividades; el plan rígido suele romperse en días de alta demanda.

${section3Title}
${WORDY_WINE_BLOCK}

En términos prácticos, pide recomendaciones por estilo y momento del día: fino para aperitivo, amontillado cuando la cocina gana peso y opciones más viejas para sobremesa tranquila. Si te interesa comparar casas históricas, combina ${toLink("bodegas-alvear")} con ${toLink("bodegas-perez-barquero")} y, cuando quieras una visión diferente, añade ${toLink("bodegas-robles")} por su enfoque de sostenibilidad.

${article.topic === "patrimonio" ? WORDY_HERITAGE_BLOCK : "El patrimonio y el vino aquí no compiten; se complementan. Ver una iglesia o un arco histórico y después entrar en una bodega te da una lectura completa de la ciudad y de su economía local en la Campiña Sur."}

## Enlaces internos para montar tu ruta
Para este tema te conviene abrir y guardar: ${linkA}, ${linkB}, ${linkC}${extraLinks ? `, ${extraLinks}` : ""}. Son paradas reales y útiles para construir un itinerario sin relleno.

Si quieres comer entre visitas, dos valores seguros son ${toLink("taberna-bolero")} y ${toLink("restaurante-taberna-los-lagares")}. Para dormir sin complicarte, revisa ${toLink("hotel-don-gonzalo")} y ${toLink("hotel-don-ramiro")}, especialmente en feria de septiembre y puentes.

## Errores frecuentes y cómo evitarlos
${dynamicEvents}

Otro error clásico es intentar cubrir demasiadas bodegas en un solo día sin contar traslados, tiempos de cata y comida. Montilla se disfruta mejor con agenda realista: tres grandes bloques al día y un tramo libre para pasear por ${toLink("paseo-de-las-mercedes")} o descansar en ${toLink("parque-de-la-rejoya")}.

Si te llevas vino, pregunta por conservación y transporte antes de comprar. Las bodegas de la D.O. Montilla-Moriles suelen asesorar bien y merece la pena salir con botellas que encajen con tu forma de comer en casa, no solo con etiquetas famosas.`;
}

const RAW_ARTICLES = [
  {
    slug: "que-hacer-en-montilla",
    title: "Qué hacer en Montilla: plan local entre vino, patrimonio y tapas",
    description:
      "Descubre qué hacer en Montilla con ruta por bodegas, castillo y tabernas. Guía práctica con planes reales, horarios y consejos para acertar.",
    pubDate: "2024-09-03",
    topic: "planes",
    keywords: ["qué hacer en Montilla", "planes en Montilla", "bodegas Montilla", "ruta local Montilla", "fin de semana Montilla", "turismo Montilla"],
    relatedSlugs: ["castillo-montilla", "bodegas-alvear", "taberna-bolero", "oficina-turismo-montilla", "paseo-de-las-mercedes"],
    hook: "Si buscas qué hacer en Montilla sin perder horas en planes flojos, esta guía reúne una ruta equilibrada de vino, patrimonio y mesa",
    searchIntent: "qué hacer en Montilla en una visita completa",
  },
  {
    slug: "que-ver-en-montilla",
    title: "Qué ver en Montilla sin perderte lo esencial",
    description:
      "Listado útil de qué ver en Montilla: castillo, iglesias, museo y calles históricas. Itinerario claro para una primera visita con contexto local.",
    pubDate: "2024-09-12",
    topic: "patrimonio",
    keywords: ["qué ver en Montilla", "monumentos de Montilla", "castillo de Montilla", "patrimonio Montilla", "ruta histórica Montilla"],
    relatedSlugs: ["castillo-montilla", "basilica-pontificia-de-san-juan-de-avila", "museo-historico-local-de-montilla", "arco-de-santa-clara"],
    hook: "Para decidir qué ver en Montilla con criterio, conviene ordenar primero los imprescindibles y después sumar paradas de detalle",
    searchIntent: "qué ver en Montilla en una primera escapada",
  },
  {
    slug: "que-hay-en-montilla",
    title: "Qué hay en Montilla: mapa real de sitios, ambiente y vida local",
    description:
      "Qué hay en Montilla más allá de lo típico: bodegas, plazas, cultura y gastronomía. Guía para orientarte rápido y planificar sin improvisar.",
    pubDate: "2024-09-22",
    topic: "practico",
    keywords: ["qué hay en Montilla", "sitios en Montilla", "ambiente Montilla", "visitar Montilla", "guía local Montilla"],
    relatedSlugs: ["plaza-de-munda", "teatro-garnelo", "bodegas-perez-barquero", "taberna-rincon-del-conde"],
    hook: "Cuando alguien pregunta qué hay en Montilla, la respuesta útil mezcla lugares concretos, horarios y ambiente por franjas del día",
    searchIntent: "qué hay en Montilla para organizar una jornada",
  },
  {
    slug: "visitar-montilla-guia-completa",
    title: "Visitar Montilla: guía completa para hacerlo bien a la primera",
    description:
      "Guía completa para visitar Montilla con itinerario, bodegas recomendadas, dónde comer y cómo moverte. Todo en clave práctica y local.",
    pubDate: "2024-10-05",
    topic: "practico",
    keywords: ["visitar Montilla", "guía completa Montilla", "turismo en Montilla", "ruta Montilla-Moriles", "consejos Montilla"],
    relatedSlugs: ["oficina-turismo-montilla", "castillo-montilla", "bodegas-alvear", "restaurante-taberna-los-lagares", "hotel-don-gonzalo"],
    hook: "Visitar Montilla con una guía completa evita la típica sensación de haberse dejado lo mejor para otra ocasión",
    searchIntent: "visitar Montilla con planificación integral",
  },
  {
    slug: "montilla-en-un-dia",
    title: "Montilla en un día: ruta eficiente de mañana a noche",
    description:
      "Itinerario para ver Montilla en un día con paradas clave, bodega, comida y paseo final. Plan realista para aprovechar cada tramo horario.",
    pubDate: "2024-10-18",
    topic: "planes",
    keywords: ["Montilla en un día", "ruta 1 día Montilla", "itinerario Montilla", "qué ver Montilla rápido", "escapada Montilla"],
    relatedSlugs: ["castillo-montilla", "bodegas-perez-barquero", "asador-la-plaza", "paseo-de-las-mercedes"],
    hook: "Hacer Montilla en un día es posible si priorizas tiempos, reservas y un recorrido compacto por el centro histórico",
    searchIntent: "Montilla en un día con itinerario cerrado",
  },
  {
    slug: "fin-de-semana-en-montilla",
    title: "Fin de semana en Montilla: plan de 2 días sin huecos muertos",
    description:
      "Organiza un fin de semana en Montilla con bodegas, patrimonio, tapas y alojamiento. Guía local para viernes, sábado y domingo.",
    pubDate: "2024-11-01",
    topic: "planes",
    keywords: ["fin de semana en Montilla", "2 días en Montilla", "escapada Montilla", "qué hacer sábado Montilla", "plan domingo Montilla"],
    relatedSlugs: ["hotel-don-ramiro", "bodegas-robles", "taberna-bolero", "museo-historico-local-de-montilla", "parque-de-la-rejoya"],
    hook: "Un fin de semana en Montilla da para mucho más que una cata rápida si estructuras bien cada bloque de tiempo",
    searchIntent: "fin de semana en Montilla con noche incluida",
  },
  {
    slug: "montilla-desde-cordoba",
    title: "Montilla desde Córdoba: cómo organizar una escapada redonda",
    description:
      "Guía para ir a Montilla desde Córdoba: tiempos, transporte, ruta recomendada y regreso. Ideal para una escapada enoturística de un día.",
    pubDate: "2024-11-15",
    topic: "practico",
    keywords: ["Montilla desde Córdoba", "excursión Montilla", "cómo llegar Montilla", "enoturismo Córdoba", "día en Montilla"],
    relatedSlugs: ["oficina-turismo-montilla", "bodegas-alvear", "castillo-montilla", "taberna-rincon-del-conde"],
    hook: "Ir a Montilla desde Córdoba funciona muy bien como escapada si ajustas horarios de visita y comida desde el inicio",
    searchIntent: "Montilla desde Córdoba en una jornada",
  },
  {
    slug: "llegar-a-montilla-desde-madrid",
    title: "Llegar a Montilla desde Madrid: opciones reales y mejor estrategia",
    description:
      "Cómo llegar a Montilla desde Madrid en coche o tren-bus, con tiempos orientativos y consejos de logística para aprovechar la visita.",
    pubDate: "2024-11-28",
    topic: "practico",
    keywords: ["llegar a Montilla desde Madrid", "viajar a Montilla", "transporte a Montilla", "ruta Madrid Montilla", "visitar Montilla"],
    relatedSlugs: ["hotel-don-gonzalo", "oficina-turismo-montilla", "bodegas-perez-barquero", "plaza-de-munda"],
    hook: "Llegar a Montilla desde Madrid requiere una decisión de transporte clara para no regalar horas al desplazamiento",
    searchIntent: "cómo llegar a Montilla desde Madrid y optimizar el viaje",
  },
  {
    slug: "mejor-epoca-visitar-montilla",
    title: "Mejor época para visitar Montilla según clima, vino y agenda local",
    description:
      "Analizamos la mejor época para visitar Montilla según clima, vendimia, feria de septiembre y disponibilidad de bodegas y alojamientos.",
    pubDate: "2024-12-10",
    topic: "practico",
    keywords: ["mejor época visitar Montilla", "cuándo ir a Montilla", "feria septiembre Montilla", "vendimia Montilla", "viaje Montilla"],
    relatedSlugs: ["oficina-turismo-montilla", "bodegas-robles", "hotel-don-ramiro", "paseo-de-las-mercedes"],
    hook: "Elegir la mejor época para visitar Montilla cambia por completo la experiencia entre clima, agenda cultural y disponibilidad",
    searchIntent: "mejor época para visitar Montilla con buen plan",
  },
  {
    slug: "historia-montilla-10-hitos",
    title: "Historia de Montilla en 10 hitos para entender la ciudad",
    description:
      "Repaso de la historia de Montilla en 10 hitos: castillo, linajes, figuras clave y legado enológico de la Campiña Sur y Montilla-Moriles.",
    pubDate: "2025-01-07",
    topic: "patrimonio",
    keywords: ["historia de Montilla", "hitos históricos Montilla", "Gran Capitán Montilla", "San Juan de Ávila", "castillo Montilla"],
    relatedSlugs: ["castillo-montilla", "monumento-al-gran-capitan", "basilica-pontificia-de-san-juan-de-avila", "museo-historico-local-de-montilla"],
    hook: "La historia de Montilla se entiende mejor cuando conectas personajes, espacios y el peso económico del vino",
    searchIntent: "historia de Montilla resumida y útil",
  },
  {
    slug: "castillo-montilla-guia-visita",
    title: "Castillo de Montilla: guía de visita para aprovechar cada rincón",
    description:
      "Guía para visitar el Castillo de Montilla con contexto histórico, tiempos de recorrido y consejos para combinarlo con otras paradas cercanas.",
    pubDate: "2025-01-22",
    topic: "patrimonio",
    keywords: ["castillo de Montilla", "visita castillo Montilla", "qué ver castillo Montilla", "patrimonio Montilla", "ruta histórica"],
    relatedSlugs: ["castillo-montilla", "museo-historico-local-de-montilla", "plaza-de-munda", "oficina-turismo-montilla"],
    hook: "El Castillo de Montilla merece una visita con contexto, porque su valor va mucho más allá de una foto en la muralla",
    searchIntent: "guía de visita del Castillo de Montilla",
  },
  {
    slug: "inca-garcilaso-montilla",
    title: "Inca Garcilaso en Montilla: claves para seguir su huella",
    description:
      "Recorre la huella del Inca Garcilaso en Montilla con paradas históricas y contexto literario. Ruta cultural para curiosos y visitantes.",
    pubDate: "2025-02-03",
    topic: "patrimonio",
    keywords: ["Inca Garcilaso Montilla", "Casa del Inca", "ruta cultural Montilla", "historia Montilla", "qué ver Montilla"],
    relatedSlugs: ["casa-del-inca", "museo-historico-local-de-montilla", "palacio-de-los-duques-de-medinaceli", "arco-de-santa-clara"],
    hook: "La relación del Inca Garcilaso con Montilla aporta una capa cultural que muchas rutas rápidas pasan por alto",
    searchIntent: "huella del Inca Garcilaso en Montilla",
  },
  {
    slug: "san-juan-avila-montilla",
    title: "San Juan de Ávila en Montilla: recorrido para entender su legado",
    description:
      "Descubre el legado de San Juan de Ávila en Montilla con guía de templos, contexto histórico y consejos para una visita bien documentada.",
    pubDate: "2025-02-14",
    topic: "patrimonio",
    keywords: ["San Juan de Ávila Montilla", "Basílica Montilla", "patrimonio religioso Montilla", "ruta espiritual Montilla", "qué ver"],
    relatedSlugs: ["basilica-pontificia-de-san-juan-de-avila", "convento-santa-clara", "parroquia-santiago", "oficina-turismo-montilla"],
    hook: "San Juan de Ávila marca de forma profunda la identidad religiosa de Montilla y se aprecia mejor con una ruta bien hilada",
    searchIntent: "legado de San Juan de Ávila en Montilla",
  },
  {
    slug: "gran-capitan-lugares-montilla",
    title: "Lugares del Gran Capitán en Montilla para una ruta histórica clara",
    description:
      "Guía de lugares vinculados al Gran Capitán en Montilla con itinerario breve y contexto para comprender su papel en la historia local.",
    pubDate: "2025-02-27",
    topic: "patrimonio",
    keywords: ["Gran Capitán Montilla", "lugares históricos Montilla", "monumento Gran Capitán", "ruta histórica Montilla", "patrimonio"],
    relatedSlugs: ["monumento-al-gran-capitan", "castillo-montilla", "museo-historico-local-de-montilla", "plaza-de-munda"],
    hook: "Seguir los lugares del Gran Capitán en Montilla ayuda a leer la ciudad con una narrativa histórica coherente",
    searchIntent: "lugares del Gran Capitán en Montilla",
  },
  {
    slug: "calles-empedradas-montilla",
    title: "Calles empedradas de Montilla: paseo con historia y buena luz",
    description:
      "Ruta por las calles empedradas de Montilla con rincones fotogénicos, patrimonio cercano y recomendaciones para caminar sin prisa.",
    pubDate: "2025-03-09",
    topic: "patrimonio",
    keywords: ["calles empedradas Montilla", "paseo histórico Montilla", "casco antiguo Montilla", "qué ver Montilla", "ruta a pie"],
    relatedSlugs: ["arco-de-santa-clara", "parroquia-santiago", "plaza-de-munda", "paseo-de-las-mercedes"],
    hook: "Las calles empedradas de Montilla cuentan mejor la ciudad cuando las recorres enlazando plazas, arcos e iglesias",
    searchIntent: "calles empedradas de Montilla y paseo",
  },
  {
    slug: "patrimonio-religioso-montilla",
    title: "Patrimonio religioso de Montilla: templos clave y visita inteligente",
    description:
      "Qué ver del patrimonio religioso de Montilla: basílica, parroquias y conventos. Guía práctica con orden recomendado y tiempos reales.",
    pubDate: "2025-03-21",
    topic: "patrimonio",
    keywords: ["patrimonio religioso Montilla", "iglesias Montilla", "basílica Montilla", "conventos Montilla", "ruta cultural"],
    relatedSlugs: ["basilica-pontificia-de-san-juan-de-avila", "parroquia-santiago", "convento-santa-clara", "arco-de-santa-clara"],
    hook: "El patrimonio religioso de Montilla es denso y cercano, por eso conviene recorrerlo en un orden lógico de norte a centro",
    searchIntent: "patrimonio religioso de Montilla en una ruta",
  },
  {
    slug: "vino-montilla-moriles-guia",
    title: "Vino Montilla-Moriles: guía clara para empezar y disfrutar",
    description:
      "Guía del vino Montilla-Moriles: estilos, crianzas y claves para catar fino y amontillado en Montilla con criterio local.",
    pubDate: "2025-04-02",
    topic: "vino",
    keywords: ["vino Montilla-Moriles", "fino y amontillado", "cata en Montilla", "bodegas Montilla", "enoturismo Córdoba"],
    relatedSlugs: ["bodegas-alvear", "bodegas-perez-barquero", "bodegas-robles", "bodegas-navarro", "bodegas-galan-portero"],
    hook: "Si quieres una guía útil del vino Montilla-Moriles, necesitas vocabulario claro y bodegas que muestren estilos distintos",
    searchIntent: "guía del vino Montilla-Moriles para visitantes",
  },
  {
    slug: "fino-amontillado-diferencias",
    title: "Fino y amontillado: diferencias reales explicadas en lenguaje fácil",
    description:
      "Aprende las diferencias entre fino y amontillado con ejemplos prácticos, maridajes y consejos para pedir bien en tabernas de Montilla.",
    pubDate: "2025-04-16",
    topic: "vino",
    keywords: ["diferencia fino amontillado", "fino Montilla", "amontillado Montilla", "maridaje vinos", "tabernas Montilla"],
    relatedSlugs: ["taberna-bolero", "taberna-rincon-del-conde", "bodegas-perez-barquero", "bodegas-alvear"],
    hook: "Entender las diferencias entre fino y amontillado te permite elegir mejor en bodega, tienda y barra",
    searchIntent: "diferencias entre fino y amontillado en Montilla",
  },
  {
    slug: "bodegas-visitar-montilla",
    title: "Bodegas que visitar en Montilla si quieres una experiencia completa",
    description:
      "Selección de bodegas para visitar en Montilla con perfiles distintos, consejos de reserva y orden recomendado para una jornada.",
    pubDate: "2025-04-28",
    topic: "vino",
    keywords: ["bodegas visitar Montilla", "enoturismo Montilla", "catas en Montilla", "D.O. Montilla-Moriles", "ruta bodegas"],
    relatedSlugs: ["bodegas-alvear", "bodegas-perez-barquero", "bodegas-robles", "bodegas-caballero", "bodegas-cruz-conde"],
    hook: "Elegir bodegas para visitar en Montilla depende de si buscas historia, técnica de crianza o un enfoque más sostenible",
    searchIntent: "bodegas que visitar en Montilla",
  },
  {
    slug: "cata-vinos-montilla-consejos",
    title: "Cata de vinos en Montilla: consejos para disfrutar y aprender de verdad",
    description:
      "Consejos para una cata de vinos en Montilla: cómo reservar, qué preguntar, orden de degustación y errores típicos del visitante.",
    pubDate: "2025-05-11",
    topic: "vino",
    keywords: ["cata de vinos Montilla", "consejos cata", "enoturismo Montilla", "fino amontillado", "visita bodegas"],
    relatedSlugs: ["bodegas-robles", "bodegas-perez-barquero", "bodegas-navarro", "taberna-bolero"],
    hook: "Una cata en Montilla se aprovecha mejor cuando llegas con preguntas concretas y sabes ordenar los vinos",
    searchIntent: "consejos para cata de vinos en Montilla",
  },
  {
    slug: "mejores-bodegas-montilla",
    title: "Mejores bodegas de Montilla para distintos perfiles de visitante",
    description:
      "Comparativa de las mejores bodegas de Montilla según tipo de visita, estilo de vino y tiempo disponible para enoturismo.",
    pubDate: "2025-05-25",
    topic: "vino",
    keywords: ["mejores bodegas Montilla", "bodegas recomendadas Montilla", "enoturismo Montilla", "vino Montilla-Moriles", "visitas guiadas"],
    relatedSlugs: ["bodegas-alvear", "bodegas-perez-barquero", "bodegas-robles", "bodegas-galan-portero", "bodegas-caballero"],
    hook: "Hablar de mejores bodegas en Montilla solo tiene sentido si defines primero qué tipo de visita te interesa",
    searchIntent: "mejores bodegas de Montilla según perfil",
  },
  {
    slug: "bodegas-alvear-visita-guia",
    title: "Bodegas Alvear: guía de visita para sacarle partido",
    description:
      "Guía para visitar Bodegas Alvear en Montilla con claves de reserva, recorrido, cata y cómo integrarla en un día enoturístico.",
    pubDate: "2025-06-08",
    topic: "vino",
    keywords: ["Bodegas Alvear visita", "guía Alvear Montilla", "cata Alvear", "enoturismo Montilla", "vino fino"],
    relatedSlugs: ["bodegas-alvear", "taberna-rincon-del-conde", "oficina-turismo-montilla", "hotel-don-gonzalo"],
    hook: "La visita a Bodegas Alvear funciona mejor cuando la colocas en el momento adecuado de la jornada",
    searchIntent: "cómo visitar Bodegas Alvear en Montilla",
  },
  {
    slug: "perez-barquero-visita",
    title: "Visita a Pérez Barquero: qué esperar y cómo planificar",
    description:
      "Todo para planificar tu visita a Pérez Barquero en Montilla: reservas, tiempos, cata y sugerencias para completar el día.",
    pubDate: "2025-06-21",
    topic: "vino",
    keywords: ["Pérez Barquero visita", "bodegas en Montilla", "cata Montilla", "vino amontillado", "enoturismo"],
    relatedSlugs: ["bodegas-perez-barquero", "bodegas-cruz-conde", "restaurante-taberna-los-lagares", "plaza-de-munda"],
    hook: "Visitar Pérez Barquero con una agenda bien pensada mejora mucho la experiencia de cata y aprendizaje",
    searchIntent: "visita a Pérez Barquero en Montilla",
  },
  {
    slug: "enoturismo-montilla-sin-coche",
    title: "Enoturismo en Montilla sin coche: sí se puede y así se hace",
    description:
      "Cómo hacer enoturismo en Montilla sin coche con rutas a pie, bodegas cercanas y logística para disfrutar sin prisas ni complicaciones.",
    pubDate: "2025-07-04",
    topic: "vino",
    keywords: ["enoturismo Montilla sin coche", "ruta a pie bodegas", "visitar Montilla", "cata sin conducir", "Montilla-Moriles"],
    relatedSlugs: ["oficina-turismo-montilla", "bodegas-alvear", "bodegas-navarro", "taberna-bolero", "hotel-don-ramiro"],
    hook: "Hacer enoturismo en Montilla sin coche es una opción muy razonable gracias a la proximidad de muchas paradas",
    searchIntent: "enoturismo en Montilla sin coche",
  },
  {
    slug: "ruta-bodegas-montilla-pie",
    title: "Ruta de bodegas en Montilla a pie para una jornada completa",
    description:
      "Diseñamos una ruta de bodegas en Montilla a pie con tiempos realistas, descansos y propuestas de comida para cerrar el plan.",
    pubDate: "2025-07-17",
    topic: "vino",
    keywords: ["ruta bodegas Montilla a pie", "enoturismo caminando", "bodegas céntricas Montilla", "cata vinos Montilla", "plan enológico"],
    relatedSlugs: ["bodegas-galan-portero", "bodegas-navarro", "bodegas-alvear", "taberna-rincon-del-conde", "paseo-de-las-mercedes"],
    hook: "Una ruta de bodegas en Montilla a pie exige ritmo cómodo, reservas previas y buenas pausas para comer",
    searchIntent: "ruta de bodegas en Montilla a pie",
  },
  {
    slug: "donde-comer-montilla",
    title: "Dónde comer en Montilla: guía local para no fallar",
    description:
      "Dónde comer en Montilla según presupuesto y estilo: tabernas, asadores y cocina local con fino y amontillado bien servidos.",
    pubDate: "2025-08-02",
    topic: "gastronomia",
    keywords: ["dónde comer en Montilla", "restaurantes Montilla", "tabernas Montilla", "gastronomía Montilla", "tapas Montilla"],
    relatedSlugs: ["taberna-bolero", "restaurante-taberna-los-lagares", "asador-la-plaza", "taberna-rincon-del-conde"],
    hook: "Saber dónde comer en Montilla pasa por elegir bien el tipo de casa y el momento del servicio",
    searchIntent: "dónde comer en Montilla hoy",
  },
  {
    slug: "mejores-restaurantes-montilla",
    title: "Mejores restaurantes de Montilla para comer con criterio local",
    description:
      "Selección de los mejores restaurantes de Montilla con enfoque práctico: ambiente, platos destacados y maridaje con vinos de la zona.",
    pubDate: "2025-08-16",
    topic: "gastronomia",
    keywords: ["mejores restaurantes Montilla", "dónde comer Montilla", "restaurantes recomendados", "maridaje Montilla", "gastronomía local"],
    relatedSlugs: ["asador-la-plaza", "restaurante-taberna-los-lagares", "taberna-rincon-del-conde", "taberna-bolero"],
    hook: "Al hablar de los mejores restaurantes de Montilla hay que mirar cocina, servicio y encaje con vino local",
    searchIntent: "mejores restaurantes de Montilla",
  },
  {
    slug: "tabernas-fino-montilla",
    title: "Tabernas de fino en Montilla: dónde ir y qué pedir",
    description:
      "Guía de tabernas de fino en Montilla con recomendaciones de copas, tapas y horarios para disfrutar el ambiente más auténtico.",
    pubDate: "2025-09-01",
    topic: "gastronomia",
    keywords: ["tabernas de fino Montilla", "fino en Montilla", "dónde tomar fino", "tapas y vino Montilla", "tabernas clásicas"],
    relatedSlugs: ["taberna-bolero", "taberna-rincon-del-conde", "bodegas-perez-barquero", "plaza-de-munda"],
    hook: "Las tabernas de fino en Montilla tienen códigos propios y saber pedir marca mucha diferencia",
    searchIntent: "tabernas de fino en Montilla",
  },
  {
    slug: "salmorejo-montilla-donde-probar",
    title: "Salmorejo en Montilla: dónde probarlo bien hecho",
    description:
      "Dónde probar salmorejo en Montilla con textura y sabor de casa. Recomendaciones de tabernas y maridajes con fino local.",
    pubDate: "2025-09-14",
    topic: "gastronomia",
    keywords: ["salmorejo Montilla", "dónde comer salmorejo", "tabernas Montilla", "gastronomía cordobesa", "fino Montilla"],
    relatedSlugs: ["taberna-bolero", "restaurante-taberna-los-lagares", "taberna-rincon-del-conde", "bodegas-alvear"],
    hook: "Para encontrar buen salmorejo en Montilla conviene priorizar casas con cocina tradicional y producto cercano",
    searchIntent: "dónde probar salmorejo en Montilla",
  },
  {
    slug: "alcachofas-montilla-gastronomia",
    title: "Alcachofas en Montilla: plato local y dónde pedirlas",
    description:
      "Guía gastronómica sobre alcachofas en Montilla: temporada, preparaciones habituales y restaurantes donde pedirlas con acierto.",
    pubDate: "2025-09-28",
    topic: "gastronomia",
    keywords: ["alcachofas Montilla", "gastronomía Montilla", "qué comer en Montilla", "restaurantes locales", "temporada alcachofa"],
    relatedSlugs: ["asador-la-plaza", "restaurante-taberna-los-lagares", "taberna-bolero", "bodegas-robles"],
    hook: "Las alcachofas en Montilla aparecen en cartas de temporada y son una muy buena puerta de entrada a la cocina local",
    searchIntent: "alcachofas en Montilla y dónde comerlas",
  },
  {
    slug: "donde-dormir-montilla",
    title: "Dónde dormir en Montilla: zonas y opciones según tu viaje",
    description:
      "Consejos para elegir dónde dormir en Montilla con opciones céntricas, para enoturismo o escapada tranquila de fin de semana.",
    pubDate: "2025-10-11",
    topic: "practico",
    keywords: ["dónde dormir en Montilla", "alojamiento Montilla", "hotel en Montilla", "fin de semana Montilla", "turismo Montilla"],
    relatedSlugs: ["hotel-don-gonzalo", "hotel-don-ramiro", "oficina-turismo-montilla", "paseo-de-las-mercedes"],
    hook: "Elegir dónde dormir en Montilla depende de si priorizas centro, tranquilidad o acceso directo a bodegas",
    searchIntent: "dónde dormir en Montilla con buen acceso",
  },
  {
    slug: "hoteles-hostales-montilla",
    title: "Hoteles y hostales en Montilla: comparación útil para reservar",
    description:
      "Comparativa práctica de hoteles y hostales en Montilla con ubicación, comodidad y recomendaciones según tipo de escapada.",
    pubDate: "2025-10-24",
    topic: "practico",
    keywords: ["hoteles en Montilla", "hostales Montilla", "dónde alojarse Montilla", "reserva hotel Montilla", "viaje Montilla"],
    relatedSlugs: ["hotel-don-gonzalo", "hotel-don-ramiro", "plaza-de-munda", "oficina-turismo-montilla"],
    hook: "La oferta de hoteles y hostales en Montilla se aprovecha mejor cuando comparas ubicación y plan de visitas",
    searchIntent: "hoteles y hostales en Montilla comparados",
  },
  {
    slug: "montilla-con-ninos-planes",
    title: "Montilla con niños: planes cómodos para familias",
    description:
      "Planes en Montilla con niños: parques, paseos y actividades culturales fáciles de combinar con comida y descansos familiares.",
    pubDate: "2025-11-06",
    topic: "planes",
    keywords: ["Montilla con niños", "planes familiares Montilla", "qué hacer con niños Montilla", "parques Montilla", "ruta familiar"],
    relatedSlugs: ["parque-de-la-rejoya", "paseo-de-las-mercedes", "museo-historico-local-de-montilla", "asador-la-plaza"],
    hook: "Montilla con niños funciona muy bien si alternas tramos cortos de paseo con paradas de sombra y comida temprana",
    searchIntent: "planes con niños en Montilla",
  },
  {
    slug: "parques-paseos-montilla",
    title: "Parques y paseos en Montilla para bajar el ritmo",
    description:
      "Descubre parques y paseos en Montilla para caminar, descansar y combinar con ruta cultural o gastronómica en el centro.",
    pubDate: "2025-11-19",
    topic: "planes",
    keywords: ["parques de Montilla", "paseos en Montilla", "qué hacer al aire libre", "ruta tranquila Montilla", "familia Montilla"],
    relatedSlugs: ["parque-de-la-rejoya", "paseo-de-las-mercedes", "plaza-de-munda", "teatro-garnelo"],
    hook: "Los parques y paseos de Montilla son el contrapunto perfecto a una agenda intensa de bodegas y patrimonio",
    searchIntent: "parques y paseos en Montilla",
  },
  {
    slug: "feria-montilla-septiembre",
    title: "Feria de Montilla en septiembre: guía para vivirla como local",
    description:
      "Todo sobre la feria de Montilla en septiembre: ambiente, horarios, dónde comer, alojamiento y consejos para moverte sin estrés.",
    pubDate: "2025-12-01",
    topic: "planes",
    keywords: ["feria de Montilla", "septiembre Montilla", "fiestas Montilla", "qué hacer en feria", "alojamiento feria"],
    relatedSlugs: ["hotel-don-gonzalo", "taberna-bolero", "oficina-turismo-montilla", "paseo-de-las-mercedes"],
    hook: "La feria de septiembre en Montilla se disfruta mejor cuando conoces sus tiempos y reservas con antelación",
    searchIntent: "feria de Montilla en septiembre",
  },
  {
    slug: "semana-santa-montilla",
    title: "Semana Santa en Montilla: recorrido, ambiente y consejos",
    description:
      "Guía de Semana Santa en Montilla con claves de itinerarios, horarios y recomendaciones para visitantes que quieren vivirla bien.",
    pubDate: "2025-12-14",
    topic: "planes",
    keywords: ["Semana Santa Montilla", "procesiones Montilla", "qué ver Semana Santa", "tradición Montilla", "visitar Montilla"],
    relatedSlugs: ["parroquia-santiago", "convento-santa-clara", "plaza-de-munda", "oficina-turismo-montilla"],
    hook: "La Semana Santa de Montilla combina tradición y cercanía, pero requiere cierta planificación para verla con comodidad",
    searchIntent: "Semana Santa en Montilla para visitantes",
  },
  {
    slug: "olivar-viñedo-montilla-paisaje",
    title: "Olivar y viñedo en Montilla: paisaje agrícola con identidad propia",
    description:
      "Cómo entender el paisaje de olivar y viñedo en Montilla, su relación con la Campiña Sur y su impacto en vino y gastronomía local.",
    pubDate: "2026-01-03",
    topic: "vino",
    keywords: ["olivar y viñedo Montilla", "Campiña Sur", "paisaje Montilla", "vino Montilla-Moriles", "turismo rural Montilla"],
    relatedSlugs: ["bodegas-robles", "bodegas-navarro", "bodegas-galan-portero", "oficina-turismo-montilla"],
    hook: "El paisaje de olivar y viñedo en Montilla explica tanto la economía local como el carácter de sus vinos",
    searchIntent: "olivar y viñedo en Montilla y su valor",
  },
  {
    slug: "museos-montilla-guia",
    title: "Museos en Montilla: guía corta para elegir bien",
    description:
      "Guía de museos en Montilla con enfoque práctico: qué ver, cuánto tiempo dedicar y cómo integrarlos en una ruta de día completo.",
    pubDate: "2026-01-15",
    topic: "patrimonio",
    keywords: ["museos Montilla", "Museo Histórico Montilla", "qué ver en Montilla", "ruta cultural Montilla", "plan museos"],
    relatedSlugs: ["museo-historico-local-de-montilla", "casa-del-inca", "teatro-garnelo", "plaza-de-munda"],
    hook: "Los museos de Montilla son pocos pero muy útiles para entender el relato local antes de seguir caminando",
    searchIntent: "museos en Montilla y cómo visitarlos",
  },
  {
    slug: "oficina-turismo-montilla-como-usar",
    title: "Oficina de Turismo de Montilla: cómo usarla para planificar mejor",
    description:
      "Aprende a usar la Oficina de Turismo de Montilla para ajustar horarios, reservar visitas y montar rutas sin pérdida de tiempo.",
    pubDate: "2026-01-28",
    topic: "practico",
    keywords: ["Oficina de Turismo Montilla", "información turística Montilla", "ruta Montilla", "horarios Montilla", "visitar Montilla"],
    relatedSlugs: ["oficina-turismo-montilla", "castillo-montilla", "bodegas-alvear", "museo-historico-local-de-montilla"],
    hook: "La Oficina de Turismo de Montilla sigue siendo la herramienta más rentable para optimizar una visita corta",
    searchIntent: "cómo usar la Oficina de Turismo de Montilla",
  },
  {
    slug: "dia-enoturistico-cordoba-montilla",
    title: "Día enoturístico Córdoba-Montilla: plan redondo de ida y vuelta",
    description:
      "Propuesta de día enoturístico entre Córdoba y Montilla con ruta de bodegas, comida local y tiempos para volver sin prisas.",
    pubDate: "2026-02-10",
    topic: "vino",
    keywords: ["día enoturístico Córdoba Montilla", "ruta vino Córdoba", "bodegas Montilla", "escapada enológica", "Montilla-Moriles"],
    relatedSlugs: ["bodegas-perez-barquero", "bodegas-alvear", "taberna-rincon-del-conde", "oficina-turismo-montilla"],
    hook: "Un día enoturístico Córdoba-Montilla se disfruta mucho más con agenda compacta y reservas cerradas",
    searchIntent: "día enoturístico desde Córdoba a Montilla",
  },
  {
    slug: "bodegas-ecologicas-montilla-robles",
    title: "Bodegas ecológicas en Montilla: por qué Robles es referencia",
    description:
      "Guía sobre bodegas ecológicas en Montilla con foco en Robles: sostenibilidad, visita recomendada y cata con mirada práctica.",
    pubDate: "2026-02-22",
    topic: "vino",
    keywords: ["bodegas ecológicas Montilla", "Bodegas Robles", "vino ecológico Montilla", "enoturismo sostenible", "Montilla-Moriles"],
    relatedSlugs: ["bodegas-robles", "bodegas-alvear", "bodegas-navarro", "restaurante-taberna-los-lagares"],
    hook: "Hablar de bodegas ecológicas en Montilla lleva de forma natural a Robles y a su enfoque integral",
    searchIntent: "bodegas ecológicas en Montilla con visita",
  },
  {
    slug: "bodas-eventos-bodegas-montilla",
    title: "Bodas y eventos en bodegas de Montilla: claves para elegir espacio",
    description:
      "Consejos para organizar bodas y eventos en bodegas de Montilla: capacidad, logística, catering y calendario recomendado.",
    pubDate: "2026-03-05",
    topic: "practico",
    keywords: ["bodas en bodegas Montilla", "eventos Montilla", "espacios para bodas", "bodegas para celebraciones", "Montilla-Moriles"],
    relatedSlugs: ["bodegas-alvear", "bodegas-perez-barquero", "bodegas-caballero", "hotel-don-gonzalo"],
    hook: "Montilla ofrece bodegas con mucha personalidad para bodas y eventos, pero elegir bien exige revisar logística",
    searchIntent: "bodas y eventos en bodegas de Montilla",
  },
  {
    slug: "comprar-vino-montilla-moriles",
    title: "Comprar vino Montilla-Moriles: dónde ir y qué llevarte",
    description:
      "Guía para comprar vino Montilla-Moriles en Montilla con recomendaciones de bodegas, estilos y consejos de conservación en casa.",
    pubDate: "2026-03-17",
    topic: "vino",
    keywords: ["comprar vino Montilla-Moriles", "dónde comprar vino en Montilla", "fino amontillado compra", "bodegas Montilla", "tienda vino"],
    relatedSlugs: ["bodegas-alvear", "bodegas-perez-barquero", "bodegas-galan-portero", "bodegas-navarro"],
    hook: "Comprar vino Montilla-Moriles en origen permite elegir mejor y salir con botellas realmente adaptadas a tu gusto",
    searchIntent: "comprar vino Montilla-Moriles en Montilla",
  },
  {
    slug: "ruta-tapas-fino-montilla",
    title: "Ruta de tapas y fino en Montilla para una tarde perfecta",
    description:
      "Diseñamos una ruta de tapas y fino en Montilla con paradas concretas, orden recomendado y consejos para evitar esperas.",
    pubDate: "2026-03-29",
    topic: "gastronomia",
    keywords: ["ruta tapas Montilla", "fino en Montilla", "tabernas Montilla", "dónde tapear Montilla", "gastronomía local"],
    relatedSlugs: ["taberna-bolero", "taberna-rincon-del-conde", "restaurante-taberna-los-lagares", "plaza-de-munda"],
    hook: "Una ruta de tapas y fino en Montilla gana mucho cuando eliges bien el orden de paradas y los horarios",
    searchIntent: "ruta de tapas y fino en Montilla",
  },
  {
    slug: "montilla-de-noche",
    title: "Montilla de noche: qué hacer después de cenar",
    description:
      "Qué hacer en Montilla de noche: paseo, copas de vino, agenda cultural y zonas con más ambiente para cerrar el día.",
    pubDate: "2026-04-07",
    topic: "planes",
    keywords: ["Montilla de noche", "qué hacer noche Montilla", "ambiente Montilla", "copas y vino Montilla", "plan nocturno"],
    relatedSlugs: ["teatro-garnelo", "plaza-de-munda", "taberna-bolero", "paseo-de-las-mercedes"],
    hook: "Montilla de noche se disfruta mejor con un plan sencillo que combine paseo, copa y alguna parada cultural",
    searchIntent: "qué hacer en Montilla de noche",
  },
  {
    slug: "pueblos-cerca-montilla-excursion",
    title: "Pueblos cerca de Montilla para una excursión de un día",
    description:
      "Ideas de pueblos cerca de Montilla para excursión, con enfoque práctico para combinar salida, comida y regreso sin agobios.",
    pubDate: "2026-04-18",
    topic: "planes",
    keywords: ["pueblos cerca de Montilla", "excursión desde Montilla", "qué ver alrededor de Montilla", "Campiña Sur", "ruta día"],
    relatedSlugs: ["oficina-turismo-montilla", "hotel-don-ramiro", "paseo-de-las-mercedes", "bodegas-robles"],
    hook: "Si ya conoces el centro, los pueblos cerca de Montilla amplían la escapada sin perder base en la ciudad",
    searchIntent: "pueblos cerca de Montilla para excursión",
  },
  {
    slug: "montilla-en-pareja-romantico",
    title: "Montilla en pareja: plan romántico sin postureo",
    description:
      "Propuesta para disfrutar Montilla en pareja con bodegas, cena tranquila y paseo entre calles empedradas y plazas con ambiente.",
    pubDate: "2026-04-27",
    topic: "planes",
    keywords: ["Montilla en pareja", "plan romántico Montilla", "escapada pareja Montilla", "cena romántica Montilla", "fin de semana"],
    relatedSlugs: ["hotel-don-gonzalo", "taberna-rincon-del-conde", "bodegas-alvear", "paseo-de-las-mercedes"],
    hook: "Montilla en pareja funciona cuando priorizas calma, buena mesa y una bodega con visita bien guiada",
    searchIntent: "Montilla en pareja plan romántico",
  },
  {
    slug: "montilla-accesible-turismo",
    title: "Montilla accesible: guía de turismo para moverse con confianza",
    description:
      "Guía de turismo accesible en Montilla con recomendaciones de rutas, paradas cómodas y planificación para evitar barreras.",
    pubDate: "2026-05-05",
    topic: "practico",
    keywords: ["Montilla accesible", "turismo accesible Montilla", "ruta accesible Montilla", "viajar con movilidad reducida", "guía práctica"],
    relatedSlugs: ["oficina-turismo-montilla", "paseo-de-las-mercedes", "parque-de-la-rejoya", "hotel-don-gonzalo"],
    hook: "El turismo accesible en Montilla mejora mucho cuando preparas recorrido, descansos y horarios con antelación",
    searchIntent: "Montilla accesible para visitar",
  },
  {
    slug: "48-horas-montilla-moriles",
    title: "48 horas en Montilla-Moriles: itinerario completo y realista",
    description:
      "Itinerario de 48 horas en Montilla-Moriles con bodegas, patrimonio, restaurantes y alojamiento para un fin de semana redondo.",
    pubDate: "2026-05-17",
    topic: "planes",
    keywords: ["48 horas Montilla-Moriles", "fin de semana enoturismo", "itinerario Montilla", "qué hacer dos días", "ruta vino"],
    relatedSlugs: ["bodegas-perez-barquero", "bodegas-alvear", "castillo-montilla", "restaurante-taberna-los-lagares", "hotel-don-ramiro"],
    hook: "Con 48 horas en Montilla-Moriles puedes combinar profundidad enológica y patrimonio sin correr",
    searchIntent: "48 horas en Montilla-Moriles",
  },
  {
    slug: "montilla-cordoba-diferencias",
    title: "Montilla y Córdoba: diferencias para elegir mejor tu escapada",
    description:
      "Comparamos Montilla y Córdoba para ayudarte a elegir según estilo de viaje, tiempo disponible y objetivo gastronómico o cultural.",
    pubDate: "2026-05-29",
    topic: "practico",
    keywords: ["Montilla o Córdoba", "diferencias Montilla Córdoba", "escapada en Andalucía", "enoturismo Montilla", "qué ciudad elegir"],
    relatedSlugs: ["oficina-turismo-montilla", "bodegas-robles", "castillo-montilla", "taberna-bolero"],
    hook: "Comparar Montilla con Córdoba es útil para decidir entre una gran ciudad monumental y una escapada enológica compacta",
    searchIntent: "diferencias entre Montilla y Córdoba",
  },
];

export const ARTICLES = RAW_ARTICLES.map((article) => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  pubDate: article.pubDate,
  topic: article.topic,
  keywords: article.keywords,
  relatedSlugs: article.relatedSlugs,
  faq: buildFaq(article),
  body: buildBody(article),
}));
