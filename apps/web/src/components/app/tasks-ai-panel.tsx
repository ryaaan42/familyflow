"use client";

import { useState } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { AiHouseholdPlan } from "@familyflow/shared";
import { BrainCircuit, ChevronDown, ChevronUp, LoaderCircle, Shuffle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TasksAiPanel() {
  const state = useFamilyFlowStore();
  const [plan, setPlan] = useState<AiHouseholdPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(
    state.profile.household.name &&
      state.profile.members.length > 0 &&
      state.tasks.length > 0
  );

  const runAi = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/household-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          tasks: state.tasks,
          budgetItems: state.budgetItems,
          birthListItems: state.birthListItems
        })
      });
      if (!response.ok) throw new Error();
      const nextPlan = (await response.json()) as AiHouseholdPlan;
      setPlan(nextPlan);
      setIsExpanded(true);
    } catch {
      setError("Impossible de générer le planning IA pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-[#d9e6ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(242,247,255,0.94))] p-4 shadow-[0_12px_40px_rgba(24,53,123,0.09)]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(109,94,244,0.12)] text-[#6D5EF4]">
          <BrainCircuit className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold">Assistant IA des tâches</p>
            <Badge className="text-[10px]">
              {state.profile.members.filter((m) => m.isPregnant).length > 0
                ? "Grossesse détectée"
                : state.profile.members.filter((m) => m.role === "enfant" || m.role === "ado").length > 0
                  ? "Enfants/ados détectés"
                  : "Adapté à votre foyer"}
            </Badge>
          </div>
          {plan ? (
            <p className="text-sm text-[var(--foreground-muted)] mt-0.5 truncate">{plan.headline}</p>
          ) : (
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              Adapte les tâches selon âge, rôle et grossesse des membres du foyer.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => state.rebalanceAssignments()}
          >
            <Shuffle className="mr-1.5 h-3.5 w-3.5" />
            Rééquilibrer
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!ready || isLoading}
            onClick={runAi}
          >
            {isLoading ? (
              <><LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />Génération...</>
            ) : (
              <><BrainCircuit className="mr-1.5 h-3.5 w-3.5" />Générer un planning IA</>
            )}
          </Button>
          {plan && (
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d9e6ff] bg-white text-[var(--foreground-muted)] hover:bg-[#f1f6ff] transition"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      {plan && isExpanded && (
        <div className="mt-4 space-y-3 border-t border-[#e8f0ff] pt-4">
          <p className="text-sm leading-6 text-[var(--foreground-muted)]">{plan.summary}</p>
          {plan.taskFocus.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {plan.taskFocus.map((item) => (
                <div
                  key={`${item.title}-${item.who}`}
                  className="rounded-[18px] border border-[#e8f0ff] bg-white px-3 py-2.5"
                >
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                    {item.who} · {item.when}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
