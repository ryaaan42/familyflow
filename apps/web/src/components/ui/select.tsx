import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full appearance-none rounded-2xl border border-[#d6e2ff] bg-[rgba(255,255,255,0.94)] px-4 py-2 pr-10 text-sm shadow-[0_8px_22px_rgba(24,53,123,0.05)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[rgba(53,89,230,0.14)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
    </div>
  )
);

Select.displayName = "Select";
