export const OUTREACH_PRICE = 29;
export const DAILY_VISITS = 1000;

/** Prioridad comercial para el listado */
export const CATEGORY_PRIORITY = [
  "bodegas",
  "restaurantes",
  "bares-cafes",
  "alojamiento",
  "alimentacion",
  "belleza",
  "comercios",
  "cultura-ocio",
  "salud",
  "profesionales",
  "motor",
  "monumentos",
  "museos",
  "parques",
  "educacion",
  "rutas",
] as const;

const SEARCH_TERM: Record<string, string> = {
  bodegas: "bodegas Montilla",
  restaurantes: "restaurantes Montilla",
  "bares-cafes": "bares Montilla",
  alimentacion: "tiendas Montilla",
  alojamiento: "hoteles Montilla",
  monumentos: "monumentos Montilla",
  museos: "museos Montilla",
  parques: "parques Montilla",
  "cultura-ocio": "planes Montilla",
  rutas: "rutas Montilla",
  comercios: "comercios Montilla",
  salud: "farmacia Montilla",
  belleza: "peluquería Montilla",
  profesionales: "gestoría Montilla",
  motor: "taller Montilla",
  educacion: "colegios Montilla",
};

export type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  phone: string;
  featured?: boolean;
};

export type CategoryRow = { id: string; name: string };

export type OutreachLead = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  phone: string;
  phoneDisplay: string;
  isMobile: boolean;
  listingUrl: string;
  message: string;
  waUrl: string;
  priority: number;
};

export function normalizePhoneE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 9 && /^[67]/.test(digits)) return `34${digits}`;
  if (digits.length === 11 && digits.startsWith("34")) return digits;
  if (digits.length === 12 && digits.startsWith("034")) return digits.slice(1);
  return digits.length >= 9 ? digits : null;
}

export function isSpanishMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("34") ? digits.slice(2) : digits;
  return local.length === 9 && /^[67]/.test(local);
}

export function buildSearchTerm(categoryId: string, categoryLabel: string): string {
  return SEARCH_TERM[categoryId] ?? `${categoryLabel.toLowerCase()} Montilla`;
}

export function buildOutreachMessage(opts: {
  businessName: string;
  searchTerm: string;
  listingUrl: string;
  siteUrl: string;
  contactName?: string;
}): string {
  const { businessName, searchTerm, listingUrl, siteUrl, contactName = "Antonio" } = opts;
  const base = siteUrl.replace(/\/$/, "");

  return `Hola, buenos días. Soy ${contactName} de Guía Montilla.

Tenemos ya a *${businessName}* en ${base.replace("https://", "")} — el directorio local que mueve unas *${DAILY_VISITS.toLocaleString("es-ES")} visitas al día* entre vecinos, turistas y búsquedas en Google.

Podéis pasar a *Destacado* por *${OUTREACH_PRICE} €/mes* (sin permanencia, menos de 1 € al día):
• Salís *primero* cuando buscan «${searchTerm}»
• Etiqueta destacado y ficha más visible
• Más fotos en vuestra página

Vuestra ficha: ${listingUrl}
Info del plan: ${base}/para-negocios/

Si os encaja, lo activamos en 24 h. ¿Os interesa?

Gracias.`;
}

export function buildWaUrl(phoneE164: string, message: string): string {
  return `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;
}

export function buildOutreachLeads(
  businesses: BusinessRow[],
  categories: CategoryRow[],
  siteUrl: string
): OutreachLead[] {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const base = siteUrl.replace(/\/$/, "");
  const priorityIndex = Object.fromEntries(CATEGORY_PRIORITY.map((id, i) => [id, i]));

  return businesses
    .filter((b) => b.phone && !b.featured)
    .map((b) => {
      const e164 = normalizePhoneE164(b.phone);
      const categoryLabel = catMap[b.category] ?? b.category;
      const searchTerm = buildSearchTerm(b.category, categoryLabel);
      const listingUrl = `${base}/${b.category}/${b.slug}/`;
      const message = buildOutreachMessage({
        businessName: b.name,
        searchTerm,
        listingUrl,
        siteUrl: base,
      });

      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        category: b.category,
        categoryLabel,
        phone: b.phone,
        phoneDisplay: b.phone,
        isMobile: isSpanishMobile(b.phone),
        listingUrl,
        message,
        waUrl: e164 ? buildWaUrl(e164, message) : "",
        priority: priorityIndex[b.category] ?? 99,
      };
    })
    .filter((l) => l.waUrl)
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name, "es"));
}
