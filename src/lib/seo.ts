/** SEO por ficha — títulos, meta, Schema.org y datos locales Montilla (14550). */

const DAY_ES_EN: Record<string, string> = {
  lunes: "Monday",
  martes: "Tuesday",
  miércoles: "Wednesday",
  miercoles: "Wednesday",
  jueves: "Thursday",
  viernes: "Friday",
  sábado: "Saturday",
  sabado: "Saturday",
  domingo: "Sunday",
};

const CATEGORY_SCHEMA: Record<string, string[]> = {
  bodegas: ["Winery", "LocalBusiness"],
  restaurantes: ["Restaurant", "FoodEstablishment"],
  "bares-cafes": ["BarOrPub", "CafeOrCoffeeShop", "LocalBusiness"],
  alimentacion: ["Store", "LocalBusiness"],
  alojamiento: ["LodgingBusiness", "Hotel", "LocalBusiness"],
  monumentos: ["TouristAttraction", "LandmarksOrHistoricalBuildings"],
  museos: ["Museum", "LocalBusiness"],
  parques: ["Park", "TouristAttraction"],
  "cultura-ocio": ["LocalBusiness", "TouristAttraction"],
  comercios: ["Store", "LocalBusiness"],
  salud: ["MedicalBusiness", "LocalBusiness"],
  belleza: ["BeautySalon", "HairSalon", "LocalBusiness"],
  profesionales: ["ProfessionalService", "LocalBusiness"],
  motor: ["AutomotiveBusiness", "LocalBusiness"],
  educacion: ["EducationalOrganization", "LocalBusiness"],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  bodegas: ["bodega Montilla", "vino Montilla-Moriles", "enoturismo Montilla", "cata de vinos Córdoba"],
  restaurantes: ["restaurante Montilla", "comer en Montilla", "taberna Montilla", "gastronomía Córdoba"],
  "bares-cafes": ["bar Montilla", "café Montilla", "tapeo Montilla", "terraza Montilla"],
  alimentacion: ["supermercado Montilla", "panadería Montilla", "comprar Montilla"],
  alojamiento: ["hotel Montilla", "hostal Montilla", "dormir Montilla", "alojamiento Córdoba"],
  monumentos: ["monumentos Montilla", "patrimonio Montilla", "qué ver Montilla", "turismo Montilla"],
  museos: ["museo Montilla", "cultura Montilla", "Inca Garcilaso Montilla"],
  parques: ["parques Montilla", "paseo Montilla", "naturaleza Montilla"],
  "cultura-ocio": ["ocio Montilla", "planes Montilla", "turismo Montilla"],
  comercios: ["comercios Montilla", "tiendas Montilla", "compras Montilla"],
  salud: ["farmacia Montilla", "dentista Montilla", "salud Montilla"],
  belleza: ["peluquería Montilla", "estética Montilla"],
  profesionales: ["gestoría Montilla", "abogado Montilla", "asesoría Montilla"],
  motor: ["taller Montilla", "mecánico Montilla", "gasolinera Montilla"],
  educacion: ["colegio Montilla", "educación Montilla", "instituto Montilla"],
};

