import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    keywords: z.array(z.string()),
    topic: z.enum(["planes", "vino", "gastronomia", "patrimonio", "practico"]),
    relatedSlugs: z.array(z.string()).default([]),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .optional(),
  }),
});

export const collections = { blog };
