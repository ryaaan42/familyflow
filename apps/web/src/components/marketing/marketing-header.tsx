import Link from "next/link";
import { Sparkles, House } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/50 bg-[rgba(255,250,246,0.82)] px-5 py-3 backdrop-blur xl:px-8">
      <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(109,94,244,0.12)] text-[var(--brand-primary)]">
          <House className="h-5 w-5" />
        </span>
        FamilyFlow
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-[var(--foreground-muted)] md:flex">
        <Link href="#fonctionnalites">Fonctionnalites</Link>
        <Link href="#modules">Modules</Link>
        <Link href="#temoignages">Temoignages</Link>
        <Link href="#faq">FAQ</Link>
      </nav>
      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild>
          <Link href="/auth/sign-in">Connexion</Link>
        </Button>
        <Button asChild>
          <Link href="/app">
            <Sparkles className="mr-2 h-4 w-4" />
            Ouvrir la demo
          </Link>
        </Button>
      </div>
    </header>
  );
}

