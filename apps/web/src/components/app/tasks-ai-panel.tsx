"use client";

import { useEffect, useState } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { AiHouseholdPlan } from "@familyflow/shared";
import { BrainCircuit, ChevronDown, ChevronUp, LoaderCircle, Shuffle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PersistedSuggestion {
  id: string;
  suggestion_type: string;
  title: string | null;
  body: string;
  is_active: boolean;
}

export function TasksAiPanel() {
  const state = useFamilyFlowStore();
  const [plan, setPlan] = useState<AiHouseholdPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PersistedSuggestion[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const ready = Boolean(state.profile.household.name && state.profile.members.length > 0);

  const loadSuggestions = async () => {
    const response = await fetch("/api/ai/suggestions");
    if (!response.ok) return;
    const payload = (await response.json()) as PersistedSuggestion[];
    setSuggestions(payload);
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const runAi = async () => {
    setIsLoading(true);
    setError(null);
    setStatus("Génération IA en cours...");
    try {
      const response = await fetch("/api/ai/household-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          tasks: state.tasks,
          budgetItems: state.budgetItems,
          birthListItems: state.birthListItems,
          onboardingAnswers: {},
          autoApplyTasks: true
        })
      });
      if (!response.ok) throw new Error();
      const nextPlan = (await response.json()) as AiHouseholdPlan & { tasks?: typeof state.tasks };
      setPlan(nextPlan);
      setIsExpanded(true);
      if (Array.isArray(nextPlan.tasks)) {
        useFamilyFlowStore.setState({ tasks: nextPlan.tasks });
      }
      setStatus(nextPlan.usedFallback ? "IA indisponible: tâches de base appliquées." : "Suggestions IA prêtes et enregistrées.");
      await loadSuggestions();
    } catch {
      setError("Impossible de générer le planning IA pour le moment. Fallback de base conservé.");
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSuggestion = async (id: string, isActive: boolean) => {
    const response = await fetch("/api/ai/suggestions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive })
    });
    if (response.ok) {
      const payload = (await response.json()) as PersistedSuggestion[];
      setSuggestions(payload);
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
            <Badge className="text-[10px]">{state.profile.members.length} membre(s)</Badge>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">Génération automatique après onboarding + édition manuelle immédiate.</p>
          {status ? <p className="mt-1 text-xs text-emerald-700">{status}</p> : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" variant="secondary" size="sm" onClick={() => state.rebalanceAssignments()}>
            <Shuffle className="mr-1.5 h-3.5 w-3.5" />Rééquilibrer
          </Button>
          <Button type="button" size="sm" disabled={!ready || isLoading} onClick={runAi}>
            {isLoading ? <><LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />Génération en cours...</> : <><BrainCircuit className="mr-1.5 h-3.5 w-3.5" />Regénérer IA</>}
          </Button>
          {plan && (
            <button type="button" onClick={() => setIsExpanded((v) => !v)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d9e6ff] bg-white text-[var(--foreground-muted)] hover:bg-[#f1f6ff] transition">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {suggestions.length > 0 && (
        <div className="mt-3 rounded-xl border border-[#e8f0ff] bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">Suggestions IA sauvegardées</p>
          <div className="space-y-2">
            {suggestions.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-2 rounded-lg border border-[#f0f4ff] p-2">
                <div>
                  <p className="text-xs font-medium">{s.title ?? s.suggestion_type}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{s.body}</p>
                </div>
                <button className="rounded-lg border px-2 py-1 text-[10px]" onClick={() => toggleSuggestion(s.id, s.is_active)}>
                  {s.is_active ? "Désactiver" : "Activer"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {plan && isExpanded && (
        <div className="mt-4 space-y-3 border-t border-[#e8f0ff] pt-4">
          <p className="text-sm leading-6 text-[var(--foreground-muted)]">{plan.summary}</p>
        </div>
      )}
    </div>
  );
}
