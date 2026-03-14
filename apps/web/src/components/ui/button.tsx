import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#4f46e5_0%,#6366f1_45%,#0ea5e9_100%)] text-white! shadow-[0_12px_28px_rgba(79,70,229,0.38)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(79,70,229,0.48)]",
        secondary:
          "border border-[#e0e7ff] bg-white text-[#0f0e1a]! shadow-[0_4px_16px_rgba(79,70,229,0.07)] hover:-translate-y-0.5 hover:bg-[#f5f3ff] hover:border-[#c4b5fd]",
        ghost:
          "text-[#4b5563]! hover:bg-[rgba(99,102,241,0.07)] hover:text-[#4f46e5]!",
        outline:
          "border border-[#e0e7ff] bg-[rgba(255,255,255,0.7)] text-[#0f0e1a]! backdrop-blur hover:bg-white/90 hover:border-[#a5b4fc]",
        danger:
          "bg-[linear-gradient(135deg,#f43f5e,#fb7185)] text-white! shadow-[0_8px_24px_rgba(244,63,94,0.3)] hover:-translate-y-0.5",
        success:
          "bg-[linear-gradient(135deg,#059669,#10b981)] text-white! shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:-translate-y-0.5",
        violet:
          "bg-[linear-gradient(135deg,#7c3aed,#a855f7)] text-white! shadow-[0_8px_24px_rgba(124,58,237,0.35)] hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-5",
        sm:      "h-8 px-3.5 text-xs",
        lg:      "h-12 px-7 text-base",
        icon:    "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
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
    const hasWhiteBackground = typeof className === "string" && /\bbg-white(?:\b|\/)/.test(className);
    const hasExplicitTextColor = typeof className === "string" && /\btext-/.test(className);

    return <Comp className={cn(buttonVariants({ variant, size, className }), hasWhiteBackground && !hasExplicitTextColor ? "text-[#0f0e1a]" : undefined)} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
