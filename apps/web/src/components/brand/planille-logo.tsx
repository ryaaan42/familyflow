import { cn } from "@/lib/utils";

interface PlanilleLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function PlanilleLogo({ className, markClassName, textClassName, showText = true }: PlanilleLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#1e1b4b_0%,#3559e6_42%,#6D5EF4_72%,#00a9ff_100%)] shadow-[0_10px_24px_rgba(53,89,230,0.35)]",
          markClassName
        )}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 text-white" fill="none">
          <path d="M4 10.4 12 4l8 6.4V20a.9.9 0 0 1-.9.9h-4.7V14h-5v6.9H4.9A.9.9 0 0 1 4 20v-9.6Z" fill="currentColor" opacity=".92" />
          <path d="M8.4 7.6h7.2" stroke="currentColor" strokeOpacity=".62" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
      {showText ? <span className={cn("text-sm font-black tracking-tight text-[var(--foreground)]", textClassName)}>PLANILLE</span> : null}
    </span>
  );
}
