import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm shadow-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[rgba(109,94,244,0.14)]",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

