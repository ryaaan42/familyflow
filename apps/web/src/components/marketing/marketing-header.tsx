import Link from "next/link";
import { Sparkles } from "lucide-react";

import { PlanilleLogo } from "@/components/brand/planille-logo";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/60 bg-white/80 px-5 py-3 shadow-[0_4px_24px_rgba(24,53,123,0.08)] backdrop-blur-xl xl:px-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 text-sm font-bold tracking-tight">
        <PlanilleLogo />
        <span className="hidden rounded-full bg-[rgba(46,197,161,0.18)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--brand-mint-strong)] sm:inline">
          Beta
        </span>
      </Link>

      {/* Nav */}
      <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--foreground-muted)] md:flex">
        {[
          { href: "#fonctionnalites", label: "Fonctionnalités" },
          { href: "#modules", label: "Modules" },
          { href: "#temoignages", label: "Témoignages" },
          { href: "#faq", label: "FAQ" }
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative transition hover:text-[var(--foreground)] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[var(--brand-primary)] after:transition-all hover:after:w-full"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* CTAs */}
      <div className="flex items-center gap-2.5">
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
          <Link href="/auth/sign-in">Connexion</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/app">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Essayer gratuitement
          </Link>
        </Button>
      </div>
    </header>
  );
}
