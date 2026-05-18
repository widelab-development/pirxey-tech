#!/usr/bin/env node
/**
 * design-review capture — opens the brief on desktop + mobile, takes
 * full-page + viewport-only screenshots, logs console errors, and dumps
 * a structural snapshot for analysis.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL = process.argv[2] || "https://pirxey.tech/briefs/001-why-10x-isnt-a-constant/";
const OUT = ".jez/artifacts";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop",  width: 1280, height: 800 },
  { name: "tablet",  width: 768,  height: 1024 },
  { name: "mobile",  width: 390,  height: 844 },
];

const errors = [];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push({ vp: vp.name, type: msg.type(), text: msg.text() });
    }
  });
  page.on("pageerror", (err) => errors.push({ vp: vp.name, type: "pageerror", text: String(err) }));
  console.log(`[${vp.name}] navigating to ${URL}`);
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(800); // let fonts + reveal animations settle

  await page.screenshot({ path: join(OUT, `${vp.name}-viewport.png`), fullPage: false });
  await page.screenshot({ path: join(OUT, `${vp.name}-full.png`), fullPage: true });

  // Element-level snapshots for the parts the user mentioned
  for (const sel of [
    ["topbar", "#topbar"],
    ["hero", ".hero, .reg-hero"],
    ["cockpit", "#cockpit"],
    ["methodology", ".methodology"],
    ["forces", "#forces"],
    ["evidence", "#evidence"],
    ["footer", ".pirxey-footer"],
  ]) {
    try {
      const el = await page.$(sel[1]);
      if (el) {
        await el.screenshot({ path: join(OUT, `${vp.name}-${sel[0]}.png`) });
      }
    } catch (e) { /* element not present at this viewport */ }
  }

  // Layout measurements for nav
  const metrics = await page.evaluate(() => {
    const $ = (s) => document.querySelector(s);
    const measure = (s) => {
      const el = $(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) };
    };
    const navItems = Array.from(document.querySelectorAll(".site-header__nav-block nav a"))
      .map((a) => ({ label: a.textContent.trim(), rect: a.getBoundingClientRect() }));
    return {
      header: measure("#topbar"),
      brand: measure(".site-header__brand-block"),
      mission: measure(".mission"),
      navBlock: measure(".site-header__nav-block"),
      navItemRows: new Set(navItems.map((i) => Math.round(i.rect.top))).size,
      navItems: navItems.map((i) => ({ label: i.label, top: Math.round(i.rect.top), width: Math.round(i.rect.width) })),
      heroH1: measure(".hero h1, .reg-hero h1"),
      heroSubMaxWidth: $(".hero-sub")?.clientWidth ?? null,
    };
  });

  writeFileSync(join(OUT, `${vp.name}-metrics.json`), JSON.stringify(metrics, null, 2));
  console.log(`  navItemRows=${metrics.navItemRows} navBlock=${metrics.navBlock?.w}px`);

  await ctx.close();
}
await browser.close();

writeFileSync(join(OUT, "console-issues.json"), JSON.stringify(errors, null, 2));
console.log(`\n✓ screenshots + metrics written to ${OUT}/`);
console.log(`  console issues: ${errors.length}`);
