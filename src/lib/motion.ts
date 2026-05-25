import type { Variants, ViewportOptions } from "motion/react";

export const defaultViewport: ViewportOptions = {
  once: true,
  margin: "-10%",
};

export const fadeInBottomToTopVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const fadeInBlurBottomToTopVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3 } },
};

export const revealTextContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.1, staggerChildren: 0.06 } },
};

export const revealTextBottomToTopVariants: Variants = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
};
