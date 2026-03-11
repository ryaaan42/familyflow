import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,rgba(53,89,230,0.18),rgba(0,169,255,0.1))] text-[var(--brand-primary)]",
        coral:
          "bg-[linear-gradient(135deg,rgba(242,95,140,0.2),rgba(255,202,78,0.14))] text-[var(--brand-coral)]",
        mint:
          "bg-[linear-gradient(135deg,rgba(46,197,161,0.22),rgba(0,169,255,0.1))] text-[var(--brand-mint-strong)]",
        yellow:
          "bg-[linear-gradient(135deg,rgba(255,202,78,0.26),rgba(242,95,140,0.12))] text-[var(--brand-yellow-strong)]",
        outline: "border border-[#d6e2ff] bg-white/84 text-[var(--foreground-muted)]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
