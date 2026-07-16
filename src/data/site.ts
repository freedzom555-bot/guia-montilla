/** Configuración global del sitio — cambia SITE_URL al publicar */
export const SITE = {
  name: "Guía Montilla",
  tagline: "Directorio local de Montilla-Moriles",
  url: import.meta.env.SITE_URL ?? "https://guiamontilla.es",
  locale: "es_ES",
  email: "info@guiamontilla.es",
  phone: "621 19 18 16",
  emailNegocios: "info@guiamontilla.es",
  twitter: "@guiamontilla",
};

export const LEGAL = {
  owner: "Guía Montilla",
  url: "https://guiamontilla.es",
  email: "info@guiamontilla.es",
  privacyEmail: "info@guiamontilla.es",
  phone: "621 19 18 16",
  country: "España",
  developer: "Kyvera Digital",
  developerUrl: "https://kyveradigital.es",
};

export const SEO = {
  defaultTitle: "Guía Montilla — Bodegas, mesas, rutas y todo el pueblo",
  defaultDescription:
    "La guía de Montilla (Córdoba): bodegas Montilla-Moriles, restaurantes, monumentos, comercios, senderismo y noticias. Fotos, horarios y cómo llegar.",
  ogImage: "/images/og-default.jpg",
};
