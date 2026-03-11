import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#7c3aed_0%,#a855f7_45%,#ec4899_100%)] text-white shadow-[0_8px_24px_rgba(124,58,237,0.32)] hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(124,58,237,0.42)]",
        secondary:
          "border border-[var(--border)] bg-white text-[var(--foreground)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[var(--background-panel)]",
        ghost:
          "text-[var(--foreground-muted)] hover:bg-[var(--card-muted)]",
        outline:
          "border border-white/40 bg-white/20 text-white backdrop-blur hover:bg-white/30"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-sm",
        lg: "h-13 px-7 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
