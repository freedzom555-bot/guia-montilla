/** Texto visible de tagline — evita "undefined" por datos mal generados. */
export function displayTagline(business: { name: string; tagline?: string | null }): string {
  const name = business.name?.trim() || "Este negocio";
  const raw = (business.tagline ?? "").trim();

  if (!raw || raw === "undefined" || /^undefined\b/i.test(raw)) {
    return `${name} en Montilla (Córdoba).`;
  }

  return raw.replace(/^undefined\b\s*/i, name);
}
