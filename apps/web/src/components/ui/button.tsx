import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#3559e6_0%,#00a9ff_58%,#2ec5a1_100%)] text-white shadow-[0_16px_34px_rgba(53,89,230,0.34)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(53,89,230,0.42)]",
        secondary:
          "border border-[#d7e4ff] bg-white !text-[#0f1832] shadow-[0_8px_24px_rgba(24,53,123,0.08)] hover:-translate-y-0.5 hover:bg-[#f7faff]",
        ghost: "!text-[#4f5d80] hover:bg-white/80",
        outline:
          "border border-[#d7e4ff] bg-[rgba(255,255,255,0.65)] !text-[#0f1832] backdrop-blur hover:bg-white/90"
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
