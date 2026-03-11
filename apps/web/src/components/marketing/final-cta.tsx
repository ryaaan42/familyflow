import Link from "next/link";
import { ArrowUpRight, Layers3, Orbit, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function FinalCta() {
  return (
    <section className="py-10 md:py-16">
      <Card className="relative overflow-hidden border-white/50 bg-[linear-gradient(135deg,#6558f5_0%,#4a8eff_38%,#41bfd8_66%,#56c7a1_100%)] text-white shadow-[0_48px_140px_rgba(74,142,255,0.24)]">
        <div className="orb left-10 top-10 h-28 w-28 bg-[rgba(255,255,255,0.22)]" />
        <div className="orb bottom-8 right-10 h-36 w-36 bg-[rgba(255,126,107,0.24)]" />
        <div className="relative z-10 grid gap-10 p-8 md:p-12 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div className="space-y-6">
            <Badge className="w-fit border border-white/18 bg-white/18 text-white">
              Code name: FamilyFlow
            </Badge>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.05em] md:text-6xl">
                Une base plus riche, plus coloree et vraiment prete a impressionner.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-white/82">
                Web sur Vercel, mobile via Expo/EAS, backend sur Supabase. La V1 pose une vraie
                fondation produit avec une direction artistique plus forte et plus vivante.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-base font-semibold text-[var(--foreground)] shadow-[0_24px_40px_rgba(20,18,52,0.2)] transition hover:translate-y-[-1px]"
              >
                Ouvrir l'application
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <div className="rounded-full border border-white/28 bg-white/12 px-5 py-4 text-sm font-medium text-white/88 backdrop-blur">
                Design premium colore + effets de profondeur
              </div>
            </div>
          </div>

          <div className="panel-3d relative mx-auto flex w-full max-w-[520px] justify-center [perspective:1800px]">
            <div className="relative z-10 w-full rounded-[36px] border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.1))] p-5 shadow-[0_36px_90px_rgba(22,21,63,0.28)] backdrop-blur-[18px] [transform:rotateY(-14deg)_rotateX(8deg)]">
              <div className="grid gap-4">
                <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,247,241,0.68))] p-5 text-[var(--foreground)] shadow-[0_20px_42px_rgba(22,21,63,0.12)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--foreground-muted)]">Experience</p>
                      <p className="mt-2 text-2xl font-semibold">Landing plus expressive</p>
                    </div>
                    <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                      <Layers3 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[26px] bg-[linear-gradient(135deg,rgba(255,126,107,0.22),rgba(255,255,255,0.74))] p-5 text-[var(--foreground)] shadow-[0_18px_34px_rgba(255,126,107,0.16)]">
                    <Orbit className="h-5 w-5 text-[var(--brand-coral)]" />
                    <p className="mt-4 text-lg font-semibold">Profondeur 3D</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                      Cartes inclinees, couches lumineuses, volumes plus nets.
                    </p>
                  </div>
                  <div className="rounded-[26px] bg-[linear-gradient(135deg,rgba(86,199,161,0.22),rgba(255,255,255,0.74))] p-5 text-[var(--foreground)] shadow-[0_18px_34px_rgba(86,199,161,0.16)]">
                    <Sparkles className="h-5 w-5 text-[var(--brand-mint-strong)]" />
                    <p className="mt-4 text-lg font-semibold">Couleurs plus franches</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                      Palette plus vivante, plus joyeuse, plus startup premium.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
