// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// Public site URL (override per deploy via PUBLIC_SITE env or in CI).
const SITE = process.env.PUBLIC_SITE || "https://pirxey.tech";

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    mdx({
      // Allow GFM, footnotes, smartypants — typographic polish for posts.
      gfm: true,
      smartypants: true,
    }),
    react(),
    sitemap({
      changefreq: "monthly",
      priority: 0.8,
      lastmod: new Date(),
    }),
  ],
  prefetch: { defaultStrategy: "viewport" },
});
