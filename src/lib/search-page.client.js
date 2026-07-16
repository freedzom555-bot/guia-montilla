import { searchMontilla, norm } from "./search-engine.js";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function readIndex() {
  const el = document.querySelector("[data-search-root] [data-search-index]");
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

function renderRow(item, base) {
  const featuredLabel = item.slug === "kyvera-digital" ? "Patrocinio" : "Destacado";
  const featured = item.featured
    ? `<span class="pill">${featuredLabel}</span> `
    : "";
  const url = `${base}negocio/${item.slug}/`;
  return `<li class="index-row fade-in">
  <div class="index-row__body">
    <h3 class="index-row__title">${featured}<a href="${url}">${escapeHtml(item.name)}</a></h3>
    <p class="index-row__sub">${escapeHtml(item.tagline || item.name)}</p>
  </div>
  <span class="index-row__cat">${escapeHtml(item.categoryLabel)}</span>
</li>`;
}

function renderPanel(q, index, base) {
  const panel = document.querySelector("[data-search-page-panel]");
  if (!panel || !index) return;

  document.title = q
    ? `Buscar «${q}» en Montilla · Guía Montilla`
    : "Buscar en Montilla · Guía Montilla";

  if (norm(q).length < 2) {
    panel.innerHTML = `<p class="empty-note">
      Escribe al menos 2 letras. Ejemplos:
      <a href="${base}buscar/?q=flores">flores</a>,
      <a href="${base}buscar/?q=bodega">bodega</a>,
      <a href="${base}buscar/?q=farmacia">farmacia</a>,
      <a href="${base}buscar/?q=comer">comer</a>.
    </p>`;
    return;
  }

  const hits = searchMontilla(q, index, { limit: 200 });
  if (hits.length === 0) {
    panel.innerHTML = `<p class="empty-note">No hay resultados para «${escapeHtml(q)}». Prueba sinónimos: peluquería, flores, taller, tapas…</p>`;
    return;
  }

  const count = hits.length === 1 ? "1 resultado" : `${hits.length} resultados`;
  panel.innerHTML = `<p class="search-count">${count} para «${escapeHtml(q)}»</p>
<ul class="index-list">${hits.map(({ item }) => renderRow(item, base)).join("")}</ul>`;

  panel.querySelectorAll(".fade-in").forEach((el) => el.classList.add("in"));
}

export function initSearchPage() {
  const root = document.querySelector("[data-search-page-results]");
  if (!root || root.dataset.searchPageReady === "true") return;

  const index = readIndex();
  if (!index?.items?.length) return;

  root.dataset.searchPageReady = "true";
  const base = root.dataset.base ?? "/";

  function syncFromUrl() {
    const q = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
    const input = document.getElementById("site-search");
    if (input && input.value !== q) input.value = q;
    renderPanel(q, index, base);
  }

  document.addEventListener("search:query", (e) => {
    const q = e.detail?.q?.trim() ?? "";
    renderPanel(q, index, base);
  });

  window.addEventListener("popstate", syncFromUrl);
  syncFromUrl();
}

if (typeof document !== "undefined") {
  function boot() {
    initSearchPage();
  }
  document.addEventListener("astro:page-load", boot);
  boot();
}
