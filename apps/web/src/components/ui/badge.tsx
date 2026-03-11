import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-[rgba(109,94,244,0.12)] text-[var(--brand-primary)]",
        coral: "bg-[rgba(255,126,107,0.14)] text-[var(--brand-coral)]",
        mint: "bg-[rgba(86,199,161,0.18)] text-[var(--brand-mint-strong)]",
        yellow: "bg-[rgba(255,191,90,0.22)] text-[var(--brand-yellow-strong)]",
        outline: "border border-[var(--border)] text-[var(--foreground-muted)]"
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
