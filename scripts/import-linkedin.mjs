#!/usr/bin/env node
/**
 * import-linkedin.mjs — fetch a LinkedIn article and convert to MDX blog template.
 *
 * Usage:
 *   node scripts/import-linkedin.mjs <linkedin-article-url> [--locale=en] [--author=lukasz|mateusz|pirxey]
 *
 * What it does:
 *   1. Fetches the article HTML (or accepts pasted text via STDIN if URL fetch fails).
 *   2. Extracts title, body, hero image.
 *   3. Writes a draft MDX file under src/content/blog/<locale>/<slug>.mdx with frontmatter
 *      pre-filled from sensible defaults. You edit the frontmatter before commit.
 *
 * Note: LinkedIn aggressively blocks unauthenticated scraping. If fetch fails,
 *   the script will prompt you to paste the article text manually (STDIN).
 *
 * Authors registry — extend as needed:
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");

const AUTHORS = {
  lukasz: {
    name: "Łukasz Graliński",
    role: "Co-founder, Pirxey",
    linkedinUrl: "https://linkedin.com/in/lukasz-gralinski",
  },
  mateusz: {
    name: "Mateusz Kapica",
    role: "Co-founder, Pirxey",
    linkedinUrl: "https://linkedin.com/in/mateusz-kapica",
  },
  pirxey: {
    name: "Pirxey",
    role: "Software development crew",
    linkedinUrl: "https://linkedin.com/company/pirxey",
  },
};

function parseArgs(argv) {
  const args = { url: null, locale: "en", author: "lukasz" };
  for (const a of argv.slice(2)) {
    if (a.startsWith("--locale=")) args.locale = a.split("=")[1];
    else if (a.startsWith("--author=")) args.author = a.split("=")[1];
    else if (!args.url && a.startsWith("http")) args.url = a;
  }
  return args;
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
}

function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i) ||
            html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i);
  if (!m) return null;
  return m[1].replace(/\|.*$/, "").trim();
}

function extractOgImage(html) {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i);
  return m ? m[1] : null;
}

async function fetchOrPrompt(url) {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PirxeyBlogImport/1.0)" },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } catch (e) {
    console.error(`⚠ LinkedIn fetch failed (${e.message}). Paste the article text below, then Ctrl+D:`);
    return new Promise((res) => {
      let data = "";
      process.stdin.setEncoding("utf-8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => res(data));
    });
  }
}

function buildMdx({ title, body, heroImage, url, author, locale, category = "ai" }) {
  const today = new Date().toISOString().split("T")[0];
  const excerpt = body.split("\n").find((l) => l.trim().length > 80)?.slice(0, 200) ?? "Excerpt — edit me before publishing.";

  const fmAuthor = author;
  const frontmatter = `---
locale: ${locale}
title: ${JSON.stringify(title)}
excerpt: ${JSON.stringify(excerpt)}
publishedAt: ${today}
author:
  name: ${JSON.stringify(fmAuthor.name)}
  role: ${JSON.stringify(fmAuthor.role)}
  linkedinUrl: ${fmAuthor.linkedinUrl ?? "null"}
originalSource:
  platform: linkedin
  url: ${url ?? "https://linkedin.com/REPLACE-ME"}
category: ${category}
tags: []
${heroImage ? `heroImage: ${JSON.stringify(heroImage)}\n` : ""}readingMinutes: ${Math.max(2, Math.round(body.split(/\s+/).length / 220))}
indexable: false
draft: true
---

${body}
`;
  return frontmatter;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.url) {
    console.error("Usage: node scripts/import-linkedin.mjs <linkedin-url> [--locale=en|pl] [--author=lukasz|mateusz|pirxey]");
    process.exit(1);
  }
  const author = AUTHORS[args.author];
  if (!author) {
    console.error(`Unknown author "${args.author}". Known: ${Object.keys(AUTHORS).join(", ")}`);
    process.exit(1);
  }

  console.log(`→ Fetching ${args.url} ...`);
  const html = await fetchOrPrompt(args.url);
  const title = extractTitle(html) ?? "Untitled — edit me";
  const heroImage = extractOgImage(html);
  const body = stripHtml(html);

  const slug = slugify(title);
  const dir = resolve(ROOT, "src/content/blog", args.locale);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const out = resolve(dir, `${slug}.mdx`);
  if (existsSync(out)) {
    console.error(`✗ ${out} already exists. Move or delete it first.`);
    process.exit(2);
  }
  const mdx = buildMdx({ title, body, heroImage, url: args.url, author, locale: args.locale });
  writeFileSync(out, mdx, "utf-8");

  console.log(`\n✓ Imported as draft:\n  ${out}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open the file, clean up the body (strip nav/footer noise).`);
  console.log(`  2. Tune frontmatter: title, excerpt, category, tags, indexable.`);
  console.log(`  3. Remove "draft: true" when ready to publish.`);
}

main().catch((e) => {
  console.error("✗", e);
  process.exit(1);
});
