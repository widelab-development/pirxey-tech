"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  cn(
    "group/button typography-link transform-3d relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full border bg-clip-padding outline-none transition-all focus-visible:border-2 focus-visible:border-dark-300 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
    "mb-2 ml-2 h-13.5 min-w-55 gap-2 px-6 py-4 hover:-translate-x-2 hover:translate-y-2",
    "before:-translate-z-1 before:absolute before:-inset-0.25 before:-z-1 before:-translate-x-2 before:translate-y-2 before:rounded-full before:border before:transition-all before:content-[''] hover:before:translate-x-0 hover:before:translate-y-0 focus-visible:before:border-2 focus-visible:before:border-dark-300",
    "after:absolute after:inset-0 after:-bottom-2 after:-left-2 after:-z-1 after:rounded-full after:bg-transparent after:content-[''] hover:after:translate-x-2 hover:after:-translate-y-2"
  ),
  {
    variants: {
      variant: {
        default:
          "border-accent-primary bg-accent-primary text-text-on-dark-primary before:border-accent-primary hover:border-accent-primary-hover hover:bg-accent-primary-hover active:border-accent-primary-muted active:bg-accent-primary-muted",
        secondary:
          "border-surface-dark-100 bg-surface-dark-100 text-text-on-dark-primary before:border-surface-dark-100 hover:border-surface-dark-200 hover:bg-surface-dark-200 active:border-surface-dark-300 active:bg-surface-dark-300 aria-expanded:border-surface-dark-300 aria-expanded:bg-surface-dark-300",
        outline:
          "border-dark-300 bg-surface-light-100 text-text-on-light-primary before:border-dark-300 hover:border-dark-400 active:border-dark-500",
        inverted:
          "border-surface-light-200 bg-surface-light-100 text-text-on-light-primary before:border-surface-light-200 focus-visible:border-surface-light-200 focus-visible:before:border-surface-light-200",
        ghost:
          "border-transparent bg-transparent text-text-on-light-primary before:hidden hover:bg-surface-light-200 active:bg-surface-light-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
