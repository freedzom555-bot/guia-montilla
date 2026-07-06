/**
 * Buscador inteligente — sinónimos, categorías, coincidencia parcial.
 * Los negocios destacados tienen prioridad en búsquedas amplias por categoría.
 */
export function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

export function tokenize(q) {
  return norm(q)
    .split(/[\s,.·\-/|+]+/)
    .filter((t) => t.length >= 2);
}

function stemMatch(token, word) {
  if (word === token) return true;
  if (word.startsWith(token) && word.length - token.length <= 2) return true;
  return false;
}

function nameIncludesToken(name, token) {
  const parts = name.split(/[\s,.·\-/|()+]+/).filter(Boolean);
  return parts.some((part) => {
    const p = norm(part);
    if (p === token) return true;
    if (p.startsWith(token) && p.length - token.length <= 2) return true;
    return false;
  });
}

function blobIncludesToken(blob, token) {
  const parts = blob.split(/[\s,.·\-/|()+]+/).filter(Boolean);
  return parts.some((part) => {
    if (part === token) return true;
    if (part.startsWith(token) && part.length - token.length <= 2) return true;
    return false;
  });
}

function tokenMatchesItem(token, name, kws, blob) {
  if (nameIncludesToken(name, token)) return true;
  if (kws.some((kw) => stemMatch(token, kw))) return true;
  if (token.length >= 4 && blobIncludesToken(blob, token)) return true;
  return false;
}

function isExactNameMatch(name, q) {
  if (name === q) return true;
  return q.length >= 5 && name.includes(q);
}

const SPECIFIC_TERMS = new Set([
  "flores", "flor", "ramo", "ramos", "planta", "plantas", "regalo", "regalos",
  "dentista", "farmacia", "peluqueria", "ferreteria", "fontanero", "abogado",
  "taller", "gasolinera", "veterinario", "panaderia", "carniceria", "fruteria",
]);

function categoryIntentMatch(token, item, queryToCategories, categoryKeywords) {
  if (!queryToCategories[token]?.includes(item.category)) return false;
  const catHit = (categoryKeywords[item.category] ?? []).some((kw) => stemMatch(token, norm(kw)));
  if (!catHit) return false;
  if (SPECIFIC_TERMS.has(token)) return false;
  return true;
}

function compareHits(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  if (Number(b.item.featured) !== Number(a.item.featured)) {
    return Number(b.item.featured) - Number(a.item.featured);
  }
  return a.item.name.localeCompare(b.item.name, "es");
}

function compareFeaturedFirst(a, b) {
  if (Number(b.item.featured) !== Number(a.item.featured)) {
    return Number(b.item.featured) - Number(a.item.featured);
  }
  return compareHits(a, b);
}

/**
 * @param {string} query
 * @param {{ items: object[], categoryKeywords?: object, queryToCategories?: object }} index
 * @param {{ limit?: number }} opts
 */
export function searchMontilla(query, index, opts = {}) {
  const { limit = 50 } = opts;
  const q = norm(query);
  if (q.length < 2) return [];

  const tokens = tokenize(q);
  const categoryKeywords = index.categoryKeywords ?? {};
  const queryToCategories = index.queryToCategories ?? {};

  const matchedCategories = new Set();
  for (const token of tokens) {
    if (queryToCategories[token]) queryToCategories[token].forEach((c) => matchedCategories.add(c));
    for (const [cat, kws] of Object.entries(categoryKeywords)) {
      if (kws.some((kw) => stemMatch(token, norm(kw)))) matchedCategories.add(cat);
    }
  }

  const scored = [];

  for (const item of index.items) {
    let score = 0;
    const name = norm(item.name);
    const blob = item.searchBlob ?? norm(item.keywords?.join(" "));
    const kws = (item.keywords ?? []).map(norm);
    const exactName = isExactNameMatch(name, q);

    if (exactName) score += 200;
    else if (nameIncludesToken(name, q)) score += 120;

    for (const token of tokens) {
      let tokenScore = 0;
      if (nameIncludesToken(name, token)) tokenScore = Math.max(tokenScore, 80);
      if (kws.some((kw) => stemMatch(token, kw))) tokenScore = Math.max(tokenScore, 65);
      if (token.length >= 4 && blobIncludesToken(blob, token)) tokenScore = Math.max(tokenScore, 40);
      score += tokenScore;
    }

    if (matchedCategories.has(item.category)) score += 30;
    if (norm(item.categoryLabel).includes(q)) score += 50;

    for (const token of tokens) {
      if (queryToCategories[token]?.includes(item.category)) score += 25;
    }

    if (item.featured) {
      score += 85;
      if (matchedCategories.has(item.category)) score += 120;
    }

    const hasRelevance =
      exactName ||
      nameIncludesToken(name, q) ||
      tokens.some((token) => tokenMatchesItem(token, name, kws, blob)) ||
      (tokens.length === 1 && categoryIntentMatch(tokens[0], item, queryToCategories, categoryKeywords));

    if (hasRelevance && score > 0) {
      scored.push({ item, score, exactName });
    }
  }

  const hasExactMatch = scored.some((hit) => hit.exactName);

  if (matchedCategories.size > 0 && !hasExactMatch) {
    const featuredInCategory = scored
      .filter((hit) => hit.item.featured && matchedCategories.has(hit.item.category))
      .sort(compareHits);
    const featuredSlugs = new Set(featuredInCategory.map((hit) => hit.item.slug));
    const rest = scored.filter((hit) => !featuredSlugs.has(hit.item.slug)).sort(compareFeaturedFirst);
    return [...featuredInCategory, ...rest].slice(0, limit);
  }

  scored.sort((a, b) => {
    const gap = Math.abs(b.score - a.score);
    if (gap <= 55 && Number(b.item.featured) !== Number(a.item.featured)) {
      return Number(b.item.featured) - Number(a.item.featured);
    }
    return compareHits(a, b);
  });

  return scored.slice(0, limit);
}
