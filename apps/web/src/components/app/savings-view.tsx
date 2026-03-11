"use client";

import {
  buildSavingsSummary,
  useFamilyFlowStore
} from "@familyflow/shared";
import { Lightbulb, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function SavingsView() {
  const state = useFamilyFlowStore();
  const summary = buildSavingsSummary(state.savingsScenarios, state.tasks, state.budgetItems);

  return (
    <div className="space-y-5">
      <section className="grid gap-5 md:grid-cols-4">
        <Card><div className="space-y-2 p-6"><p className="text-sm text-[var(--foreground-muted)]">Cout actuel</p><p className="text-3xl font-semibold">{formatCurrency(summary.currentMonthlyCost)}</p></div></Card>
        <Card><div className="space-y-2 p-6"><p className="text-sm text-[var(--foreground-muted)]">Cout optimise</p><p className="text-3xl font-semibold">{formatCurrency(summary.optimizedMonthlyCost)}</p></div></Card>
        <Card><div className="space-y-2 p-6"><p className="text-sm text-[var(--foreground-muted)]">Gain mensuel</p><p className="text-3xl font-semibold">{formatCurrency(summary.monthlySavings)}</p></div></Card>
        <Card><div className="space-y-2 p-6"><p className="text-sm text-[var(--foreground-muted)]">Gain annuel</p><p className="text-3xl font-semibold">{formatCurrency(summary.annualSavings)}</p></div></Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">Scenarios intelligents</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Habitudes couteuses et actions associees
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {state.savingsScenarios.map((scenario) => (
                <div key={scenario.id} className="rounded-3xl bg-[var(--card-muted)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{scenario.title}</p>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {scenario.description}
                      </p>
                    </div>
                    <Badge variant="coral">{formatCurrency(scenario.monthlyCost)}</Badge>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-white">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,#FF7E6B,#FFBF5A)]"
                      style={{
                        width: `${Math.max(
                          ((scenario.monthlyCost - scenario.improvedMonthlyCost) / scenario.monthlyCost) * 100,
                          8
                        )}%`
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-[var(--foreground-muted)]">
                    Economie potentielle: {formatCurrency(scenario.monthlyCost - scenario.improvedMonthlyCost)} / mois
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Projections</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Horizon 3, 6 et 12 mois
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {summary.projections.map((projection) => (
                <div key={projection.label} className="rounded-3xl border border-[var(--border)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{projection.label}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        Cout optimise {formatCurrency(projection.improvedCost)}
                      </p>
                    </div>
                    <Badge variant="mint">{formatCurrency(projection.savings)}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(109,94,244,0.12),rgba(255,255,255,0.96))] p-5">
              <p className="text-sm text-[var(--foreground-muted)]">Impact organisation</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(summary.taskWasteMonthly)} / mois proviennent des routines non tenues.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

