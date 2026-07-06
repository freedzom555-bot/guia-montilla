/** SEO para noticias agregadas — NewsArticle + breadcrumbs. */

export function trimMeta(text: string, max = 160): string {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

export function newsTitle(title: string): string {
  return `${title} · Noticias Montilla`;
}

export function buildNewsIndexSchema(siteUrl: string, base: string) {
  const newsUrl = new URL(`${base}noticias/`, siteUrl).href;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${newsUrl}#noticias`,
    name: "Noticias de Montilla",
    description: "Actualidad de Montilla (Córdoba): noticias locales de Montilla Digital y el Ayuntamiento.",
    url: newsUrl,
    inLanguage: "es-ES",
    isPartOf: { "@type": "WebSite", name: "Guía Montilla", url: siteUrl },
  };
}

export function buildNewsArticleSchema(opts: {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  url: string;
  source: string;
  siteUrl: string;
  base: string;
}) {
  const { title, excerpt, slug, date, url, source, siteUrl, base } = opts;
  const pageUrl = new URL(`${base}noticias/${slug}/`, siteUrl).href;
  const newsIndexUrl = new URL(`${base}noticias/`, siteUrl).href;
  const published = new Date(date).toISOString();

  return [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": `${pageUrl}#article`,
      headline: title,
      description: excerpt,
      url: pageUrl,
      datePublished: published,
      dateModified: published,
      inLanguage: "es-ES",
      author: { "@type": "Organization", name: source },
      publisher: { "@type": "Organization", name: "Guía Montilla", url: siteUrl },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      isBasedOn: url,
      about: { "@type": "City", name: "Montilla", containedInPlace: { "@type": "AdministrativeArea", name: "Córdoba" } },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Noticias", item: newsIndexUrl },
        { "@type": "ListItem", position: 3, name: title, item: pageUrl },
      ],
    },
  ];
}
