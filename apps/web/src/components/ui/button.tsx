import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#6757f6_0%,#3c8df6_48%,#f56397_100%)] text-white shadow-[0_18px_42px_rgba(81,104,241,0.34)] hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(81,104,241,0.42)]",
        secondary:
          "border border-white/70 bg-white/88 text-[var(--foreground)] shadow-[0_10px_30px_rgba(30,24,77,0.08)] hover:-translate-y-0.5 hover:bg-white",
        ghost: "text-[var(--foreground-muted)] hover:bg-white/80",
        outline:
          "border border-white/70 bg-white/35 text-[var(--foreground)] backdrop-blur hover:bg-white/70"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-7 text-base"
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
