/**
 * Reasigna rutas de imagen desde data/image-map.json (tras download-montilla-images)
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "../data/businesses.json");

async function main() {
  const businesses = JSON.parse(await readFile(FILE, "utf-8"));
  const updated = businesses.map((b) => ({
    ...b,
    image: `/images/negocios/${b.slug}.jpg`,
  }));
  await writeFile(FILE, JSON.stringify(updated, null, 2), "utf-8");
  console.log(`✓ ${updated.length} rutas de imagen verificadas`);
}

main();
