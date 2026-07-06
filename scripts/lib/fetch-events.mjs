import Parser from "rss-parser";
import { RSS_SOURCES, EVENT_KEYWORDS, OPINION_SKIP, MAX_AGE_DAYS } from "./config.mjs";

const parser = new Parser({ timeout: 15000 });

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

function isEventLike(title, excerpt) {
  const text = `${title} ${excerpt}`.toLowerCase();
  return EVENT_KEYWORDS.some((kw) => text.includes(kw));
}

function isRecent(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const ageMs = Date.now() - date.getTime();
  return ageMs <= MAX_AGE_DAYS * 24 * 60 * 60 * 1000 && ageMs >= -24 * 60 * 60 * 1000;
}

export async function fetchEvents() {
  const events = [];

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        if (isOpinion(item)) continue;

        const excerpt = stripHtml(item.contentSnippet ?? item.description ?? "").slice(0, 200);
        if (!isEventLike(item.title, excerpt)) continue;
        if (!isRecent(item.pubDate ?? item.isoDate)) continue;

        events.push({
          id: item.guid ?? item.link,
          title: item.title.trim(),
          excerpt,
          date: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
          url: item.link,
          source: source.name,
        });
      }
    } catch (err) {
      console.warn(`⚠ ${source.name}: ${err.message}`);
    }
  }

  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}
