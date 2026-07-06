/** SEO para artículos del blog — BlogPosting, breadcrumbs, FAQ. */

export function trimMeta(text: string, max = 160): string {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

export function articleTitle(title: string): string {
  return `${title} | Guía Montilla`;
}

export function articleKeywords(keywords: string[]): string {
  return [...keywords, "Montilla", "Córdoba", "Montilla-Moriles", "Guía Montilla"].join(", ");
}

const TOPIC_LABELS: Record<string, string> = {
  planes: "Planes",
  vino: "Vino y bodegas",
  gastronomia: "Gastronomía",
  patrimonio: "Patrimonio",
  practico: "Guía práctica",
};

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic;
}

export function buildArticleSchemas(opts: {
  title: string;
  description: string;
  slug: string;
  pubDate: Date;
  updatedDate?: Date;
  siteUrl: string;
  base: string;
  faq?: { q: string; a: string }[];
}) {
  const { title, description, slug, pubDate, updatedDate, siteUrl, base, faq } = opts;
  const pageUrl = new URL(`${base}blog/${slug}/`, siteUrl).href;
  const blogIndexUrl = new URL(`${base}blog/`, siteUrl).href;

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    headline: title,
    description,
    url: pageUrl,
    datePublished: pubDate.toISOString(),
    dateModified: (updatedDate ?? pubDate).toISOString(),
    inLanguage: "es-ES",
    author: {
      "@type": "Organization",
      name: "Guía Montilla",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Guía Montilla",
      url: siteUrl,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    isPartOf: { "@type": "Blog", "@id": `${blogIndexUrl}#blog`, name: "Blog Guía Montilla", url: blogIndexUrl },
    about: [
      { "@type": "City", name: "Montilla", containedInPlace: { "@type": "AdministrativeArea", name: "Córdoba" } },
      { "@type": "Thing", name: "Montilla-Moriles" },
    ],
    keywords: description,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: blogIndexUrl },
      { "@type": "ListItem", position: 3, name: title, item: pageUrl },
    ],
  };

  const schemas: Record<string, unknown>[] = [blogPosting, breadcrumb];

  if (faq?.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return schemas;
}

export function buildBlogIndexSchema(siteUrl: string, base: string) {
  const blogUrl = new URL(`${base}blog/`, siteUrl).href;
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${blogUrl}#blog`,
    name: "Blog Guía Montilla",
    description:
      "Artículos editoriales sobre qué hacer en Montilla, qué ver, bodegas Montilla-Moriles, gastronomía y planes en Córdoba.",
    url: blogUrl,
    inLanguage: "es-ES",
    publisher: { "@type": "Organization", name: "Guía Montilla", url: siteUrl },
  };
}
