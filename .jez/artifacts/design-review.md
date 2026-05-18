# Design Review: pirxey.tech / Mission Brief 001

**Date**: 2026-05-18
**URL**: https://pirxey.tech/briefs/001-why-10x-isnt-a-constant/
**Viewports tested**: 1440 / 1280 / 768 / 390
**Method**: Playwright headless Chromium, full-page + element-level screenshots, layout metrics, console capture.

## Overall Impression

The brand expression is **strong and intentional** — Pirxey's astronaut/orange visual identity reads clearly, the SpaceCanvas WebGL background is a signature touch, the typography pair (Spacegrotesk + Firasans) lands. The page no longer "looks like a developer designed it" — but several **structural and small consistency issues** drag it back toward unpolished territory. Most are small, one is high-severity.

## Findings

### High

- **Solo-vs-Team card: missing line break between `Team` label and team copy** at `.solo-card .vs` — `<strong>Team</strong>` was injected via `set:html` so the scoped CSS rule `.vs .col strong { display: block }` didn't match it (no `data-astro-cid` on dynamic HTML). Output reads `TeamProduction talks to 47 systems…`. **Fix shipped** in this iteration: extracted body into a separate `<span class="col-body">` element with explicit `flex-direction: column`. Verify on hard refresh.
- **Tablet 768px: nav wraps to 2 rows, mobile 390 wraps to 3 rows.** Confirmed by metrics (`navItemRows: 2` / `3`). Currently no break to a hamburger / drawer pattern. **Fix needed**: introduce a mobile sheet menu below ~900px (Pirxey homepage does this).
- **Console: 4× `Failed to load resource: 403`** on every page-load. Most likely the Pirxey CDN font TTFs (`@font-face` URLs in `global.css`) — Webflow CDN may be blocking hot-link referers. The browser silently falls back to `Tahoma` from the font stack. **Fix needed**: either self-host the TTFs in `/public/fonts/` (recommended) or remove the @font-face block entirely and rely on Google Fonts.

### Medium

- **Hero "Mission Brief 001 / May 15, 2026 / by Łukasz Graliński" eyebrow**: tag pill at top reads heavy because three pieces are crammed in one chip. Splitting into "Mission Brief 001 — May 15, 2026" as one block and "by Łukasz Graliński" as a softer secondary line would breathe better.
- **Strikethrough "10×" in hero H1**: stroke is offset slightly low (~52% of cap-height). Crosses below the digit baseline rather than through the middle. Bump `top: 48%`.
- **Solo-vs-Team `→` arrow**: 24px sans-serif arrow on light bg is the weakest typographic moment on the page. The forces section has a beacon dot + big orange numeral — much stronger language. Reuse the same orange numeral pattern on Solo-vs-Team cards (`01 / Solo → Team`).
- **Cockpit methodology row** (the three notes): kicker `01 · METHOD` is good but the title and body sit too close (`gap: 8px`) so the eye reads them as one block. Bump to `gap: 12px`, and right-pad each card on the inside (`padding: 24px 26px`).
- **Hero astronaut animation**: `@keyframes float` runs 12s with 18px Y delta — at default ease the apex feels static for ~1s. Tighten to 9s and reduce amplitude to ~12px for a livelier yet calm motion.
- **Hero CTA button "Open the cockpit"**: doesn't visually anchor on hover — only background color shifts. Add a subtle scale/glow: `transform: translateY(-2px); box-shadow: 0 12px 36px -10px rgba(255,96,38,0.65)`.

### Low

- **Hero stat cards (`9.2× / 4.4× / 1.6×`)**: number color drops contrast on the cream-tinted astronaut backdrop; `--amber` (#FFA740) for the mid stat reads orange-brown on noise. Either dark base, or boost contrast.
- **Force card stat label** (e.g. "+38% redundant logic"): uppercase 13px tracked 0.06em — fine, but on cards with longer stat strings (`Review grows 1.7× faster`) the right column wraps to two lines next to the big numeral, breaking visual rhythm. Allow stat to wrap below the number on overflow.
- **Evidence card "Soft" label** (last card, stat="Soft"): the trailing single word stat reads oddly compared to `19%`, `47%`, `39pt` numerics. Use `S.S.` or `5⭑` or just `↑` to keep visual scale consistent.
- **MarqueeRow fade masks**: `linear-gradient(90deg, var(--bg) → transparent)` — but `--bg` (#060411) doesn't match the actual stars-painted page background. The edges show a thin dark band against the otherwise transparent canvas. Use `rgba(6,4,17,0.0)` to `transparent` instead, or omit gradient on dark theme.
- **SpaceCanvas + drop-shadow on astronaut**: the `filter: drop-shadow(...)` triggers GPU stall warnings (`GPU stall due to ReadPixels` in console). Drop it or move to a `box-shadow` on a wrapping box.
- **Footer Clutch row**: "9 REVIEWS" uppercase 14px sits inline with the 14px stars — both compete for the eye. Reduce reviews label to 11px or move below stars.
- **`.has-image-bg` hero**: bottom-of-image gradient transition to dark is good now — but the right ~30% of the image is barely visible (90% dark overlay). Either crop background image differently or back off the 100% gradient stop to 0.7.

## What Looks Good

- **Brand fidelity to live pirxey.com**: real logotype, astronaut, planet, noise texture all from Webflow CDN. The Space Grotesk + Fira Sans pair is the actual Pirxey type system.
- **SpaceCanvas WebGL stars**: pixel-port of pirxey.com's real Three.js field, 7000 points, subtle rotation, additive blending. This is a *signature* — hold onto it.
- **Notch header pattern**: two dark bars + cream peninsula + 16×16 concave SVG corners. Sophisticated, brand-coherent. Working.
- **Forces section ("01 / 02 / 03…" with big orange numerals + beacon dot)**: strongest moment on the page. The chapter-marker pattern is distinctive and reusable.
- **Cockpit interactive**: stays compact (380px left panel) after the methodology row was promoted to a 3-column strip. The geometric formula display + sequence breakdown is genuinely useful UX.
- **Light section noise/dots layering**: `linear-gradient(cream 90%) + noise.webp tile + Pirxey dots SVG at bottom + radial orange glows` is the same recipe as live pirxey.com light bands.
- **Per-brief SEO setup**: title/description/canonical/OG/Twitter + JSON-LD `TechArticle` + `BreadcrumbList` + sitemap-index. Production-grade.

## Top 3 Fixes

1. **Self-host Pirxey TTFs** under `/public/fonts/`. The Webflow CDN 403s mean every visitor currently sees Tahoma fallback. Single biggest visual win.
2. **Mobile nav drawer** below 900px. Currently nav wraps to 3 rows at 390px — looks broken.
3. **Polish Solo-vs-Team cards** — Team label fix (shipped), but also: replace the `→` divider with the same Pirxey numerical chapter mark used in Forces, for visual consistency across both card families.

## Notes for the Build

- Audit ran headless against the live deploy at `https://pirxey.tech`, post the topbar geometry fix landing at 23:41 CEST.
- 24 console items captured — 5 are 403s (likely fonts), the rest are WebGL `GPU stall due to ReadPixels` warnings from `SpaceCanvas`. Not a regression, just noise.
- Screenshots: `.jez/artifacts/{desktop,laptop,tablet,mobile}-{viewport,full,topbar,hero,cockpit,methodology,forces,evidence,footer}.png`
- Layout metrics: `.jez/artifacts/{desktop,laptop,tablet,mobile}-metrics.json`
- Console log: `.jez/artifacts/console-issues.json`
