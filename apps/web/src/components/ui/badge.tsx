import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-[rgba(99,102,241,0.12)] text-[#4f46e5] ring-1 ring-[rgba(99,102,241,0.2)]",
        coral:
          "bg-[rgba(244,63,94,0.12)] text-[#f43f5e] ring-1 ring-[rgba(244,63,94,0.2)]",
        mint:
          "bg-[rgba(16,185,129,0.13)] text-[#059669] ring-1 ring-[rgba(16,185,129,0.22)]",
        yellow:
          "bg-[rgba(245,158,11,0.14)] text-[#b45309] ring-1 ring-[rgba(245,158,11,0.24)]",
        violet:
          "bg-[rgba(124,58,237,0.12)] text-[#7c3aed] ring-1 ring-[rgba(124,58,237,0.2)]",
        blue:
          "bg-[rgba(14,165,233,0.12)] text-[#0284c7] ring-1 ring-[rgba(14,165,233,0.2)]",
        pink:
          "bg-[rgba(236,72,153,0.12)] text-[#db2777] ring-1 ring-[rgba(236,72,153,0.2)]",
        orange:
          "bg-[rgba(249,115,22,0.12)] text-[#ea580c] ring-1 ring-[rgba(249,115,22,0.2)]",
        outline:
          "border border-[#e0e7ff] bg-white/80 text-[var(--foreground-muted)]",
        white:
          "bg-white/20 text-white ring-1 ring-white/30",
        dark:
          "bg-[rgba(15,14,26,0.08)] text-[var(--foreground)] ring-1 ring-[rgba(15,14,26,0.08)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
