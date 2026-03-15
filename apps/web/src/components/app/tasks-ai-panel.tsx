"use client";

import { useEffect, useRef, useState } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { AiHouseholdPlan } from "@familyflow/shared";
import {
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ListChecks,
  LoaderCircle,
  Shuffle,
  Sparkles,
  TrendingDown,
  X,
  Zap
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

/* ───────────────────────────── types ───────────────────────────── */

interface PersistedSuggestion {
  id: string;
  suggestion_type: string;
  title: string | null;
  body: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

type PlanTab = "tasks" | "routines" | "savings";

const LOAD_STEPS = ["Analyse du foyer", "Génération des tâches", "Routines & budget", "Finalisation"];

/* ─────────────────────────────────────────────────────────────────── */

export function TasksAiPanel() {
  const state = useFamilyFlowStore();

  const [plan, setPlan] = useState<AiHouseholdPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PersistedSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<PlanTab>("tasks");
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const ready = Boolean(state.profile.household.name && state.profile.members.length > 0);

  /* Load status + saved suggestions on mount */
  useEffect(() => {
    void Promise.all([
      fetch("/api/ai/status", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null),
      fetch("/api/ai/suggestions")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
    ]).then(([status, suggs]) => {
      if (status) setAiStatus({ configured: Boolean(status.configured), model: String(status.model ?? "gpt-5-mini") });
      if (Array.isArray(suggs) && suggs.length > 0) {
        setSuggestions(suggs);
        setIsExpanded(true);
      }
    });
  }, []);

  const stopStepTimer = () => {
    if (stepTimer.current) { clearInterval(stepTimer.current); stepTimer.current = null; }
  };

  /* Run AI plan generation */
  const runAi = async () => {
    setIsLoading(true);
    setError(null);
    setLoadStep(0);

    let step = 0;
    stepTimer.current = setInterval(() => {
      step = Math.min(step + 1, LOAD_STEPS.length - 2);
      setLoadStep(step);
    }, 1000);

    try {
      const res = await fetch("/api/ai/household-plan", {
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

      stopStepTimer();
      setLoadStep(LOAD_STEPS.length - 1);

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        if (res.status === 402) {
          setError("Limite gratuite atteinte (3 générations/mois). Passez au plan Pro.");
          return;
        }
        throw new Error(err.error ?? `Erreur ${res.status}`);
      }

      const nextPlan = (await res.json()) as AiHouseholdPlan & { tasks?: typeof state.tasks };
      setPlan(nextPlan);
      setIsExpanded(true);
      setActiveTab("tasks");

      if (Array.isArray(nextPlan.tasks)) {
        useFamilyFlowStore.setState({ tasks: nextPlan.tasks });
      }

      /* Reload persisted suggestions */
      const suggs = await fetch("/api/ai/suggestions")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []) as PersistedSuggestion[];
      if (Array.isArray(suggs)) setSuggestions(suggs);

    } catch (err) {
      stopStepTimer();
      setError(err instanceof Error ? err.message : "Impossible de générer le plan IA.");
    } finally {
      setIsLoading(false);
    }
  };

  /* Toggle suggestion active/inactive */
  const toggleSuggestion = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch("/api/ai/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current })
      });
      if (res.ok) {
        const payload = (await res.json()) as PersistedSuggestion[];
        setSuggestions(Array.isArray(payload) ? payload : suggestions.map((s) => s.id === id ? { ...s, is_active: !current } : s));
      }
    } finally {
      setTogglingId(null);
    }
  };

  /* Derived counts */
  const taskSuggs = suggestions.filter((s) => s.suggestion_type === "task");
  const routineSuggs = suggestions.filter((s) => s.suggestion_type === "routine");
  const budgetSuggs = suggestions.filter((s) => s.suggestion_type === "budget");
  const hasSuggestions = suggestions.length > 0;

  const tabs: Array<{ key: PlanTab; label: string; count: number; activeClass: string }> = (
    [
      { key: "tasks" as PlanTab, label: "Tâches", count: taskSuggs.length, activeClass: "bg-[#6D5EF4] text-white shadow-[0_2px_8px_rgba(109,94,244,0.4)]" },
      { key: "routines" as PlanTab, label: "Routines", count: routineSuggs.length, activeClass: "bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]" },
      { key: "savings" as PlanTab, label: "Budget", count: budgetSuggs.length, activeClass: "bg-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]" }
    ] satisfies Array<{ key: PlanTab; label: string; count: number; activeClass: string }>
  ).filter((t) => t.count > 0);

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#e8e4f8] bg-white shadow-[0_8px_32px_rgba(79,70,229,0.08)]">

      {/* ── Panel header ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#f0edfb] bg-[linear-gradient(135deg,#fdfcff_0%,#f5f3ff_100%)] px-5 py-4">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6D5EF4,#8B7BFF)] shadow-[0_4px_14px_rgba(109,94,244,0.35)]">
          <BrainCircuit className="h-5 w-5 text-white" />
        </div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-[#0f0e1a]">Assistant IA — Planning personnalisé</p>
            {aiStatus && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                aiStatus.configured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${aiStatus.configured ? "bg-emerald-500" : "bg-amber-500"}`} />
                {aiStatus.configured ? `OpenAI · ${aiStatus.model}` : "Mode heuristique"}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#6b7280]">
            Génère des tâches et routines sur-mesure selon le profil de votre foyer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => state.rebalanceAssignments()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8e4f8] bg-white px-3 py-2 text-xs font-semibold text-[#6b7280] transition hover:bg-[#f9f8ff] hover:text-[#4b5563]"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Rééquilibrer</span>
          </button>

          <button
            type="button"
            disabled={!ready || isLoading}
            onClick={runAi}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,#6D5EF4,#8B7BFF)] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(109,94,244,0.4)] transition hover:shadow-[0_6px_20px_rgba(109,94,244,0.5)] disabled:opacity-50 active:scale-95"
          >
            {isLoading
              ? <><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Génération...</>
              : <><Zap className="h-3.5 w-3.5" />{plan ? "Regénérer" : "Générer un plan"}</>
            }
          </button>

          {(plan || hasSuggestions) && (
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e8e4f8] bg-white text-[#9ca3af] transition hover:bg-[#f9f8ff]"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Loading progress ── */}
      {isLoading && (
        <div className="border-b border-[#f0edfb] bg-[#fdfcff] px-5 py-4">
          <div className="mb-2.5 flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin text-[#6D5EF4]" />
            <p className="text-sm font-semibold text-[#0f0e1a]">{LOAD_STEPS[loadStep]}</p>
          </div>
          <div className="flex gap-1">
            {LOAD_STEPS.map((step, i) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all duration-700 ${i <= loadStep ? "bg-[#6D5EF4]" : "bg-[#ede9fe]"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[#9ca3af]">
            {state.profile.members.length} membre{state.profile.members.length > 1 ? "s" : ""}
            {state.profile.pets.length > 0 ? ` · ${state.profile.pets.length} animal${state.profile.pets.length > 1 ? "ux" : ""}` : ""}
            {" · "}foyer {state.profile.household.name}
          </p>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && !isLoading && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-rose-700">Erreur</p>
            <p className="text-xs text-rose-600">{error}</p>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Expanded results ── */}
      {isExpanded && !isLoading && (
        <div className="space-y-4 p-4">

          {/* Plan summary card */}
          {plan?.summary && (
            <div className="rounded-2xl border border-[#e8e4f8] bg-[linear-gradient(135deg,#fdfcff,#f5f3ff)] p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={plan.usedFallback ? "yellow" : "mint"}>
                  {plan.usedFallback ? "Mode heuristique" : "OpenAI ✓"}
                </Badge>
                {plan.headline && (
                  <p className="text-xs font-bold text-[#0f0e1a]">{plan.headline}</p>
                )}
              </div>
              <p className="text-xs leading-5 text-[#4b5563]">{plan.summary}</p>
              {Array.isArray(plan.notes) && plan.notes.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-[#ede9fe] pt-3">
                  {plan.notes.slice(0, 2).map((note) => (
                    <p key={note} className="flex items-start gap-1.5 text-[11px] text-[#6b7280]">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[#6D5EF4]" />
                      {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section tabs */}
          {hasSuggestions && (
            <>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      activeTab === tab.key
                        ? tab.activeClass
                        : "bg-[#f0f3fb] text-[#6b7280] hover:bg-[#e4e9f8] hover:text-[#4b5563]"
                    }`}
                  >
                    {tab.key === "tasks" && <ListChecks className="h-3 w-3" />}
                    {tab.key === "routines" && <Clock className="h-3 w-3" />}
                    {tab.key === "savings" && <TrendingDown className="h-3 w-3" />}
                    {tab.label}
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                      activeTab === tab.key ? "bg-white/25 text-white" : "bg-[#6D5EF4]/15 text-[#6D5EF4]"
                    }`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Task suggestions */}
              {activeTab === "tasks" && (
                <div className="space-y-2">
                  {taskSuggs.map((s, i) => (
                    <div
                      key={s.id}
                      className={`group flex items-start gap-3 rounded-2xl border p-3 transition-all ${
                        s.is_active
                          ? "border-[#e8e4f8] bg-white hover:border-[#6D5EF4]/40 hover:shadow-[0_4px_16px_rgba(109,94,244,0.08)]"
                          : "border-[#f4f4f8] bg-[#fafbff] opacity-55"
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        s.is_active ? "bg-[#6D5EF4]/10 text-[#6D5EF4]" : "bg-gray-100 text-gray-400"
                      }`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#0f0e1a]">{s.title}</p>
                        <p className="mt-0.5 text-xs leading-4 text-[#6b7280]">{s.body}</p>
                      </div>
                      <button
                        type="button"
                        disabled={togglingId === s.id}
                        onClick={() => toggleSuggestion(s.id, s.is_active)}
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                          s.is_active
                            ? "border border-[#6D5EF4]/25 bg-[#f5f3ff] text-[#6D5EF4] hover:bg-[#ede9fe]"
                            : "border border-[#e8e4f8] bg-white text-[#9ca3af] hover:bg-[#f9f8ff]"
                        }`}
                      >
                        {togglingId === s.id ? "..." : s.is_active ? "Actif" : "Inactif"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Routine suggestions */}
              {activeTab === "routines" && (
                <div className="space-y-2">
                  {routineSuggs.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-start gap-3 rounded-2xl border p-3 transition-all ${
                        s.is_active
                          ? "border-[#d1fae5] bg-[#f0fdf4]"
                          : "border-[#f4f4f8] bg-[#fafbff] opacity-55"
                      }`}
                    >
                      <Clock className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${s.is_active ? "text-emerald-500" : "text-gray-300"}`} />
                      <div className="min-w-0 flex-1">
                        {s.title && <p className="text-xs font-semibold text-[#0f0e1a]">{s.title}</p>}
                        <p className={`text-xs leading-4 ${s.title ? "mt-0.5 text-[#6b7280]" : "text-[#374151]"}`}>{s.body}</p>
                      </div>
                      <button
                        type="button"
                        disabled={togglingId === s.id}
                        onClick={() => toggleSuggestion(s.id, s.is_active)}
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                          s.is_active
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border border-[#e8e4f8] bg-white text-[#9ca3af] hover:bg-[#f9f8ff]"
                        }`}
                      >
                        {togglingId === s.id ? "..." : s.is_active ? "Actif" : "Inactif"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Budget suggestions */}
              {activeTab === "savings" && (
                <div className="space-y-2">
                  {budgetSuggs.map((s) => (
                    <div key={s.id} className="flex items-start gap-3 rounded-2xl border border-[#fef3c7] bg-[#fffbeb] p-3">
                      <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <div className="min-w-0 flex-1">
                        {s.title && s.title !== "Budget" && (
                          <p className="text-xs font-semibold text-[#0f0e1a]">{s.title}</p>
                        )}
                        <p className="text-xs leading-5 text-[#4b5563]">{s.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Empty state when panel opened but nothing yet */}
          {!hasSuggestions && !plan && !error && (
            <div className="rounded-2xl border border-dashed border-[#d9e6ff] py-10 text-center">
              <BrainCircuit className="mx-auto mb-3 h-8 w-8 text-[#6D5EF4]/30" />
              <p className="text-sm font-semibold text-[#6b7280]">Aucun plan généré</p>
              <p className="mt-1 text-xs text-[#9ca3af]">
                Cliquez sur "Générer un plan" pour obtenir des suggestions personnalisées.
              </p>
            </div>
          )}

          {/* Routine detail cards (from raw plan, not just suggestions) */}
          {activeTab === "routines" && plan && Array.isArray(plan.routineSuggestions) && plan.routineSuggestions.length > 0 && routineSuggs.length === 0 && (
            <div className="space-y-2">
              {plan.routineSuggestions.map((r) => (
                <div key={r.title} className="rounded-2xl border border-[#d1fae5] bg-[#f0fdf4] p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {r.timing}
                    </span>
                    <p className="text-xs font-bold text-[#0f0e1a]">{r.title}</p>
                  </div>
                  <ol className="space-y-1 pl-3">
                    {r.steps.map((step, i) => (
                      <li key={step} className="flex items-start gap-1.5 text-[11px] text-[#4b5563]">
                        <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[9px] font-bold text-emerald-700">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collapsed hint when suggestions exist */}
      {!isExpanded && hasSuggestions && !isLoading && (
        <div
          className="flex cursor-pointer items-center gap-2 px-5 py-3 text-xs text-[#9ca3af] transition hover:bg-[#fdfcff]"
          onClick={() => setIsExpanded(true)}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-[#6D5EF4]" />
          <span>
            {taskSuggs.filter((s) => s.is_active).length} tâches ·{" "}
            {routineSuggs.filter((s) => s.is_active).length} routines actives —{" "}
            <span className="font-semibold text-[#6D5EF4]">Voir le détail</span>
          </span>
        </div>
      )}
    </div>
  );
}
