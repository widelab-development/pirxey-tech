// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Public site URL (override per deploy via PUBLIC_SITE env or in CI).
const SITE = process.env.PUBLIC_SITE || "https://pirxey.tech";

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  build: { format: "directory" },
  // EN at root (default), PL at /pl/. Keeps existing /briefs/* URLs intact.
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pl"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    mdx({
      gfm: true,
      smartypants: true,
    }),
    react(),
    sitemap({
      changefreq: "monthly",
      priority: 0.8,
      lastmod: new Date(),
      // Skip noindex pages from sitemap once we start indexing selectively.
      // For now everything is noindex so sitemap is effectively informational.
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", pl: "pl-PL" },
      },
    }),
  ],
  prefetch: { defaultStrategy: "viewport" },
  vite: {
    plugins: [tailwindcss()],
  },
});
