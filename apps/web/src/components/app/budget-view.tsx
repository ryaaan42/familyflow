"use client";

import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { PiggyBank, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

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

  return (
    <div className="space-y-5">
      <section className="grid gap-5 md:grid-cols-4">
        <Card><div className="space-y-2 p-6"><p className="text-sm text-[var(--foreground-muted)]">Revenus</p><p className="text-3xl font-semibold">{formatCurrency(summary.income)}</p></div></Card>
        <Card><div className="space-y-2 p-6"><p className="text-sm text-[var(--foreground-muted)]">Charges fixes</p><p className="text-3xl font-semibold">{formatCurrency(summary.fixed)}</p></div></Card>
        <Card><div className="space-y-2 p-6"><p className="text-sm text-[var(--foreground-muted)]">Variables</p><p className="text-3xl font-semibold">{formatCurrency(summary.variable)}</p></div></Card>
        <Card><div className="space-y-2 p-6"><p className="text-sm text-[var(--foreground-muted)]">Reste</p><p className="text-3xl font-semibold">{formatCurrency(summary.remaining)}</p></div></Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">Budget mensuel</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Vision claire des categories et ecarts
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {state.budgetItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-3xl bg-[var(--card-muted)] px-4 py-4">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.amount)}</p>
                    <Badge variant={item.type === "income" ? "mint" : item.type === "fixed" ? "outline" : "coral"}>
                      {item.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(86,199,161,0.18)] p-3 text-[var(--brand-mint-strong)]">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Objectif du mois</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Epargne visee et leviers d'action
                </p>
              </div>
            </div>
            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(86,199,161,0.16),rgba(255,255,255,0.96))] p-5">
              <p className="text-sm text-[var(--foreground-muted)]">Cible</p>
              <p className="mt-2 text-4xl font-semibold">
                {formatCurrency(state.budget.targetSavings)}
              </p>
              <div className="mt-4 h-3 rounded-full bg-white">
                <div className="h-3 w-[74%] rounded-full bg-[var(--brand-mint)]" />
              </div>
              <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                74 % de l'objectif deja accessible si les scenarios proposes sont tenus.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="rounded-3xl border border-[var(--border)] p-4">
                <p className="font-medium">Categorie la plus sensible</p>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  Restaurant / fast food: une meilleure planification repas est le premier levier.
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--border)] p-4">
                <p className="font-medium">Mode premium prepare</p>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  Alertes budget avancees, exports automatiques et recommandations IA enrichies.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

