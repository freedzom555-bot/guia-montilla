export const RSS_SOURCES = [
  {
    id: "montilla-digital",
    name: "Montilla Digital",
    url: "https://www.montilladigital.com/feeds/posts/default?alt=rss",
  },
];

/** Fuentes para la sección Noticias (todas las entradas, sin filtro de agenda). */
export const NEWS_RSS_SOURCES = [
  {
    id: "montilla-digital",
    name: "Montilla Digital",
    url: "https://www.montilladigital.com/feeds/posts/default?alt=rss",
  },
  {
    id: "ayto-montilla",
    name: "Ayuntamiento de Montilla",
    url: "https://www.montilla.es/feed/",
  },
];

export const EVENT_KEYWORDS = [
  "feria", "fiesta", "concierto", "exposición", "exposicion", "taller",
  "programa", "evento", "carrera", "maratón", "maraton", "teatro",
  "mercadillo", "romería", "romeria", "procesión", "procesion",
  "inaugura", "presenta", "celebra", "organiza", "actividad",
  "voluntariado", "olimpiadas", "campeonato", "festival",
];

export const OPINION_SKIP = [/\[/, /opinión/i, /editorial/i, /negro sobre blanco/i, /harina de otro/i, /diario de/i, /relatos/i];

export const MAX_EVENTS = 30;
export const MAX_AGE_DAYS = 60;

export const MAX_NEWS = 80;
export const MAX_NEWS_AGE_DAYS = 90;
