import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full rounded-2xl border border-[#d6e2ff] bg-[rgba(255,255,255,0.94)] px-4 py-3 text-sm shadow-[0_8px_22px_rgba(24,53,123,0.05)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[rgba(53,89,230,0.14)]",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
