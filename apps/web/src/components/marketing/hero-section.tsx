"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarRange,
  Coins,
  PawPrint,
  PiggyBank,
  Sparkles,
  Star
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const floating = [
  { label: "Routine du soir", value: "+18 min gagnees", className: "-left-4 top-8" },
  { label: "Budget optimise", value: "340 EUR / mois", className: "-right-6 top-[4.5rem]" },
  { label: "Animaux", value: "Moka + Lune", className: "left-14 bottom-4" }
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-14">
      <div className="orb left-[4%] top-8 h-32 w-32 bg-[rgba(109,94,244,0.26)]" />
      <div className="orb right-[8%] top-28 h-44 w-44 bg-[rgba(58,176,255,0.22)]" />
      <div className="orb bottom-6 left-[36%] h-28 w-28 bg-[rgba(255,126,107,0.2)]" />
      <div className="absolute inset-x-0 top-[-200px] h-[520px] rounded-full bg-[radial-gradient(circle,_rgba(109,94,244,0.18),_transparent_62%)]" />
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <Badge variant="mint" className="w-fit">
            Organisation familiale premium, budget inclus
          </Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--foreground)] md:text-7xl">
              Mieux repartir les taches, mieux gerer le budget, mieux vivre{" "}
              <span className="font-serif italic text-gradient">ensemble</span>.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--foreground-muted)]">
              FamilyFlow aide les foyers a planifier les routines, distribuer les taches
              intelligemment, suivre les depenses et transformer les mauvaises habitudes en
              economies visibles.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/app">
                Voir la V1
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#modules">Explorer les modules</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="mesh-card p-5">
              <CalendarRange className="mb-3 h-5 w-5 text-[var(--brand-primary)]" />
              <p className="font-semibold">Taches adaptees</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Roles, ages, animaux, logement et disponibilites.
              </p>
            </Card>
            <Card className="mesh-card p-5">
              <Coins className="mb-3 h-5 w-5 text-[var(--brand-coral)]" />
              <p className="font-semibold">Budget relie aux routines</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Depenses evitables, projections 3/6/12 mois.
              </p>
            </Card>
            <Card className="mesh-card p-5">
              <Sparkles className="mb-3 h-5 w-5 text-[var(--brand-mint-strong)]" />
              <p className="font-semibold">Exports PDF premium</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Planning frigo, budget mensuel, tableaux enfants.
              </p>
            </Card>
          </div>
        </div>

        <div className="panel-3d relative mx-auto flex w-full max-w-[610px] justify-center [perspective:2000px]">
          {floating.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * index }}
              className={`absolute hidden rounded-3xl border border-white/60 bg-white/85 px-4 py-3 shadow-[0_26px_40px_rgba(57,47,133,0.14)] backdrop-blur md:block ${item.className}`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full rounded-[44px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,243,0.9))] p-5 shadow-[0_48px_120px_rgba(109,94,244,0.22)] [transform:rotateY(-10deg)_rotateX(6deg)]"
          >
            <div className="rounded-[34px] bg-[linear-gradient(180deg,#fff,#fff7f1)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className="flex items-center justify-between rounded-3xl bg-[linear-gradient(135deg,#6D5EF4,#4A8EFF_50%,#56C7A1)] px-5 py-4 text-white shadow-[0_24px_50px_rgba(77,108,240,0.32)]">
                <div>
                  <p className="text-sm opacity-80">Famille Martin</p>
                  <p className="text-xl font-semibold">82 % des taches completees</p>
                </div>
                <div className="rounded-full bg-white/18 px-3 py-2 text-sm font-medium">
                  Score +9
                </div>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[linear-gradient(180deg,rgba(109,94,244,0.12),rgba(109,94,244,0.04))] p-4 shadow-[0_18px_32px_rgba(109,94,244,0.08)]">
                    <p className="text-sm text-[var(--foreground-muted)]">Aujourd'hui</p>
                    <p className="mt-2 text-xl font-semibold">8 taches planifiees</p>
                    <div className="mt-3 h-2 rounded-full bg-white">
                      <div className="h-2 w-[76%] rounded-full bg-[var(--brand-primary)]" />
                    </div>
                  </div>
                  <div className="rounded-3xl bg-[linear-gradient(180deg,rgba(255,126,107,0.14),rgba(255,191,90,0.08))] p-4 shadow-[0_18px_32px_rgba(255,126,107,0.1)]">
                    <p className="text-sm text-[var(--foreground-muted)]">Economies</p>
                    <p className="mt-2 text-xl font-semibold">342 EUR / mois</p>
                    <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                      grace au meal prep et a la meilleure repartition
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-white p-4 shadow-[0_20px_38px_rgba(24,19,41,0.06)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--foreground-muted)]">Taches animaux</p>
                      <p className="text-lg font-semibold">Promener Moka</p>
                    </div>
                    <div className="rounded-full bg-[rgba(86,199,161,0.16)] p-3 text-[var(--brand-mint-strong)]">
                      <PawPrint className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {["Lea", "Lucas", "Emma"].map((name, index) => (
                      <div
                        key={name}
                        className="rounded-2xl bg-[linear-gradient(180deg,#f7f3ff,#fff)] px-3 py-3 text-sm shadow-[0_12px_26px_rgba(109,94,244,0.06)]"
                      >
                        <p className="font-medium">{name}</p>
                        <p className="text-[var(--foreground-muted)]">
                          {index === 0 ? "Assignee" : index === 1 ? "Lessive" : "Budget"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(86,199,161,0.16),rgba(255,255,255,0.86))] p-4 shadow-[0_20px_38px_rgba(86,199,161,0.12)]">
                    <div className="flex items-center gap-2 text-[var(--brand-mint-strong)]">
                      <Star className="h-4 w-4" />
                      <p className="text-sm font-semibold">Challenge famille</p>
                    </div>
                    <p className="mt-3 text-xl font-semibold">Zero depense inutile</p>
                    <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                      3 habitudes deja sous controle cette semaine.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(58,176,255,0.18),rgba(255,255,255,0.92))] p-4 shadow-[0_20px_38px_rgba(58,176,255,0.12)]">
                    <div className="flex items-center gap-2 text-[var(--brand-primary)]">
                      <PiggyBank className="h-4 w-4" />
                      <p className="text-sm font-semibold">Projection 12 mois</p>
                    </div>
                    <p className="mt-3 text-xl font-semibold">4 104 EUR</p>
                    <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                      si les routines repas restent stabilisees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
