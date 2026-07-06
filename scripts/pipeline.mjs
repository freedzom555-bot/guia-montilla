#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchEvents } from "./lib/fetch-events.mjs";
import { fetchNews } from "./lib/fetch-news.mjs";
import { MAX_EVENTS, MAX_NEWS } from "./lib/config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "../data");
const EVENTS_FILE = join(DATA, "events.json");
const NEWS_FILE = join(DATA, "news.json");

async function loadExisting() {
  try {
    return JSON.parse(await readFile(EVENTS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  GUÍA MONTILLA — Pipeline automático");
  console.log("═══════════════════════════════════════\n");

  const existing = await loadExisting();
  const knownIds = new Set(existing.map((e) => e.id));

  console.log("📅 Recogiendo eventos…");
  const fetched = await fetchEvents();
  const newEvents = fetched.filter((e) => !knownIds.has(e.id));

  console.log(`   ${fetched.length} eventos detectados, ${newEvents.length} nuevos\n`);

  const merged = [...newEvents, ...existing]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_EVENTS);

  await mkdir(DATA, { recursive: true });
  await writeFile(EVENTS_FILE, JSON.stringify(merged, null, 2), "utf-8");

  console.log(`✓ ${merged.length} eventos en total`);

  const existingNews = await loadJson(NEWS_FILE);
  const knownNewsIds = new Set(existingNews.map((n) => n.id));

  console.log("\n📰 Recogiendo noticias…");
  const fetchedNews = await fetchNews();
  const newNews = fetchedNews.filter((n) => !knownNewsIds.has(n.id));
  console.log(`   ${fetchedNews.length} noticias detectadas, ${newNews.length} nuevas`);

  const mergedNews = [...newNews, ...existingNews]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_NEWS);

  // Actualizar slug/excerpt de noticias ya conocidas si cambian en el feed
  const freshById = Object.fromEntries(fetchedNews.map((n) => [n.id, n]));
  for (const item of mergedNews) {
    const fresh = freshById[item.id];
    if (fresh) {
      item.excerpt = fresh.excerpt || item.excerpt;
      item.title = fresh.title || item.title;
    }
  }

  await writeFile(NEWS_FILE, JSON.stringify(mergedNews, null, 2), "utf-8");
  console.log(`✓ ${mergedNews.length} noticias en total`);
  console.log("═══════════════════════════════════════\n");
}

async function loadJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf-8"));
  } catch {
    return [];
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
