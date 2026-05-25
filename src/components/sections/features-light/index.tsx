"use client";

import { motion, stagger, type Variants } from "motion/react";
import { AstronautSticker } from "@/components/astronaut-sticker";
import { SvgArrow } from "@/components/svg/svg-arrow";
import { SvgStars } from "@/components/svg/svg-stars";
import { Button } from "@/components/ui/button";
import { defaultViewport, fadeInBottomToTopVariants } from "@/lib/motion";

/**
 * FeaturesLight — "What makes Pirxey special" section (v1 layout).
 * Faithful port of pirxey-website-nextjs Sanity block.
 *
 * Light cream background, 3-column grid of feature cards. Each card has its own
 * background image with linear gradient overlay, plus an icon and copy.
 */

export type Feature = {
  key: string;
  titleStart: string;
  titleEnd: string;
  description?: string;
  image?: string;
  icon?: string;
};

export type FeaturesLightProps = {
  title: string;
  features: Feature[];
  stickerText?: React.ReactNode;
  cta?: { text: string; href: string };
};

const featureGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: stagger(0.15, { startDelay: 0.3 }) },
  },
};

export function FeaturesLight({ title, features, stickerText, cta }: FeaturesLightProps) {
  return (
    <section className="grid-container clip-corners-4 bg-(image:--bg-noise-on-light) relative isolate overflow-clip bg-surface-light-100 py-section-padding text-text-on-light-primary">
      <div className="flex flex-col items-center gap-y-8 text-center">
        <SvgStars className="text-text-accent-on-light" />
        <h2 className="typography-heading-1">{title}</h2>
      </div>

      {features.length > 0 && (
        <motion.div
          className="my-16 grid grid-cols-1 gap-4 sm:my-14 sm:grid-cols-2 lg:grid-cols-3"
          variants={featureGridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.key} feature={feature} />
          ))}
        </motion.div>
      )}

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start">
        {stickerText && <AstronautSticker>{stickerText}</AstronautSticker>}
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

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <motion.article
      className="bg-(image:--background-image) relative flex h-[365px] flex-col overflow-clip rounded-xl border border-gray-100 bg-center bg-cover bg-surface-light-200 bg-no-repeat p-6"
      style={
        {
          "--background-image": feature.image ? `url(${feature.image})` : undefined,
        } as React.CSSProperties
      }
      variants={fadeInBottomToTopVariants}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-[15deg] from-20% from-surface-light-200 to-80% to-transparent" />
      <div className="z-10 flex items-center gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="size-0.5 shrink-0 rounded-full bg-current" />
        ))}
        <div className="flex-1 border-t border-t-current" />
        {feature.icon && (
          <img src={feature.icon} width={50} height={50} alt="" className="size-12.5 shrink-0" />
        )}
      </div>
      <div className="z-10 mt-auto space-y-2">
        <p className="typography-heading-5">{feature.titleStart}</p>
        <h3 className="typography-heading-2">{feature.titleEnd}</h3>
      </div>
      {feature.description && (
        <p className="typography-meta z-10 mt-2 text-text-on-light-secondary">
          {feature.description}
        </p>
      )}
    </motion.article>
  );
}
