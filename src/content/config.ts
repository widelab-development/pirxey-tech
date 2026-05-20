import { defineCollection, z } from "astro:content";

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

export const collections = { briefs };
