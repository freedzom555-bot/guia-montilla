import { searchMontilla, norm } from "./search-engine.js";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function readIndex(root) {
  const el = root.querySelector("[data-search-index]");
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

export function initSearchBox(root) {
  if (!root || root.dataset.searchReady === "true") return;

  const index = readIndex(root);
  if (!index?.items?.length) return;

  root.dataset.searchReady = "true";

  const base = root.dataset.base ?? "/";
  const searchPage = root.dataset.searchPage ?? `${base}buscar/`;
  const compact = root.dataset.compact !== "false";
  const limit = compact ? 8 : 999;

  const input = root.querySelector("#site-search");
  const results = root.querySelector("#search-results");
  const submit = root.querySelector("#search-submit");
  if (!input || !results) return;

  function renderHit({ item }) {
    const url = `${base}negocio/${item.slug}/`;
    const badge = item.featured ? '<span class="finder-hit__badge">Destacado</span> ' : "";
    return `<a class="finder-hit" href="${url}" role="option">${badge}${escapeHtml(item.name)}<span>${escapeHtml(item.categoryLabel)} · ${escapeHtml(item.tagline || item.name)}</span></a>`;
  }

  function renderResults() {
    const q = input.value.trim();
    if (norm(q).length < 2) {
      results.classList.remove("is-open");
      results.innerHTML = "";
      return [];
    }

    const hits = searchMontilla(q, index, { limit });
    if (hits.length === 0) {
      results.innerHTML = `<span class="finder-hit finder-hit--empty">Sin resultados para «${escapeHtml(q)}». Prueba otra palabra: flores, vino, comer…</span>`;
      results.classList.add("is-open");
      return [];
    }

    let html = hits.map(renderHit).join("");
    if (compact && hits.length >= limit) {
      html += `<a class="finder-hit finder-hit--more" href="${searchPage}?q=${encodeURIComponent(q)}">Ver todos los resultados →</a>`;
    }
    results.innerHTML = html;
    results.classList.add("is-open");
    return hits;
  }

  function goSearch() {
    const q = input.value.trim();
    if (norm(q).length < 2) return;
    if (compact) {
      window.location.href = `${searchPage}?q=${encodeURIComponent(q)}`;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("q", q);
    window.history.replaceState({}, "", url);
    results.classList.remove("is-open");
    results.innerHTML = "";
    document.dispatchEvent(new CustomEvent("search:query", { detail: { q } }));
  }

  function onQueryInput() {
    const q = input.value.trim();
    if (compact) {
      renderResults();
      return;
    }
    if (norm(q).length < 2) {
      document.dispatchEvent(new CustomEvent("search:query", { detail: { q: "" } }));
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("q", q);
    window.history.replaceState({}, "", url);
    document.dispatchEvent(new CustomEvent("search:query", { detail: { q } }));
  }

  input.addEventListener("input", onQueryInput);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goSearch();
    }
  });

  submit?.addEventListener("click", goSearch);

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-search-root]")) {
      results.classList.remove("is-open");
    }
  });

  if (!compact && input.value.trim().length >= 2) {
    document.dispatchEvent(new CustomEvent("search:query", { detail: { q: input.value.trim() } }));
  }
}

if (typeof document !== "undefined") {
  function boot() {
    document.querySelectorAll("[data-search-root]").forEach((root) => initSearchBox(root));
  }
  document.addEventListener("astro:page-load", boot);
  boot();
}
