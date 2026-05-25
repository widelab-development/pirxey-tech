"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import { motion, stagger, type Variants } from "motion/react";
import { memo, useMemo } from "react";
import { AstronautSticker } from "@/components/astronaut-sticker";
import { SvgArrow } from "@/components/svg/svg-arrow";
import { SvgGlobes } from "@/components/svg/svg-globes";
import { SvgShape } from "@/components/svg/svg-shape";
import { SvgStars } from "@/components/svg/svg-stars";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { defaultViewport } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

/**
 * Clients — "We developed software for" section.
 * Faithful port of pirxey-website-nextjs/src/sanity/components/blocks/clients.
 *
 * Visual moves preserved:
 *  - Light cream surface with decor-left + blur halo backgrounds
 *  - SvgStars decoration above title
 *  - 3 horizontal carousel rows, each auto-scrolling at slightly different speeds
 *  - Each card: name + clientType (Enterprise/Scale-up/Start-up colored bar) + projectType
 *  - 3D hover effect on cards with external website link
 *  - AstronautSticker + CTA button at bottom
 *  - SvgGlobes/SvgShape side decorations
 */

export type Client = {
  key: string;
  name: string;
  clientType: "Enterprise" | "Scale-up" | "Start-up";
  projectType: string;
  websiteUrl?: string;
  logo?: string;
};

export type ClientsProps = {
  title: string;
  stickerText?: React.ReactNode;
  cta?: { text: string; href: string };
  clients: Client[];
};

const carouselRowsVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: stagger(0.2, { startDelay: 0.25 }) },
  },
};

const ROWS_AMOUNT = 3;
const ROWS_SPEED = [0.6, 0.4, 0.45] as const;

export function Clients({ title, stickerText, cta, clients }: ClientsProps) {
  const rows = useMemo(() => {
    const sorted = clients.slice().sort((a, b) => a.name.localeCompare(b.name));
    return Array.from({ length: ROWS_AMOUNT }, (_, i) => {
      const row = sorted.filter((_, idx) => idx % ROWS_AMOUNT === i);
      return [...row, ...row, ...row]; // triple-loop for seamless infinite scroll
    });
  }, [clients]);

  return (
    <section
      className={cn(
        "grid-container clip-corners-4 relative isolate overflow-clip bg-surface-light-100 py-section-padding text-text-on-light-primary",
        styles.surface
      )}
    >
      <div data-column="full-width" className="flex flex-col items-center gap-y-8 text-center">
        <SvgStars className="text-text-accent-on-light" />
        <h2 className="typography-heading-1">{title}</h2>
      </div>

      {clients.length > 0 && (
        <motion.section
          data-column="full-bleed"
          className="my-16 space-y-6 py-19 lg:my-14"
          variants={carouselRowsVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {rows.map((row, idx) => (
            <SingleRow key={idx} clients={row} speed={ROWS_SPEED[idx]} />
          ))}
        </motion.section>
      )}

      <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-start">
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
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between text-gray-400 max-lg:hidden">
          <SvgGlobes className="w-12.5" />
          <SvgShape className="size-18" />
        </div>
      </div>
    </section>
  );
}

const SingleRow = memo(function SingleRow({
  clients,
  speed = 1,
}: {
  clients: Client[];
  speed?: number;
}) {
  return (
    <Carousel
      className="*:data-[slot='carousel-content']:overflow-visible!"
      opts={{
        align: "center",
        dragFree: true,
        loop: true,
        startIndex: 4 < clients.length ? 3 : 0,
      }}
      plugins={[
        AutoScroll({
          playOnInit: true,
          speed,
          startDelay: 0,
          stopOnMouseEnter: true,
          stopOnInteraction: false,
        }),
      ]}
    >
      <CarouselContent className="-ml-6">
        {clients.map((client, idx) => (
          <CarouselItem className="basis-auto pl-6" key={`${client.key}-${idx}`}>
            <ClientCard client={client} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
});

const ClientCard = memo(function ClientCard({ client }: { client: Client }) {
  const { clientType, logo, name, projectType, websiteUrl } = client;
  const Element = websiteUrl ? "a" : "div";

  return (
    <Element
      {...(websiteUrl
        ? {
            href: websiteUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": `Visit ${name} website`,
          }
        : {})}
      className={cn(
        "relative inline-flex h-32 gap-6 rounded-xl border border-gray-100 bg-white p-6 pb-4 transition-all",
        "before:absolute before:top-6.75 before:right-2 before:-bottom-2.25 before:-left-2 before:-z-1 before:rounded-xl before:border before:border-gray-100 before:transition-all before:content-['']",
        websiteUrl &&
          "group transform-3d before:-translate-z-1 hover:before:-translate-z-1 after:absolute after:inset-0 after:bg-transparent after:content-[''] hover:-translate-x-2 hover:translate-y-2.25 hover:border-orange-100 hover:after:translate-x-2 hover:after:-translate-y-2.25 hover:before:translate-x-2 hover:before:-translate-y-2.25 hover:before:border-orange-100"
      )}
    >
      <div className="flex flex-col justify-center gap-2">
        <h3 className="typography-heading-4 whitespace-nowrap transition-colors group-hover:text-text-accent-on-light">
          {name}
        </h3>
        <div className="typography-meta flex items-center gap-2 text-text-on-light-secondary">
          <div
            className={cn("h-4.75 w-3.5", {
              "bg-accent-secondary": clientType === "Enterprise",
              "bg-accent-primary": clientType === "Scale-up",
              "bg-success": clientType === "Start-up",
            })}
          />
          {clientType}
          &middot;
          {projectType}
        </div>
      </div>
      {logo && (
        <div className="inline-flex shrink-0 basis-30 items-center justify-center">
          <img
            src={logo}
            width={120}
            height={87}
            alt={name}
            className="object-contain max-h-full"
          />
        </div>
      )}
    </Element>
  );
});
