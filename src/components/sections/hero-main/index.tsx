"use client";

import { useState, type ReactNode } from "react";
import { AstronautSticker } from "@/components/astronaut-sticker";
import { SvgArrow } from "@/components/svg/svg-arrow";
import { SvgStars } from "@/components/svg/svg-stars";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Astronaut } from "./astronaut";
import { DecorationExplore } from "./decoration-explore";

export type HeroLink = {
  key: string;
  text: string;
  href: string;
  variant?: "default" | "secondary" | "outline" | "inverted" | "ghost";
};

export type HeroMainProps = {
  /** Small sticker / pill above the title. Can be a string or arbitrary React node. */
  stickerText?: ReactNode;
  /** H1 — string (renders inside <h1 class="typography-heading-1">). */
  title: string;
  /** Body paragraph — string (rendered inside <p class="typography-body-lg">). */
  text: string;
  /** CTA buttons. Default variant = orange filled, "inverted" = light. */
  links?: HeroLink[];
};

/**
 * HeroMain — homepage hero.
 * Faithful port of pirxey-website-nextjs/src/sanity/components/blocks/hero-main/index.tsx.
 *
 * Sanity coupling removed:
 *  - TitleField → plain <h1> with `title` string prop
 *  - BlockContentField (text) → <p> with `text` string prop
 *  - BlockContentField (stickerText) → AstronautSticker children prop
 *  - links?.map(LinkField) → links?.map() using <a> href, with Button render prop
 *
 * Visual: identical Tailwind classes, same Astronaut parallax, same blur halos,
 * same SvgStars / SvgArrow / DecorationExplore decorations.
 */
export function HeroMain({ stickerText, title, text, links = [] }: HeroMainProps) {
  const [isButtonHovered, setButtonHovered] = useState(false);

  return (
    <section className="@container grid-container clip-corners-4 bg-(image:--bg-noise-on-light) relative isolate overflow-clip bg-cover bg-surface-light-100 py-30 text-text-on-light-primary md:py-57.5 lg:py-48">
      <Astronaut
        data-column="full-width"
        className="absolute -right-40 bottom-0"
        zoomIn={isButtonHovered}
      />
      <img
        data-column="edge"
        className="pointer-events-none absolute right-0 bottom-0 z-1 h-auto max-w-none"
        src="/assets/images/blur-bottom-right--hero-main.png"
        width={749}
        height={560}
        alt=""
      />
      <img
        data-column="edge"
        className="pointer-events-none absolute top-0 left-0 z-1 h-auto max-w-none"
        src="/assets/images/blur-top-left--hero-main.png"
        width={760}
        height={519}
        alt=""
      />
      <div className="relative z-10 my-auto max-w-160 space-y-8">
        {stickerText && <AstronautSticker>{stickerText}</AstronautSticker>}
        <SvgStars className="text-text-accent-on-light" />
        <h1 className="typography-heading-1 inline-block">{title}</h1>
        <p className="typography-body-lg">{text}</p>
        <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
          {links.map((link) => (
            <Button
              key={link.key}
              className="max-lg:flex-1"
              nativeButton={false}
              variant={link.variant ?? "default"}
              render={<a href={link.href} />}
              onMouseEnter={() => setButtonHovered(true)}
              onFocus={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
              onBlur={() => setButtonHovered(false)}
            >
              {link.text}
              <SvgArrow />
            </Button>
          ))}
        </div>
        <a
          href="#features"
          className="group absolute top-1/2 -left-7.5 -translate-x-full -translate-y-[calc(50%+2rem)] max-lg:hidden"
        >
          <DecorationExplore className="[&_svg]:transition-transform [&_svg]:duration-250 group-hover:[&_svg]:translate-y-1" />
        </a>
      </div>
    </section>
  );
}
