"use client";

import { motion } from "motion/react";
import { AstronautSticker } from "@/components/astronaut-sticker";
import { SvgArrow } from "@/components/svg/svg-arrow";
import { SvgShape } from "@/components/svg/svg-shape";
import { SvgStars } from "@/components/svg/svg-stars";
import { Button } from "@/components/ui/button";
import { defaultViewport, revealTextBottomToTopVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DecorationVelocity } from "./decoration-velocity";

/**
 * SplitImage — dark "What makes Pirxey special v2" section.
 * Faithful port of pirxey-website-nextjs Sanity block.
 * Scroll-progress-indicator stripped (complex provider, not critical to homepage feel).
 */

export type SplitSectionItem = {
  key: string;
  title: string;
  text: string;
  image?: string;
};

export type SplitImageProps = {
  title: string;
  sections: SplitSectionItem[];
  /** Where the image sits in the first row. Alternates from there. */
  startingOrientation?: "imageLeft" | "imageRight";
  topStickerText?: React.ReactNode;
  bottomStickerText?: React.ReactNode;
  cta?: { text: string; href: string };
};

export function SplitImage({
  title,
  sections,
  startingOrientation = "imageRight",
  topStickerText,
  bottomStickerText,
  cta,
}: SplitImageProps) {
  return (
    <section className="dark grid-container relative py-section-padding text-text-on-dark-primary">
      <div className="flex flex-col items-center gap-y-8">
        {topStickerText && <AstronautSticker>{topStickerText}</AstronautSticker>}
        <h2 className="typography-heading-1 overflow-clip text-center">
          <motion.span
            className="block"
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={revealTextBottomToTopVariants}
          >
            {title}
          </motion.span>
        </h2>
        <SvgStars className="mx-auto text-text-accent-on-light" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 h-95 text-gray-400 max-lg:hidden">
        <SvgShape className="absolute bottom-16 left-0 size-18" />
        <div className="absolute right-0 bottom-0">
          <DecorationVelocity />
        </div>
      </div>

      <div data-column="content" className="relative my-16 flex flex-col gap-16 lg:gap-32">
        {sections.map((section, idx) => {
          const evenOrientation = startingOrientation === "imageRight" ? "imageRight" : "imageLeft";
          const oddOrientation = startingOrientation === "imageRight" ? "imageLeft" : "imageRight";
          return (
            <SplitRow
              key={section.key}
              section={section}
              orientation={idx % 2 === 0 ? evenOrientation : oddOrientation}
            />
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start">
        {bottomStickerText && <AstronautSticker>{bottomStickerText}</AstronautSticker>}
        {cta && (
          <Button
            className="self-stretch"
            nativeButton={false}
            render={<a href={cta.href} />}
          >
            {cta.text}
            <SvgArrow />
          </Button>
        )}
      </div>
    </section>
  );
}

function SplitRow({
  section,
  orientation,
}: {
  section: SplitSectionItem;
  orientation: "imageLeft" | "imageRight";
}) {
  return (
    <motion.div
      className="flex flex-col gap-x-14 gap-y-7 sm:flex-row sm:items-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-200px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
      }}
    >
      <div
        className={cn(
          "space-y-8 sm:flex-1 lg:flex-526 2xl:flex-526",
          orientation === "imageLeft" && "sm:order-2"
        )}
      >
        <h3 className="typography-heading-2">{section.title}</h3>
        <p className="typography-body-lg text-text-on-dark-secondary">{section.text}</p>
      </div>
      {section.image && (
        <img
          className="h-100 min-w-0 rounded-2xl border border-border-on-dark object-cover sm:flex-1 lg:flex-482 2xl:flex-616"
          src={section.image}
          width={1020}
          height={660}
          alt=""
        />
      )}
    </motion.div>
  );
}
