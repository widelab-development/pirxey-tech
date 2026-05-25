/**
 * UI strings translations.
 * Use via t("nav.home", locale). Adding a key: add to both en + pl.
 */

export const LOCALES = ["en", "pl"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const UI = {
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.blog": "Blog",
    "nav.briefs": "Briefs",
    "nav.contact": "Let's talk",
    "nav.menu": "Menu",
    "nav.close": "Close",
    "cta.discoveryCall": "Schedule a discovery call",
    "cta.contactSales": "Contact sales",
    "cta.readMore": "Read more",
    "cta.viewAll": "View all",
    "cta.viewAllServices": "View all services",
    "cta.viewAllBriefs": "View all briefs",
    "cta.viewAllPosts": "View all posts",
    "footer.tagline": "Custom software development. AI-first. Talent from across Poland.",
    "footer.rights": "All rights reserved.",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "blog.byAuthor": "By",
    "blog.publishedOn": "Published on",
    "blog.minutesRead": "min read",
    "blog.originalOn": "Originally published on",
    "blog.categories.engineering": "Engineering",
    "blog.categories.ai": "AI",
    "blog.categories.leadership": "Leadership",
    "blog.categories.culture": "Culture",
    "blog.categories.business": "Business",
    "blog.categories.case-study": "Case Study",
    "services.heading": "Here's how we can help you",
    "services.subheading": "Pick your mission — we'll handle the trajectory.",
    "services.capabilities": "What we deliver",
    "services.techStack": "Stack",
    "services.industries": "Industries",
    "services.caseStudies": "Case studies",
    "lang.switch": "Język",
    "lang.en": "English",
    "lang.pl": "Polski",
  },
  pl: {
    "nav.home": "Strona główna",
    "nav.services": "Usługi",
    "nav.blog": "Blog",
    "nav.briefs": "Briefy",
    "nav.contact": "Porozmawiajmy",
    "nav.menu": "Menu",
    "nav.close": "Zamknij",
    "cta.discoveryCall": "Umów rozmowę",
    "cta.contactSales": "Kontakt sprzedaż",
    "cta.readMore": "Czytaj dalej",
    "cta.viewAll": "Zobacz wszystkie",
    "cta.viewAllServices": "Wszystkie usługi",
    "cta.viewAllBriefs": "Wszystkie briefy",
    "cta.viewAllPosts": "Wszystkie wpisy",
    "footer.tagline": "Custom software development. AI-first. Talenty z całej Polski.",
    "footer.rights": "Wszystkie prawa zastrzeżone.",
    "footer.privacy": "Prywatność",
    "footer.terms": "Regulamin",
    "blog.byAuthor": "Autor:",
    "blog.publishedOn": "Opublikowano:",
    "blog.minutesRead": "min czytania",
    "blog.originalOn": "Oryginał opublikowany na",
    "blog.categories.engineering": "Engineering",
    "blog.categories.ai": "AI",
    "blog.categories.leadership": "Leadership",
    "blog.categories.culture": "Kultura",
    "blog.categories.business": "Biznes",
    "blog.categories.case-study": "Case Study",
    "services.heading": "Oto jak możemy Ci pomóc",
    "services.subheading": "Wybierz misję — my zajmiemy się trajektorią.",
    "services.capabilities": "Co dostarczamy",
    "services.techStack": "Stack",
    "services.industries": "Branże",
    "services.caseStudies": "Case studies",
    "lang.switch": "Language",
    "lang.en": "English",
    "lang.pl": "Polski",
  },
} as const;

export type UIKey = keyof (typeof UI)["en"];

export function t(key: UIKey, locale: Locale = DEFAULT_LOCALE): string {
  return UI[locale]?.[key] ?? UI[DEFAULT_LOCALE][key] ?? key;
}

/** Build a localized URL. EN stays at root, PL prefixed with /pl/. */
export function localizedUrl(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean}`;
}

/** Extract locale from URL pathname (e.g. /pl/services → "pl", /services → "en"). */
export function getLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (LOCALES.includes(seg as Locale)) return seg as Locale;
  return DEFAULT_LOCALE;
}
