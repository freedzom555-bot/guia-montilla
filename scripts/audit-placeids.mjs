/**
 * Valida que placeId de cada ficha corresponde al negocio (nombre + Montilla).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { distanceKm } from "./lib/montilla.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");

function loadEnv() {
  try {
    for (const line of readFileSync(join(ROOT, ".env"), "utf-8").split("\n")) {
      const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch { /* */ }
}
loadEnv();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function norm(s) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenOverlap(a, b) {
  const ta = new Set(norm(a).split(" ").filter((t) => t.length > 2));
  const tb = new Set(norm(b).split(" ").filter((t) => t.length > 2));
  if (!ta.size || !tb.size) return 0;
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  return hit / Math.max(ta.size, tb.size);
}

const businesses = JSON.parse(readFileSync(BIZ, "utf-8"));

// placeId duplicados
const byPlace = new Map();
for (const b of businesses) {
  const pid = b.placeId?.replace(/^places\//, "");
  if (!pid) continue;
  if (!byPlace.has(pid)) byPlace.set(pid, []);
  byPlace.get(pid).push(b.slug);
}
const dupPlaceIds = [...byPlace.entries()].filter(([, slugs]) => slugs.length > 1);

// Validar muestra o --all
const validateAll = process.argv.includes("--all");
const sampleSize = validateAll ? businesses.length : Math.min(80, businesses.length);
const sample = validateAll
  ? businesses
  : [...businesses].sort(() => Math.random() - 0.5).slice(0, sampleSize);

const mismatches = [];
const wrongTown = [];
const checked = [];

console.log(`Validando ${sample.length} placeIds contra Google…\n`);

for (const b of sample) {
  const pid = b.placeId?.replace(/^places\//, "");
  if (!pid || !API_KEY) continue;

  await sleep(120);
  const res = await fetch(`https://places.googleapis.com/v1/places/${pid}?languageCode=es`, {
    headers: {
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location,photos",
    },
  });

  if (!res.ok) {
    mismatches.push({ slug: b.slug, name: b.name, issue: `google-${res.status}` });
    continue;
  }

  const place = await res.json();
  const gName = place.displayName?.text ?? "";
  const gAddr = place.formattedAddress ?? "";
  const overlap = tokenOverlap(b.name, gName);
  const inMontilla = /montilla|14550/i.test(gAddr);
  const dist =
    place.location?.latitude != null
      ? distanceKm(place.location.latitude, place.location.longitude)
      : null;

  checked.push({ slug: b.slug, name: b.name, gName, gAddr, overlap, inMontilla, dist, photos: place.photos?.length ?? 0 });

  if (!inMontilla || (dist != null && dist > 14)) {
    wrongTown.push({ slug: b.slug, name: b.name, gName, gAddr, dist });
  } else if (overlap < 0.25 && !norm(gName).includes(norm(b.name).split(" ")[0])) {
    mismatches.push({ slug: b.slug, name: b.name, gName, gAddr, overlap, photos: place.photos?.length ?? 0 });
  }
}

const report = {
  total: businesses.length,
  dupPlaceIds: dupPlaceIds.map(([placeId, slugs]) => ({ placeId, slugs })),
  checked: checked.length,
  mismatches,
  wrongTown,
};

writeFileSync(join(ROOT, "data/placeid-audit.json"), JSON.stringify(report, null, 2));

console.log(`placeId duplicados: ${dupPlaceIds.length}`);
dupPlaceIds.slice(0, 10).forEach(([pid, slugs]) => console.log(`  ${pid}: ${slugs.join(", ")}`));
console.log(`\nNombre Google ≠ ficha: ${mismatches.length}`);
mismatches.slice(0, 20).forEach((x) => console.log(`  ${x.slug}\n    ficha: ${x.name}\n    google: ${x.gName}\n    overlap: ${(x.overlap * 100).toFixed(0)}%`));
console.log(`\nGoogle fuera Montilla: ${wrongTown.length}`);
wrongTown.forEach((x) => console.log(`  ${x.slug}: ${x.gAddr}`));
console.log("\n→ data/placeid-audit.json");
