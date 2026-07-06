import Parser from "rss-parser";
import { NEWS_RSS_SOURCES, OPINION_SKIP, MAX_NEWS, MAX_NEWS_AGE_DAYS } from "./config.mjs";

const parser = new Parser({ timeout: 20000 });

function getCategoryStrings(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.map((c) => (typeof c === "string" ? c : (c._ ?? "")));
}

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isOpinion(item) {
  const haystack = [item.title ?? "", ...getCategoryStrings(item.categories)].join(" ");
  return OPINION_SKIP.some((p) => p.test(haystack));
}

function isRecent(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const ageMs = Date.now() - date.getTime();
  return ageMs <= MAX_NEWS_AGE_DAYS * 24 * 60 * 60 * 1000 && ageMs >= -24 * 60 * 60 * 1000;
}

function slugFromUrl(url, fallbackId) {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/\.(html?|php|aspx)$/i, "").split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last.length > 2) {
      return last
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 72);
    }
  } catch { /* */ }
  return String(fallbackId)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
    .toLowerCase();
}

function uniqueSlug(base, used) {
  let slug = base || "noticia";
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n++}`;
  }
  used.add(slug);
  return slug;
}

export async function fetchNews() {
  const items = [];
  const seenUrls = new Set();
  const usedSlugs = new Set();

  for (const source of NEWS_RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        if (seenUrls.has(item.link)) continue;
        if (isOpinion(item)) continue;
        if (!isRecent(item.pubDate ?? item.isoDate)) continue;

        const excerpt = stripHtml(item.contentSnippet ?? item.description ?? "").slice(0, 320);
        const id = item.guid ?? item.link;
        const baseSlug = slugFromUrl(item.link, id);
        const slug = uniqueSlug(baseSlug, usedSlugs);

        seenUrls.add(item.link);
        items.push({
          id,
          slug,
          title: item.title.trim(),
          excerpt,
          date: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
          url: item.link,
          source: source.name,
          sourceId: source.id,
        });
      }
    } catch (err) {
      console.warn(`⚠ Noticias · ${source.name}: ${err.message}`);
    }
  }

  return items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_NEWS);
}
