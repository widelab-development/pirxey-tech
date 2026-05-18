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
    ctaPrimaryLabel: z.string().default("Schedule a discovery call"),
    ctaPrimaryUrl: z.string().url(),
    ctaSecondaryLabel: z.string().default("sales@pirxey.com"),
    ctaSecondaryUrl: z.string().default("mailto:sales@pirxey.com"),
    draft: z.boolean().default(false),
  }),
});

export const collections = { briefs };
