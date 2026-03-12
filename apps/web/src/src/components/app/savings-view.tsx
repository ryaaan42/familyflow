"use client";

import {
  buildSavingsSummary,
  useFamilyFlowStore
} from "@familyflow/shared";
import {
  ArrowUpRight,
  Calendar,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function SavingsView() {
  const state = useFamilyFlowStore();
  const summary = buildSavingsSummary(state.savingsScenarios, state.tasks, state.budgetItems);

  const topCards = [
    {
      label: "Coût actuel",
      value: formatCurrency(summary.currentMonthlyCost),
      icon: TrendingUp,
      gradient: "from-rose-400/20 to-transparent",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      badge: "Avant optimisation",
      badgeClass: "bg-rose-100 text-rose-700"
    },
    {
      label: "Coût optimisé",
      value: formatCurrency(summary.optimizedMonthlyCost),
      icon: Target,
      gradient: "from-blue-400/20 to-transparent",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      badge: "Cible réaliste",
      badgeClass: "bg-blue-100 text-blue-700"
    },
    {
      label: "Gain mensuel",
      value: formatCurrency(summary.monthlySavings),
      icon: Sparkles,
      gradient: "from-emerald-400/20 to-transparent",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      badge: "Potentiel net",
      badgeClass: "bg-emerald-100 text-emerald-700"
    },
    {
      label: "Gain annuel",
      value: formatCurrency(summary.annualSavings),
      icon: Zap,
      gradient: "from-violet-400/20 to-transparent",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      badge: "Projection 12 mois",
      badgeClass: "bg-violet-100 text-violet-700"
    }
  ];

  return (
    <div className="space-y-5">
      {/* ── Hero ── */}
      <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(20,18,50,0.96),rgba(109,94,244,0.9),rgba(0,169,255,0.84),rgba(46,197,161,0.76))] text-white">
        <div className="flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Scénarios intelligents</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">Économisez chaque mois</h2>
            <p className="max-w-xl text-sm leading-6 text-white/78">
              FamilyFlow identifie vos habitudes coûteuses et vous propose des ajustements concrets.
              Chaque scénario est calé sur votre profil de foyer réel.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-64">
            <div className="rounded-[22px] border border-white/16 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs text-white/60">Gain mensuel</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(summary.monthlySavings)}</p>
            </div>
            <div className="rounded-[22px] border border-white/16 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs text-white/60">Gain annuel</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(summary.annualSavings)}</p>
            </div>
            <div className="col-span-2 rounded-[22px] border border-white/16 bg-white/10 p-4 backdrop-blur-md">
              <p className="text-xs text-white/60">Impact routines non tenues</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(summary.taskWasteMonthly)} / mois</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── KPI row ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className={`overflow-hidden bg-gradient-to-br ${card.gradient}`}>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[var(--foreground-subtle)]" />
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight">{card.value}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-sm text-[var(--foreground-muted)]">{card.label}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        {/* ── Scenarios ── */}
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em]">Scénarios d'optimisation</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Habitudes coûteuses et actions associées
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {state.savingsScenarios.map((scenario, index) => {
                const savingsPct =
                  scenario.monthlyCost > 0
                    ? Math.max(
                        ((scenario.monthlyCost - scenario.improvedMonthlyCost) / scenario.monthlyCost) * 100,
                        4
                      )
                    : 0;
                const barColors = [
                  "bg-[linear-gradient(90deg,#FF7E6B,#FFBF5A)]",
                  "bg-[linear-gradient(90deg,#6D5EF4,#00a9ff)]",
                  "bg-[linear-gradient(90deg,#2ec5a1,#00a9ff)]",
                  "bg-[linear-gradient(90deg,#f25f8c,#FF7E6B)]"
                ];
                const badgeBg = [
                  "bg-rose-100 text-rose-700",
                  "bg-violet-100 text-violet-700",
                  "bg-emerald-100 text-emerald-700",
                  "bg-pink-100 text-pink-700"
                ];
                return (
                  <div
                    key={scenario.id}
                    className="rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,255,0.92))] p-5 shadow-[0_12px_30px_rgba(30,24,77,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold">{scenario.title}</p>
                        <p className="text-sm text-[var(--foreground-muted)]">{scenario.description}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${badgeBg[index % 4]}`}>
                        {formatCurrency(scenario.monthlyCost)}/m
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                        <span>Économie potentielle</span>
                        <span className="font-semibold text-[var(--foreground)]">
                          {formatCurrency(scenario.monthlyCost - scenario.improvedMonthlyCost)} / mois
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--card-muted)]">
                        <div
                          className={`h-2.5 rounded-full ${barColors[index % 4]}`}
                          style={{ width: `${savingsPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-[var(--foreground-subtle)]">
                        <span>Actuel : {formatCurrency(scenario.monthlyCost)}</span>
                        <span>Cible : {formatCurrency(scenario.improvedMonthlyCost)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ── Projections ── */}
        <div className="space-y-4">
          <Card>
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[rgba(53,89,230,0.12)] p-3 text-[var(--brand-primary)]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Projections temporelles</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">Horizon 3, 6 et 12 mois</p>
                </div>
              </div>
              <div className="grid gap-3">
                {summary.projections.map((projection, index) => {
                  const progressColors = ["bg-blue-400", "bg-violet-400", "bg-emerald-400"];
                  const maxSavings = Math.max(...summary.projections.map((p) => p.savings), 1);
                  return (
                    <div key={projection.label} className="rounded-[22px] bg-[var(--card-muted)] p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{projection.label}</p>
                        <Badge variant="mint">{formatCurrency(projection.savings)}</Badge>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/60">
                        <div
                          className={`h-2 rounded-full ${progressColors[index % 3]}`}
                          style={{ width: `${(projection.savings / maxSavings) * 100}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
                        Coût optimisé : {formatCurrency(projection.improvedCost)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(109,94,244,0.12),rgba(0,169,255,0.08),rgba(255,255,255,0.98))]">
            <div className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[rgba(109,94,244,0.14)] p-3 text-[var(--brand-primary)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Impact des routines</h3>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Les routines non tenues génèrent des coûts indirects estimés à :
              </p>
              <p className="text-3xl font-bold text-[var(--brand-primary)]">
                {formatCurrency(summary.taskWasteMonthly)}
                <span className="ml-1 text-base font-medium text-[var(--foreground-muted)]">/ mois</span>
              </p>
              <div className="rounded-2xl bg-white/70 p-3 text-sm text-[var(--foreground-muted)]">
                En activant les routines suggérées par l'IA, vous pouvez récupérer une partie de ce montant
                dès le premier mois.
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
