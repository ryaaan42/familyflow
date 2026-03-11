import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,rgba(109,94,244,0.18),rgba(74,142,255,0.08))] text-[var(--brand-primary)]",
        coral:
          "bg-[linear-gradient(135deg,rgba(255,126,107,0.2),rgba(255,191,90,0.12))] text-[var(--brand-coral)]",
        mint:
          "bg-[linear-gradient(135deg,rgba(86,199,161,0.22),rgba(58,176,255,0.08))] text-[var(--brand-mint-strong)]",
        yellow:
          "bg-[linear-gradient(135deg,rgba(255,191,90,0.24),rgba(255,126,107,0.1))] text-[var(--brand-yellow-strong)]",
        outline: "border border-[var(--border)] bg-white/70 text-[var(--foreground-muted)]"
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
