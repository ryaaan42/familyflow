"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarRange, Coins, PawPrint, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const floating = [
  { label: "Routine du soir", value: "+18 min gagnees", className: "left-0 top-8" },
  { label: "Budget optimise", value: "340 EUR / mois", className: "right-0 top-[4.5rem]" },
  { label: "Animaux", value: "Moka + Lune", className: "left-10 bottom-4" }
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-14">
      <div className="absolute inset-x-0 top-[-200px] h-[520px] rounded-full bg-[radial-gradient(circle,_rgba(109,94,244,0.18),_transparent_62%)]" />
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <Badge variant="mint" className="w-fit">
            Organisation familiale premium, budget inclus
          </Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--foreground)] md:text-7xl">
              Mieux repartir les taches, mieux gerer le budget, mieux vivre{" "}
              <span className="font-serif italic text-[var(--brand-coral)]">ensemble</span>.
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
            <Card className="p-5">
              <CalendarRange className="mb-3 h-5 w-5 text-[var(--brand-primary)]" />
              <p className="font-semibold">Taches adaptees</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Roles, ages, animaux, logement et disponibilites.
              </p>
            </Card>
            <Card className="p-5">
              <Coins className="mb-3 h-5 w-5 text-[var(--brand-coral)]" />
              <p className="font-semibold">Budget relie aux routines</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Depenses evitables, projections 3/6/12 mois.
              </p>
            </Card>
            <Card className="p-5">
              <Sparkles className="mb-3 h-5 w-5 text-[var(--brand-mint-strong)]" />
              <p className="font-semibold">Exports PDF premium</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                Planning frigo, budget mensuel, tableaux enfants.
              </p>
            </Card>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[580px] justify-center">
          {floating.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * index }}
              className={`absolute hidden rounded-3xl border border-white/60 bg-white/85 px-4 py-3 shadow-xl backdrop-blur md:block ${item.className}`}
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
            className="relative w-full rounded-[40px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,248,243,0.86))] p-5 shadow-[0_40px_120px_rgba(109,94,244,0.18)]"
          >
            <div className="rounded-[32px] bg-[linear-gradient(180deg,#fff,#fff7f1)] p-5">
              <div className="flex items-center justify-between rounded-3xl bg-[linear-gradient(135deg,#6D5EF4,#4A8EFF)] px-5 py-4 text-white">
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
                  <div className="rounded-3xl bg-[rgba(109,94,244,0.08)] p-4">
                    <p className="text-sm text-[var(--foreground-muted)]">Aujourd'hui</p>
                    <p className="mt-2 text-xl font-semibold">8 taches planifiees</p>
                    <div className="mt-3 h-2 rounded-full bg-white">
                      <div className="h-2 w-[76%] rounded-full bg-[var(--brand-primary)]" />
                    </div>
                  </div>
                  <div className="rounded-3xl bg-[rgba(255,126,107,0.1)] p-4">
                    <p className="text-sm text-[var(--foreground-muted)]">Economies</p>
                    <p className="mt-2 text-xl font-semibold">342 EUR / mois</p>
                    <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                      grace au meal prep et a la meilleure repartition
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
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
                        className="rounded-2xl bg-[var(--card-muted)] px-3 py-3 text-sm"
                      >
                        <p className="font-medium">{name}</p>
                        <p className="text-[var(--foreground-muted)]">
                          {index === 0 ? "Assignee" : index === 1 ? "Lessive" : "Budget"}
                        </p>
                      </div>
                    ))}
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
