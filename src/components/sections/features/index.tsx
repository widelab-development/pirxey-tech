"use client";

import Autoplay from "embla-carousel-autoplay";
import { motion, stagger, type Variants } from "motion/react";
import { AstronautSticker } from "@/components/astronaut-sticker";
import { SvgArrow } from "@/components/svg/svg-arrow";
import { SvgStars } from "@/components/svg/svg-stars";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import {
  defaultViewport,
  fadeInBottomToTopVariants,
  revealTextBottomToTopVariants,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Features — dark "Here's how we can help you" 3-col grid (lg+) / carousel (mobile).
 * Faithful port of pirxey-website-nextjs Sanity block (carousel pagination + autoplay button stripped — not core to homepage UX).
 */

export type FeatureItem = {
  key: string;
  title: string;
  text: string;
  icon?: string;
  href?: string;
};

export type FeaturesProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  features: FeatureItem[];
  stickerText?: React.ReactNode;
  cta?: { text: string; href: string };
};

const featureGridVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: stagger(0.1) } },
};

export function Features({ id = "features", eyebrow, title, features, stickerText, cta }: FeaturesProps) {
  return (
    <section
      id={id}
      className="dark grid-container max-xl:grid-container-gutter-content-0 xl:grid-container-gutter-content-19 overflow-x-clip py-section-padding text-text-on-dark-primary"
    >
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        {eyebrow && (
          <p className="overflow-clip">
            <motion.span
              className="block typography-label uppercase tracking-wider opacity-70"
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              variants={revealTextBottomToTopVariants}
            >
              {eyebrow}
            </motion.span>
          </p>
        )}
        <h2 className="typography-heading-1 overflow-clip">
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
        <SvgStars className="mx-auto text-accent-primary" />
      </div>

      {features.length > 0 && (
        <>
          {/* Desktop: 3-col grid */}
          <motion.div
            data-column="content"
            className="mt-8 hidden grid-cols-1 gap-x-20 gap-y-10 lg:grid lg:grid-cols-3"
            variants={featureGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
          >
            {features.map((feature) => (
              <FeatureCard key={feature.key} data={feature} />
            ))}
          </motion.div>

          {/* Mobile: carousel */}
          <Carousel
            className="*:data-[slot='carousel-content']:overflow-visible! mt-18 lg:hidden"
            opts={{
              align: "center",
              loop: true,
              startIndex: features.length > 1 ? 1 : 0,
            }}
            plugins={[Autoplay({ delay: 5000 })]}
          >
            <CarouselContent className="-ml-4">
              {features.map((feature) => (
                <CarouselItem key={feature.key} className="basis-[310px] pl-4">
                  <FeatureCard data={feature} className="h-full" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </>
      )}

      <div className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start">
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

function FeatureCard({
  data,
  className,
}: {
  data: FeatureItem;
  className?: string;
}) {
  const inner = (
    <motion.div
      className={cn(
        "group flex flex-col justify-center gap-y-2 rounded-[12px] border border-surface-light-100 px-6 pt-12 pb-6 max-lg:text-center lg:px-6 lg:py-6 lg:ps-12 transition-colors hover:border-accent-primary",
        className
      )}
      variants={fadeInBottomToTopVariants}
    >
      {data.icon && (
        <div className="mb-2">
          <img src={data.icon} width={60} height={60} alt="" />
        </div>
      )}
      <h3 className="typography-heading-4">{data.title}</h3>
      <p className="typography-body">{data.text}</p>
    </motion.div>
  );
  return data.href ? (
    <a href={data.href} className="block h-full">
      {inner}
    </a>
  ) : (
    inner
  );
}
