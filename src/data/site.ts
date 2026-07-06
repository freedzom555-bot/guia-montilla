/** Configuración global del sitio — cambia SITE_URL al publicar */
export const SITE = {
  name: "Guía Montilla",
  tagline: "Directorio local de Montilla-Moriles",
  url: import.meta.env.SITE_URL ?? "https://guiamontilla.es",
  locale: "es_ES",
  email: "hola@guiamontilla.es",
  emailNegocios: "negocios@guiamontilla.es",
  twitter: "@guiamontilla",
};

export const LEGAL = {
  owner: "Guía Montilla",
  url: "https://guiamontilla.es",
  email: "hola@guiamontilla.es",
  privacyEmail: "hola@guiamontilla.es",
  country: "España",
  developer: "Kyvera Digital",
  developerUrl: "https://kyveradigital.es",
};

export const SEO = {
  defaultTitle: "Guía Montilla — Todo Montilla: bodegas, comercios, parques y monumentos",
  defaultDescription:
    "Directorio y blog de Montilla (Córdoba): qué hacer, qué ver, bodegas Montilla-Moriles, restaurantes, monumentos, rutas y planes. Fotos e información verificada.",
  ogImage: "/images/og-default.jpg",
};
