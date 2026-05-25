"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type AstronautStickerProps = React.ComponentProps<"div">;

function AstronautStickerBase({
  className,
  children,
  ...props
}: AstronautStickerProps) {
  return (
    <div
      className={cn(
        "bg-(image:--bg-pastel) sticker-float inline-flex items-center gap-2 rounded-full bg-cover py-2 ps-1 pe-6",
        className
      )}
      {...props}
    >
      <img
        className="size-10 shrink-0 rounded-full"
        src="/assets/images/astronaut-icon.png"
        width={42}
        height={40}
        alt="Pirx"
      />
      <div className="typography-caption flex-1 text-text-on-light-primary">
        {children}
      </div>
    </div>
  );
}

export const AstronautSticker = motion.create(AstronautStickerBase, {
  forwardMotionProps: true,
});
