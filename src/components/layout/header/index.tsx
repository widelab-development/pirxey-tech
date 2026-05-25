"use client";

import { useState, type ReactNode } from "react";
import { SvgRectangles } from "@/components/svg/svg-rectangles";
import { SvgSquares } from "@/components/svg/svg-squares";
import { SvgArrow } from "@/components/svg/svg-arrow";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

/**
 * Header — site-wide top chrome.
 * Faithful port of pirxey-website-nextjs/src/components/layout/header/header-desktop.tsx.
 *
 * Key visual moves preserved:
 *  - Fixed top, z-50, dark background with clip-path corners cutting into the page below
 *  - 3-column grid: Logo / Indent (SvgSquares + SvgRectangles centerpiece) / Nav
 *  - Two header layers: one transparent presentation (logo/nav hidden), one filled background
 *  - On mobile (<md): hamburger trigger that opens a full-screen menu via <details>
 *
 * Sanity coupling removed — navigation links passed as props.
 */

export type NavLink = {
  text: string;
  href: string;
  type?: "link" | "cta";
};

export type HeaderProps = {
  navigationLinks: NavLink[];
  /** Logo target (locale-aware). */
  logoHref?: string;
  /** Locale switcher target href + label. */
  localeSwitch?: { href: string; label: string };
};

export function Header({ navigationLinks, logoHref = "/", localeSwitch }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Presentation layer — gives the chrome its 3-col layout space; logo + nav hidden here */}
      <div
        className={cn(
          "grid-container",
          styles.container,
          styles.containerPresentation
        )}
        role="presentation"
      >
        <div className={styles.content}>
          <Logo logoHref={logoHref} />
          <Indent />
          <div className={cn(styles.item, styles.indentContent)}>
            <SvgSquares />
            <SvgRectangles className="max-lg:hidden" />
          </div>
          <Nav links={navigationLinks} localeSwitch={localeSwitch} />
        </div>
      </div>

      {/* Actual filled header */}
      <header className={cn("grid-container", styles.container)}>
        <BackgroundFill />
        <div className={styles.content}>
          <Logo logoHref={logoHref} />
          <Indent />
          <Nav
            links={navigationLinks}
            localeSwitch={localeSwitch}
            mobileOpen={mobileOpen}
            onMobileToggle={() => setMobileOpen((v) => !v)}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>
      </header>

      {mobileOpen && (
        <MobileDrawer
          links={navigationLinks}
          localeSwitch={localeSwitch}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

function BackgroundFill() {
  return (
    <>
      <div className={cn(styles.bgFill, styles.bgFillLeft)} />
      <div className={cn(styles.bgFill, styles.bgFillRight)} />
    </>
  );
}

function Logo({ logoHref }: { logoHref: string }) {
  return (
    <div className={cn(styles.item, styles.logo)}>
      <a href={logoHref} aria-label="Pirxey home" className="block">
        <img
          className="h-auto w-21.25 lg:w-37.5"
          src="/assets/svg/pirxey-logo.svg"
          alt="Pirxey"
          width={151}
          height={40}
        />
      </a>
    </div>
  );
}

function Indent() {
  return <div className={cn(styles.item, styles.indent)} />;
}

function Nav({
  links,
  localeSwitch,
  mobileOpen,
  onMobileToggle,
  onMobileClose,
}: {
  links: NavLink[];
  localeSwitch?: { href: string; label: string };
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
  onMobileClose?: () => void;
}) {
  return (
    <nav className={cn(styles.item, styles.nav)}>
      <ul className="max-md:hidden!">
        {links.map((item, i) => (
          <li key={`${item.text}-${i}`}>
            {item.type === "cta" ? (
              <NavCta link={item} />
            ) : (
              <NavLink link={item} />
            )}
          </li>
        ))}
        {localeSwitch && (
          <li>
            <a
              href={localeSwitch.href}
              className="typography-meta opacity-70 hover:opacity-100 transition-opacity"
              aria-label={`Switch language to ${localeSwitch.label}`}
            >
              {localeSwitch.label}
            </a>
          </li>
        )}
      </ul>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={onMobileToggle}
        className={cn(
          "typography-link relative ml-auto pl-3.5 text-text-on-dark-primary transition-colors md:hidden",
          "before:absolute before:top-1/2 before:left-0 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent before:transition-colors before:content-['']",
          mobileOpen && "before:bg-current"
        )}
      >
        {mobileOpen ? "Close" : "Menu"}
      </button>
    </nav>
  );
}

function NavLink({ link }: { link: NavLink }) {
  return (
    <a
      href={link.href}
      className={cn(
        "typography-link relative inline-block pl-3.5 transition-colors",
        "before:absolute before:top-1/2 before:left-0 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent before:transition-colors before:content-['']",
        "hover:before:bg-current"
      )}
    >
      {link.text}
    </a>
  );
}

function NavCta({ link }: { link: NavLink }) {
  return (
    <a
      href={link.href}
      className={cn(
        "group typography-link flex items-center gap-2 text-text-accent-on-dark transition-colors hover:text-accent-primary-hover"
      )}
    >
      <span>{link.text}</span>
      <SvgArrow />
    </a>
  );
}

function MobileDrawer({
  links,
  localeSwitch,
  onClose,
}: {
  links: NavLink[];
  localeSwitch?: { href: string; label: string };
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-surface-dark-300 bg-cover bg-center bg-no-repeat text-text-on-dark-primary",
        "px-5 pt-24 pb-6 overflow-y-auto"
      )}
      style={{ backgroundImage: "var(--bg-mobile-menu)" }}
    >
      <div className="grid-container h-full">
        <div className="flex h-full flex-col">
          <nav>
            <ul className="flex flex-col">
              {links.map((item, i) => (
                <li key={`${item.text}-${i}`} className="pb-4">
                  {item.type === "cta" ? <NavCta link={item} /> : <NavLink link={item} />}
                </li>
              ))}
              {localeSwitch && (
                <li className="pt-4 mt-2 border-t border-border-on-dark-subtle">
                  <a
                    href={localeSwitch.href}
                    className="typography-link text-text-on-dark-secondary"
                  >
                    {localeSwitch.label} →
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
