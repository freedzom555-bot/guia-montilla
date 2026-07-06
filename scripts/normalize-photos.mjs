/**
 * Normaliza galerías: deduplica por hash, máx. 4 fotos, sincroniza JSON con disco.
 */
import { readFileSync } from "node:fs";
import { readFile, writeFile, readdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BIZ = join(ROOT, "data/businesses.json");
const IMG = join(ROOT, "public/images/negocios");
const MAX = 4;

const businesses = JSON.parse(await readFile(BIZ, "utf-8"));
let cleaned = 0;
let removedFiles = 0;

for (const b of businesses) {
  const dir = join(IMG, b.slug);
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  } catch {
    continue;
  }

  const unique = [];
  const seen = new Set();
  for (const f of files) {
    const buf = readFileSync(join(dir, f));
    const h = createHash("md5").update(buf).digest("hex");
    if (seen.has(h)) {
      await rm(join(dir, f));
      removedFiles++;
      continue;
    }
    seen.add(h);
    unique.push({ file: f, hash: h });
  }

  const keep = unique.slice(0, MAX);
  const keepSet = new Set(keep.map((k) => k.file));
  for (const { file } of unique.slice(MAX)) {
    await rm(join(dir, file));
    removedFiles++;
  }

  if (keep.length !== files.length || (b.gallery?.length ?? 0) !== keep.length) cleaned++;

  const gallery = keep.map((k, i) => {
    const prev = b.gallery?.find((g) => g.src?.endsWith(`/${k.file}`));
    return {
      src: `/images/negocios/${b.slug}/${k.file}`,
      alt: prev?.alt ?? `${b.name} — foto ${i + 1} (Google Maps)`,
    };
  });

  b.gallery = gallery;
  b.image = gallery[0]?.src ?? null;
}

await writeFile(BIZ, JSON.stringify(businesses, null, 2), "utf-8");
console.log(`✓ ${cleaned} galerías normalizadas · ${removedFiles} archivos duplicados/sobrantes eliminados`);
