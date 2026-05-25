import { defineCollection, z } from "astro:content";

const LOCALES = ["en", "pl"] as const;
const localeSchema = z.enum(LOCALES);

const briefs = defineCollection({
  type: "content",
  schema: z.object({
    id: z.string(),                    // e.g. "001"
    title: z.string(),                 // shown in topbar + hero
    subtitle: z.string().optional(),
    description: z.string(),           // SEO meta description
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.object({
      name: z.string(),
      role: z.string().optional(),
      url: z.string().url().optional(),
    }),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),  // path under /public
    heroEyebrow: z.string().optional(),
    heroHeadline: z.string(),          // can contain inline HTML, see template
    heroSub: z.string(),
    heroStats: z.array(z.object({
      value: z.string(),
      label: z.string(),
      tone: z.enum(["up", "mid", "down"]).default("mid"),
    })).default([]),
    /** Bullet lines for the homepage "In this brief" kit. Up to 4 items. */
    kit: z.array(z.string()).max(4).default([]),
    /** Visual shape used in the homepage preview thumbnail.
     *  - `curve`    : decaying boost curve with two annotation pills (default — 001 archetype)
     *  - `envelope` : envelope / auth motif (email / deliverability briefs)
     *  - `shield`   : shield motif (security / posture briefs)
     */
    previewKind: z.enum(["curve", "envelope", "shield"]).default("curve"),
    /** Two short labels overlaid on the preview thumbnail. For the curve
     *  archetype these are the start/end stat (e.g. "9.4×" / "1.6×"). For
     *  other kinds they label whatever the visual highlights. */
    previewLabels: z.tuple([z.string(), z.string()]).optional(),
    ctaPrimaryLabel: z.string().default("Schedule a discovery call"),
    ctaPrimaryUrl: z.string().url(),
    ctaSecondaryLabel: z.string().default("sales@pirxey.com"),
    ctaSecondaryUrl: z.string().default("mailto:sales@pirxey.com"),
    draft: z.boolean().default(false),
  }),
});

/**
 * Services — per-service SEO landing pages. One MDX per service per locale.
 * Path convention: src/content/services/<locale>/<slug>.mdx
 * Frontmatter holds structured data; MDX body holds long-form prose.
 */
const services = defineCollection({
  type: "content",
  schema: z.object({
    // slug comes from filename (Astro reserves the `slug` field)
    locale: localeSchema,
    title: z.string(),                   // H1 + SEO title fallback
    eyebrow: z.string().optional(),      // small label above title
    tagline: z.string(),                 // 1-line punch
    description: z.string(),             // SEO meta description (150-160 chars)
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** Hero block configuration. */
    hero: z.object({
      headline: z.string(),
      sub: z.string(),
      image: z.string().optional(),
      ctaLabel: z.string().default("Schedule a discovery call"),
      ctaUrl: z.string().url(),
    }),
    /** Sub-services / capability bullets shown in feature grid. */
    capabilities: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
    })).default([]),
    /** Tech stack chips shown under hero. */
    techStack: z.array(z.string()).default([]),
    /** Industries / verticals served by this service. */
    industries: z.array(z.string()).default([]),
    /** Case studies highlighted on this page. References blog/briefs by slug. */
    caseStudies: z.array(z.object({
      title: z.string(),
      client: z.string(),
      excerpt: z.string(),
      url: z.string().optional(),  // internal route or external link
    })).default([]),
    /** Order in the services list (lower = first). */
    order: z.number().default(0),
    /** Indexable by search engines once ready. Default false (pre-launch). */
    indexable: z.boolean().default(false),
  }),
});

/**
 * Blog — long-form articles, including LinkedIn republishes.
 * Path: src/content/blog/<locale>/<slug>.mdx
 */
const blog = defineCollection({
  type: "content",
  schema: z.object({
    // slug comes from filename
    locale: localeSchema,
    title: z.string(),
    excerpt: z.string(),                  // homepage card + meta description
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.object({
      name: z.string(),                   // "Łukasz Graliński" / "Mateusz Kapica" / "Pirxey"
      role: z.string().optional(),
      avatar: z.string().optional(),
      linkedinUrl: z.string().url().optional(),
    }),
    /** Where this article was originally published, if anywhere. */
    originalSource: z.object({
      platform: z.enum(["linkedin", "medium", "twitter", "other"]),
      url: z.string().url(),
      publishedAt: z.coerce.date().optional(),
    }).optional(),
    category: z.enum([
      "engineering",
      "ai",
      "leadership",
      "culture",
      "business",
      "case-study",
    ]),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    readingMinutes: z.number().optional(),
    indexable: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { briefs, services, blog };
