# pirxey.tech

Interactive Mission Briefs from Pirxey — one concept per page, each a working widget you can play with.

## Stack

- **Astro 5** — static site generation, route-per-brief, prerendered HTML for indexing
- **MDX content collection** — every brief is a `.mdx` file with typed frontmatter (see `src/content/config.ts`)
- **React islands** — interactive widgets (`Cockpit.tsx` etc.) hydrate only where needed (`client:visible`)
- **Pirxey design tokens** — Space Grotesk + Fira Sans, paleta z Figmy (`src/styles/tokens.css`)
- **`@astrojs/sitemap`** — `sitemap-index.xml` generowany przy buildzie
- **Per-brief SEO** — title, description, Open Graph, Twitter, JSON-LD `TechArticle` + `BreadcrumbList` (z `BriefLayout.astro`)

## Structure

```
src/
├── content/
│   ├── config.ts              # Zod schema for brief frontmatter
│   └── briefs/
│       └── 001-why-10x-isnt-a-constant.mdx
├── layouts/
│   ├── BaseLayout.astro       # html/head/SEO
│   └── BriefLayout.astro      # TopBar + Hero + slot + Footer
├── components/
│   ├── TopBar.astro
│   ├── Hero.astro
│   ├── Section.astro          # rounded dark/light section wrapper
│   ├── CTA.astro
│   ├── Footer.astro
│   ├── SEO.astro
│   ├── cards/
│   │   ├── SoloVsTeamCard.astro
│   │   ├── ForceCard.astro
│   │   └── EvidenceCard.astro
│   └── react/
│       ├── Cockpit.tsx        # interactive geometric-decay widget
│       └── Cockpit.css
├── styles/
│   ├── tokens.css             # Pirxey design system (colors, fonts, scale)
│   └── global.css
└── pages/
    ├── index.astro            # registry of all briefs
    └── briefs/
        └── [...slug].astro    # dynamic brief route
public/
├── assets/                    # SVG + PNG from Figma (logo, hero bg, noise, stars)
└── robots.txt
```

## Adding a new brief

1. Create `src/content/briefs/<id>-<slug>.mdx`
2. Fill in the frontmatter (see `001-why-10x-isnt-a-constant.mdx` for full template)
3. In MDX body, import + use components: `Section`, `Cockpit`, `SoloVsTeamCard`, `ForceCard`, `EvidenceCard` — or write your own
4. Run `npm run dev` — it will appear in the registry at `/` and at `/briefs/<id>-<slug>/`

Drafts: set `draft: true` in frontmatter to hide.

## Develop

```bash
npm install
npm run dev          # localhost:4321
npm run build        # static export to dist/
npm run preview      # serve built site
```

## Deploy

Cloudflare Pages:

```bash
npx wrangler pages deploy dist --project-name pirxey-tech --branch main
```

## Roadmap

- [ ] More brief widgets: RAG hallucination explorer, prompt-cost calculator, "is your AI coding assistant slowing you down?" quiz
- [ ] RSS feed for new briefs
- [ ] Social card auto-generator (per-brief OG image)
- [ ] MDX components library — Diagram, Quote, Aside, Callout
- [ ] Author-multi support (when more Pirxey teammates publish)
