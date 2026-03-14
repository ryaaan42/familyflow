"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Coins,
  PawPrint,
  PiggyBank,
  Sparkles,
  Star,
  TrendingUp,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const floating = [
  { label: "Routine du soir", value: "+18 min gagnées", className: "-left-2 top-6 md:-left-6" },
  { label: "Budget optimisé", value: "340 € / mois", className: "-right-2 top-16 md:-right-8" },
  { label: "Animaux 🐾", value: "Moka + Lune", className: "bottom-6 left-8 md:left-14" }
];

const socialProof = [
  { value: "2 400+", label: "familles actives" },
  { value: "4.8 ★", label: "note moyenne" },
  { value: "340 €", label: "économisés/mois" }
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-6 md:pb-24 md:pt-10">
      {/* Orbs */}
      <div className="orb left-[4%] top-8 h-40 w-40 bg-[rgba(109,94,244,0.22)]" />
      <div className="orb right-[8%] top-24 h-52 w-52 bg-[rgba(58,176,255,0.18)]" />
      <div className="orb bottom-4 left-[38%] h-32 w-32 bg-[rgba(255,126,107,0.18)]" />
      <div className="orb right-[20%] bottom-20 h-24 w-24 bg-[rgba(46,197,161,0.2)]" />
      <div className="absolute inset-x-0 top-[-180px] h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(109,94,244,0.16),_transparent_60%)]" />

      <div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        {/* ── Left: copy ── */}
        <div className="animate-fade-in-up space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="mint" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Organisation familiale intelligente
            </Badge>
            <span className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
              Gratuit pour commencer
            </span>
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-[66px]">
              Mieux répartir les tâches,{" "}
              <span className="text-gradient">mieux vivre</span>{" "}
              <span className="font-serif italic">ensemble</span>.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[var(--foreground-muted)]">
              Planille aide les familles à planifier les routines, distribuer les tâches
              équitablement, maîtriser le budget et transformer les mauvaises habitudes en
              économies concrètes.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/app">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#modules">Voir les modules</Link>
            </Button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-5 pt-1">
            {[
              "Sans carte bleue",
              "100 % RGPD",
              "Données privées"
            ].map((text) => (
              <span key={text} className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)]">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {text}
              </span>
            ))}
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center gap-0 divide-x divide-[var(--border)] overflow-hidden rounded-[22px] border border-[var(--border)] bg-white/80 backdrop-blur">
            {socialProof.map((item) => (
              <div key={item.label} className="flex flex-col px-5 py-4">
                <p className="text-xl font-bold text-[var(--foreground)]">{item.value}</p>
                <p className="text-xs text-[var(--foreground-muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: app mockup ── */}
        <div className="relative mx-auto flex w-full max-w-[560px] justify-center [perspective:2000px]">
          {floating.map((item, index) => (
            <div
              key={item.label}
              className={`animate-fade-in-up absolute hidden flex-col rounded-[16px] border border-white/70 bg-white/90 px-4 py-2.5 shadow-[0_20px_40px_rgba(57,47,133,0.12)] backdrop-blur-md md:flex ${item.className}`}
              style={{ animationDelay: `${0.2 + 0.15 * index}s` }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm font-bold">{item.value}</p>
            </div>
          ))}

          <div
            className="animate-fade-in-up relative z-10 w-full rounded-[38px] border border-white/60 bg-white p-3.5 shadow-[0_48px_120px_rgba(109,94,244,0.2),0_12px_32px_rgba(0,0,0,0.06)] [transform:rotateY(-8deg)_rotateX(5deg)]"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="overflow-hidden rounded-[28px]">
              {/* App header */}
              <div className="bg-[linear-gradient(135deg,#6D5EF4,#3559e6_50%,#2ec5a1)] px-5 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white/70">Famille Martin · Cette semaine</p>
                    <p className="mt-0.5 text-lg font-bold">82 % des tâches ✓</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1.5 text-xs font-bold">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Score +9
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-2 w-[82%] rounded-full bg-white" />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5">
                {[
                  { label: "Tâches", value: "8", icon: CalendarRange, bg: "bg-violet-50", color: "text-violet-600" },
                  { label: "Économies", value: "342 €", icon: Coins, bg: "bg-emerald-50", color: "text-emerald-600" },
                  { label: "Membres", value: "4", icon: Users, bg: "bg-blue-50", color: "text-blue-600" }
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-[16px] ${stat.bg} p-2.5 text-center`}>
                    <stat.icon className={`mx-auto mb-1 h-4 w-4 ${stat.color}`} />
                    <p className="text-sm font-bold text-[var(--foreground)]">{stat.value}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)]">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Task list */}
              <div className="space-y-2 px-3.5 pb-2.5">
                {[
                  { task: "Faire la lessive", member: "Sophie", cat: "Ménage", color: "#6D5EF4", done: true },
                  { task: "Courses du soir", member: "Lucas", cat: "Courses", color: "#FF8DB2", done: false },
                  { task: "Promener Moka", member: "Emma", cat: "Animaux", color: "#56C7A1", done: false }
                ].map((item) => (
                  <div
                    key={item.task}
                    className="flex items-center justify-between rounded-[14px] border border-white/80 bg-white px-3 py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className={`text-xs font-semibold ${item.done ? "line-through opacity-40" : ""}`}>
                          {item.task}
                        </p>
                        <p className="text-[10px] text-[var(--foreground-subtle)]">{item.member} · {item.cat}</p>
                      </div>
                    </div>
                    <div className={`rounded-full p-1 ${item.done ? "bg-emerald-100" : "bg-gray-100"}`}>
                      {item.done
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        : <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom cards */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 pt-2">
                <div className="rounded-[16px] bg-[linear-gradient(135deg,rgba(255,126,107,0.14),rgba(255,191,90,0.1))] p-3">
                  <div className="flex items-center gap-1.5 text-[var(--brand-coral)]">
                    <PawPrint className="h-3.5 w-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Challenge</p>
                  </div>
                  <p className="mt-1.5 text-sm font-bold">Zéro dépense inutile</p>
                  <p className="mt-0.5 text-[10px] text-[var(--foreground-muted)]">3 habitudes sous contrôle ✓</p>
                </div>
                <div className="rounded-[16px] bg-[linear-gradient(135deg,rgba(58,176,255,0.16),rgba(255,255,255,0.9))] p-3">
                  <div className="flex items-center gap-1.5 text-[var(--brand-primary)]">
                    <PiggyBank className="h-3.5 w-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Projection</p>
                  </div>
                  <p className="mt-1.5 text-sm font-bold">4 104 € / an</p>
                  <p className="mt-0.5 text-[10px] text-[var(--foreground-muted)]">si routines tenues 📈</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div
        className="animate-fade-in-up mt-14 grid gap-4 sm:grid-cols-3"
        style={{ animationDelay: "0.5s" }}
      >
        {[
          {
            icon: CalendarRange,
            title: "Tâches adaptées",
            desc: "Rôles, âges, animaux, logement et disponibilités.",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            from: "from-violet-50"
          },
          {
            icon: Coins,
            title: "Budget relié aux routines",
            desc: "Dépenses évitables, projections 3/6/12 mois.",
            iconBg: "bg-rose-100",
            iconColor: "text-rose-600",
            from: "from-rose-50"
          },
          {
            icon: Star,
            title: "Exports PDF premium",
            desc: "Planning frigo, budget mensuel, tableaux enfants.",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            from: "from-emerald-50"
          }
        ].map((card) => (
          <Card key={card.title} className={`bg-gradient-to-br ${card.from} to-white hover-lift`}>
            <div className="flex gap-4 p-5">
              <div className={`shrink-0 rounded-2xl p-3 ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="font-semibold">{card.title}</p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">{card.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
