import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

/** .env gana sobre variables heredadas del dev server (p. ej. localhost:4321) */
function envFromFile(name) {
  const path = join(root, ".env");
  if (!existsSync(path)) return undefined;
  const match = readFileSync(path, "utf8").match(new RegExp(`^${name}=(.+)$`, "m"));
  return match?.[1]?.trim();
}

const site = envFromFile("SITE_URL") ?? process.env.SITE_URL ?? "https://guiamontilla.es";
const basePath = envFromFile("BASE_PATH") ?? process.env.BASE_PATH ?? "/";

export default defineConfig({
  site,
  base: basePath === "/" ? undefined : basePath,
  output: "static",
  redirects: {
    "/feria": "/rutas/",
    "/eventos": "/noticias/",
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404") && !page.includes("/interno/"),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        const url = item.url;
        if (url.includes("/blog/")) {
          item.priority = url.endsWith("/blog/") ? 0.9 : 0.85;
          item.changefreq = "monthly";
        }
        if (url.includes("/noticias/")) {
          item.priority = url.endsWith("/noticias/") ? 0.88 : 0.8;
          item.changefreq = "daily";
        }
        return item;
      },
    }),
  ],
});
