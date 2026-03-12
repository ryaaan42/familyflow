"use client";

import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  income: "Revenu",
  fixed: "Fixe",
  variable: "Variable"
};

const categoryDots: Record<string, string> = {
  loyer_credit: "#468BFF",
  courses: "#FF8DB2",
  transport: "#3AB0FF",
  abonnements: "#A07BFF",
  loisirs: "#FFBF5A",
  sorties: "#FF7E6B",
  restaurant_fast_food: "#f25f8c",
  animaux: "#56C7A1",
  enfants: "#FFBF5A",
  sante: "#2ec5a1",
  imprevus: "#ffca4e",
  maison: "#6D5EF4"
};

export function BudgetView() {
  const state = useFamilyFlowStore();

  const summary = useMemo(() => {
    const income = state.budgetItems
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const fixed = state.budgetItems
      .filter((item) => item.type === "fixed")
      .reduce((sum, item) => sum + item.amount, 0);
    const variable = state.budgetItems
      .filter((item) => item.type === "variable")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      fixed,
      variable,
      remaining: income - fixed - variable
    };
  }, [state.budgetItems]);

  const savingsRate = summary.income > 0
    ? Math.round((summary.remaining / summary.income) * 100)
    : 0;

  const topCards = [
    {
      label: "Revenus mensuels",
      value: formatCurrency(summary.income),
      icon: TrendingUp,
      gradient: "from-emerald-400/20 via-teal-300/10 to-transparent",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      badge: "+stable",
      badgeColor: "bg-emerald-100 text-emerald-700",
      trendIcon: ArrowUpRight,
      trendColor: "text-emerald-600"
    },
    {
      label: "Charges fixes",
      value: formatCurrency(summary.fixed),
      icon: Receipt,
      gradient: "from-blue-400/20 via-indigo-300/10 to-transparent",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      badge: "Engagé",
      badgeColor: "bg-blue-100 text-blue-700",
      trendIcon: ArrowDownRight,
      trendColor: "text-blue-600"
    },
    {
      label: "Charges variables",
      value: formatCurrency(summary.variable),
      icon: TrendingDown,
      gradient: "from-amber-400/20 via-orange-300/10 to-transparent",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      badge: "À optimiser",
      badgeColor: "bg-amber-100 text-amber-700",
      trendIcon: AlertCircle,
      trendColor: "text-amber-600"
    },
    {
      label: "Reste à vivre",
      value: formatCurrency(summary.remaining),
      icon: Wallet,
      gradient:
        summary.remaining >= 0
          ? "from-violet-400/20 via-purple-300/10 to-transparent"
          : "from-red-400/20 via-rose-300/10 to-transparent",
      iconBg: summary.remaining >= 0 ? "bg-violet-100" : "bg-red-100",
      iconColor: summary.remaining >= 0 ? "text-violet-600" : "text-red-600",
      badge: `${savingsRate} % épargnés`,
      badgeColor:
        summary.remaining >= 0
          ? "bg-violet-100 text-violet-700"
          : "bg-red-100 text-red-700",
      trendIcon: summary.remaining >= 0 ? ArrowUpRight : ArrowDownRight,
      trendColor: summary.remaining >= 0 ? "text-violet-600" : "text-red-600"
    }
  ];

  return (
    <div className="space-y-5">
      {/* ── Hero header ── */}
      <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(20,18,50,0.96),rgba(53,89,230,0.88),rgba(46,197,161,0.78))] text-white">
        <div className="flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Budget mensuel</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">Pilotez vos finances</h2>
            <p className="max-w-xl text-sm leading-6 text-white/78">
              Vision claire entre revenus, charges et reste à vivre. Identifiez les postes à optimiser pour
              atteindre votre objectif d'épargne.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/16 bg-white/10 p-5 backdrop-blur-md">
            <p className="text-sm text-white/66">Objectif d'épargne</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(state.budget.targetSavings)}</p>
            <div className="mt-3 h-2.5 rounded-full bg-white/20">
              <div
                className="h-2.5 rounded-full bg-[linear-gradient(90deg,#2ec5a1,#00a9ff)]"
                style={{ width: `${Math.min(savingsRate, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/66">{savingsRate} % de l'objectif atteint</p>
          </div>
        </div>
      </Card>

      {/* ── KPI row ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendIcon;
          return (
            <Card key={card.label} className={`overflow-hidden bg-gradient-to-br ${card.gradient}`}>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <TrendIcon className={`h-4 w-4 ${card.trendColor}`} />
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight">{card.value}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-sm text-[var(--foreground-muted)]">{card.label}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Main content ── */}
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(53,89,230,0.12)] p-3 text-[var(--brand-primary)]">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em]">Détail des postes</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {state.budgetItems.length} lignes budgétaires
                </p>
              </div>
            </div>

            {/* Income section */}
            {["income", "fixed", "variable"].map((type) => {
              const items = state.budgetItems.filter((item) => item.type === type);
              if (items.length === 0) return null;
              const total = items.reduce((s, i) => s + i.amount, 0);
              const colors: Record<string, { bg: string; text: string; bar: string }> = {
                income: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-400" },
                fixed: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-400" },
                variable: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-400" }
              };
              const c = colors[type];
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.bg} ${c.text}`}>
                      {typeLabels[type]}
                    </span>
                    <span className="text-sm font-semibold text-[var(--foreground-muted)]">{formatCurrency(total)}</span>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-white/70 bg-white px-4 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: categoryDots[item.category] ?? "#9CA3AF" }}
                        />
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs capitalize text-[var(--foreground-subtle)]">
                            {item.category.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-[var(--foreground-subtle)]">
                          {summary.income > 0 ? Math.round((item.amount / summary.income) * 100) : 0} % du revenu
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Objectif du mois</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">Épargne visée et progression</p>
                </div>
              </div>

              <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(46,197,161,0.14),rgba(0,169,255,0.08),rgba(255,255,255,0.98))] p-5">
                <p className="text-sm text-[var(--foreground-muted)]">Cible mensuelle</p>
                <p className="mt-1 text-4xl font-bold tracking-tight">
                  {formatCurrency(state.budget.targetSavings)}
                </p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#2ec5a1,#00a9ff)]"
                    style={{ width: `${Math.min(savingsRate, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  {savingsRate} % — {formatCurrency(summary.remaining)} disponibles ce mois
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="font-semibold text-sm">Poste le plus sensible</p>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Restaurant / fast food — optimiser les repas est le levier le plus rapide.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <p className="font-semibold text-sm">Potentiel d'économie</p>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    En optimisant 3 postes variables, vous pouvez dégager{" "}
                    <strong className="text-emerald-600">+{formatCurrency(Math.round(summary.variable * 0.18))}/mois</strong>.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Donut-style repartition */}
          <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.92))]">
            <div className="space-y-3 p-6">
              <h3 className="font-semibold">Répartition du revenu</h3>
              {[
                {
                  label: "Charges fixes",
                  amount: summary.fixed,
                  pct: summary.income > 0 ? Math.round((summary.fixed / summary.income) * 100) : 0,
                  color: "bg-blue-400"
                },
                {
                  label: "Variables",
                  amount: summary.variable,
                  pct: summary.income > 0 ? Math.round((summary.variable / summary.income) * 100) : 0,
                  color: "bg-amber-400"
                },
                {
                  label: "Épargne",
                  amount: Math.max(summary.remaining, 0),
                  pct: Math.max(savingsRate, 0),
                  color: "bg-emerald-400"
                }
              ].map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--foreground-muted)]">{row.label}</span>
                    <span className="font-semibold">{row.pct} %</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--card-muted)]">
                    <div
                      className={`h-2 rounded-full ${row.color}`}
                      style={{ width: `${Math.min(row.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
