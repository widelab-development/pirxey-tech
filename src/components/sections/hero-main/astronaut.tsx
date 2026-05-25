"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

type AstronautProps = React.ComponentProps<"div"> & {
  zoomIn?: boolean;
};

/**
 * Astronaut illustration with parallax mouse-tracking and float animation.
 * Ported 1:1 from pirxey-website-nextjs/src/sanity/components/blocks/hero-main/astronaut.tsx.
 *
 * Differences vs Next.js original:
 *  - <Image> → plain <img> (no Next.js Image optimization yet; can add astro:assets later)
 *  - same Framer Motion springs, transforms, and animation timing
 */
export function Astronaut({
  className,
  zoomIn = false,
  ...props
}: AstronautProps) {
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 70, damping: 20, mass: 0.35 });
  const smoothY = useSpring(mouseY, { stiffness: 70, damping: 20, mass: 0.35 });

  const moonX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const moonY = useTransform(smoothY, [-0.5, 0.5], [8, 20]);
  const astronautX = useTransform(smoothX, [-0.5, 0.5], [-36, 36]);
  const astronautY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      const normalizedX = event.clientX / window.innerWidth - 0.5;
      const normalizedY = event.clientY / window.innerHeight - 0.5;

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, shouldReduceMotion]);

  return (
    <div
      data-column="edge"
      className={cn(
        "pointer-events-none isolate z-0 h-[65%] opacity-30 max-sm:hidden lg:h-[80%] lg:opacity-100 xl:h-[90%]",
        styles.astronautWrapper,
        className
      )}
      {...props}
    >
      <motion.img
        className={cn(
          "absolute inset-0 z-0 h-full w-full transition-all duration-750",
          !shouldReduceMotion && zoomIn && "blur-xs"
        )}
        src="/assets/images/area-moon.webp"
        width={1165}
        height={813}
        alt=""
        style={
          shouldReduceMotion
            ? undefined
            : {
                x: moonX,
                y: moonY,
              }
        }
      />
      <div
        className={cn(
          "relative z-10 h-full transition-transform duration-1000",
          !shouldReduceMotion && zoomIn && "-translate-x-8 scale-105",
          styles.astronaut
        )}
      >
        <motion.img
          className={cn("h-full w-auto")}
          src="/assets/images/area-astronaut.webp"
          width={1165}
          height={813}
          alt=""
          style={
            shouldReduceMotion
              ? undefined
              : {
                  x: astronautX,
                  y: astronautY,
                }
          }
        />
      </div>
    </div>
  );
}
