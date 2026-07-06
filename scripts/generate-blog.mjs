import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ARTICLES } from "./lib/blog-data.mjs";

function yamlEscape(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function articleToMarkdown(article) {
  const keywords = article.keywords.map((k) => `  - ${yamlEscape(k)}`).join("\n");
  const relatedSlugs = article.relatedSlugs.map((s) => `  - ${yamlEscape(s)}`).join("\n");
  const faq = article.faq
    .map((item) => `  - q: ${yamlEscape(item.q)}\n    a: ${yamlEscape(item.a)}`)
    .join("\n");

  return `---
title: ${yamlEscape(article.title)}
description: ${yamlEscape(article.description)}
pubDate: ${yamlEscape(article.pubDate)}
topic: ${yamlEscape(article.topic)}
keywords:
${keywords}
relatedSlugs:
${relatedSlugs}
faq:
${faq}
---

${article.body}
`;
}

async function main() {
  const outputDir = path.resolve("src/content/blog");
  await mkdir(outputDir, { recursive: true });

  for (const article of ARTICLES) {
    const filePath = path.join(outputDir, `${article.slug}.md`);
    const markdown = articleToMarkdown(article);
    await writeFile(filePath, markdown, "utf8");
  }

  console.log(`Generated ${ARTICLES.length} blog posts in ${outputDir}`);
}

main().catch((error) => {
  console.error("Failed to generate blog posts:", error);
  process.exitCode = 1;
});
