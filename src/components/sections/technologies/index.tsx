"use client";

import { motion, stagger } from "motion/react";
import { SvgStars } from "@/components/svg/svg-stars";
import {
  defaultViewport,
  fadeInBottomToTopVariants,
  revealTextBottomToTopVariants,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

/**
 * Technologies — "Technologies we use" section.
 * Faithful port of pirxey-website-nextjs Sanity block.
 * Background image: two-astronauts-on-moon.webp (positioned per-breakpoint via styles.module.css).
 */

export type TechItem = {
  key: string;
  name: string;
  icon: string;
};

export type TechnologiesProps = {
  eyebrow?: string;
  title: string;
  technologies: TechItem[];
};

const iconGridVariants = {
  hidden: {},
  visible: {
    transition: { delayChildren: stagger(0.08) },
  },
};

export function Technologies({ eyebrow, title, technologies }: TechnologiesProps) {
  return (
    <section
      className={cn(
        "dark grid-container py-section-padding text-text-on-dark-primary",
        styles.background
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-y-8 text-center">
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
        <SvgStars className="text-text-accent-on-light" />
      </div>

      {technologies.length > 0 && (
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-8 lg:gap-y-12"
          variants={iconGridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {technologies.map((tech) => (
            <motion.div
              key={tech.key}
              className="flex flex-col items-center gap-3 shrink-0"
              variants={fadeInBottomToTopVariants}
            >
              {/* Icon — falls back to monogram tile if SVG path doesn't resolve */}
              <div className="size-12 lg:size-16 rounded-xl border border-border-on-dark-subtle bg-surface-dark-200/60 backdrop-blur flex items-center justify-center transition-colors hover:border-border-on-dark">
                <img
                  src={tech.icon}
                  width={48}
                  height={48}
                  alt={tech.name}
                  className="size-8 lg:size-10 object-contain"
                  onError={(e) => {
                    // If icon SVG missing, show monogram instead
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".tech-monogram")) {
                      const span = document.createElement("span");
                      span.className = "tech-monogram typography-heading-5 text-text-accent-on-dark";
                      span.textContent = tech.name.slice(0, 2);
                      parent.appendChild(span);
                    }
                  }}
                />
              </div>
              <span className="typography-meta opacity-80 whitespace-nowrap">{tech.name}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