export function trimMeta(text: string, max = 160): string {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

export function businessTitle(name: string, categoryName: string): string {
  return `${name} en Montilla (Córdoba) — ${categoryName}`;
}

export function businessDescription(
  business: {
    name: string;
    tagline?: string;
    category?: string;
    phone?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    shortAddress?: string | null;
  },
  categoryName: string
): string {
  const parts: string[] = [];

  if (business.tagline) parts.push(business.tagline.replace(/\.$/, ""));

  parts.push(`${business.name}, ${categoryName.toLowerCase()} en Montilla (14550), Córdoba.`);

  if (business.shortAddress) parts.push(`Dirección: ${business.shortAddress}.`);
  if (business.phone) parts.push(`Tel: ${business.phone}.`);
  if (business.rating && business.reviewCount) {
    parts.push(`${business.rating}/5 (${business.reviewCount} opiniones en Google Maps).`);
  }

  parts.push("Fotos, horarios y mapa en Guía Montilla.");

  return trimMeta(parts.join(" "), 158);
}

export function businessKeywords(
  business: { name: string; category?: string; tags?: string[] },
  categoryName: string
): string {
  const base = CATEGORY_KEYWORDS[business.category ?? ""] ?? [
    `${categoryName.toLowerCase()} Montilla`,
    "Montilla Córdoba",
    "14550",
  ];
  const nameWords = business.name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  const tags = (business.tags ?? []).slice(0, 3);
  return [...new Set([...base, ...nameWords, ...tags, "Guía Montilla", "Montilla-Moriles"])].join(", ");
}

function parseOpeningHours(hoursList?: string[] | null) {
  if (!hoursList?.length) return undefined;
  const specs: object[] = [];

  for (const line of hoursList) {
    const m = line.match(/^([^:]+):\s*(.+)$/i);
    if (!m) continue;
    const dayKey = m[1].trim().toLowerCase();
    const hours = m[2].trim();
    const dayOfWeek = DAY_ES_EN[dayKey];
    if (!dayOfWeek || /cerrado|closed/i.test(hours)) continue;

    const range = hours.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
    if (range) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${dayOfWeek}`,
        opens: range[1].padStart(5, "0"),
        closes: range[2].padStart(5, "0"),
      });
    }
  }

  return specs.length ? specs : undefined;
}

function schemaTypes(category?: string): string[] {
  return CATEGORY_SCHEMA[category ?? ""] ?? ["LocalBusiness"];
}

export function seoGalleryImages(
  gallery: { src: string; alt: string }[],
  business: { name: string; category?: string },
  categoryName: string,
  base: string
) {
  return gallery.map((img, i) => ({
    src: img.src,
    alt:
      img.alt && !/google maps/i.test(img.alt)
        ? img.alt
        : `${business.name} — ${categoryName} en Montilla, Córdoba (foto ${i + 1})`,
    href: `${base}${img.src.replace(/^\//, "")}`,
  }));
}

export function buildBusinessSchemas(options: {
  business: Record<string, unknown>;
  categoryName: string;
  categoryUrl: string;
  pageUrl: string;
  siteUrl: string;
  siteName: string;
  images: string[];
  metaTitle: string;
  metaDescription: string;
}) {
  const {
    business,
    categoryName,
    categoryUrl,
    pageUrl,
    siteUrl,
    siteName,
    images,
    metaTitle,
    metaDescription,
  } = options;
  const b = business as {
    name: string;
    description?: string;
    tagline?: string;
    address?: string;
    shortAddress?: string;
    phone?: string;
    email?: string;
    web?: string;
    googleMapsUrl?: string;
    social?: string[];
    lat?: number;
    lng?: number;
    rating?: number;
    reviewCount?: number;
    priceRange?: string;
    category?: string;
    hoursList?: string[];
    hours?: string;
    featured?: boolean;
    businessStatus?: string;
  };

  const types = schemaTypes(b.category);
  const entityId = `${pageUrl}#place`;
  const webPageId = `${pageUrl}#webpage`;

  const streetAddress = b.address?.replace(/, España$/, "") ?? b.shortAddress;

  const placeEntity: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": types[0],
    "@id": entityId,
    name: b.name,
    description: trimMeta(b.tagline || b.description?.split("\n\n")[0] || metaDescription, 300),
    url: pageUrl,
    image: images.length ? images : undefined,
    telephone: b.phone || undefined,
    email: b.email || undefined,
    priceRange: b.priceRange || undefined,
    sameAs: [b.web, b.googleMapsUrl, ...(b.social ?? [])].filter(Boolean),
    hasMap: b.googleMapsUrl || undefined,
    address: streetAddress
      ? {
          "@type": "PostalAddress",
          streetAddress,
          addressLocality: "Montilla",
          addressRegion: "Andalucía",
          postalCode: "14550",
          addressCountry: "ES",
        }
      : undefined,
    geo:
      b.lat && b.lng
        ? { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng }
        : undefined,
    containedInPlace: {
      "@type": "City",
      name: "Montilla",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Córdoba",
        containedInPlace: { "@type": "Country", name: "España" },
      },
    },
    areaServed: { "@type": "City", name: "Montilla", postalCode: "14550" },
    openingHoursSpecification: parseOpeningHours(b.hoursList),
    aggregateRating:
      b.rating && b.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: b.rating,
            reviewCount: b.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  if (types.length > 1) {
    placeEntity.additionalType = types.slice(1).map((t) => `https://schema.org/${t}`);
  }

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": webPageId,
    url: pageUrl,
    name: metaTitle,
    description: metaDescription,
    inLanguage: "es-ES",
    isPartOf: { "@type": "WebSite", "@id": `${siteUrl}#website`, name: siteName, url: siteUrl },
    about: { "@id": entityId },
    mainEntity: { "@id": entityId },
    primaryImageOfPage: images[0]
      ? { "@type": "ImageObject", url: images[0], caption: b.name }
      : undefined,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: categoryUrl,
      },
      { "@type": "ListItem", position: 3, name: b.name, item: pageUrl },
    ],
  };

  return [placeEntity, webPage, breadcrumb];
}
