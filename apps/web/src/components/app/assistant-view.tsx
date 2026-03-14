"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { AiHouseholdPlan } from "@familyflow/shared";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Gift,
  LoaderCircle,
  Sparkles,
  TrendingDown,
  Wallet
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LOAD_STEPS = [
  "Lecture du profil foyer…",
  "Analyse des tâches existantes…",
  "Optimisation budget…",
  "Génération du plan personnalisé…",
  "Finalisation…"
];

export function AssistantView() {
  const state = useFamilyFlowStore();
  const [plan, setPlan] = useState<AiHouseholdPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string } | null>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const ready = Boolean(
    state.profile.household.name &&
    state.profile.household.housingType &&
    state.profile.members.length > 0
  );

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((p) => setAiStatus({ configured: Boolean(p.configured), model: String(p.model ?? "gpt-4o-mini") }))
      .catch(() => null);
  }, []);

  const runAssistant = async () => {
    setIsLoading(true);
    setError(null);
    setLoadStep(0);

    let step = 0;
    stepTimer.current = setInterval(() => {
      step = Math.min(step + 1, LOAD_STEPS.length - 2);
      setLoadStep(step);
    }, 900);

    try {
      const res = await fetch("/api/ai/household-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          tasks: state.tasks,
          budgetItems: state.budgetItems,
          birthListItems: state.birthListItems
        })
      });

      if (stepTimer.current) { clearInterval(stepTimer.current); stepTimer.current = null; }
      setLoadStep(LOAD_STEPS.length - 1);

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        if (res.status === 402) {
          setError("Limite gratuite atteinte (3 générations/mois). Passez au plan Pro.");
          return;
        }
        throw new Error(err.error ?? "Analyse indisponible");
      }

      const nextPlan = (await res.json()) as AiHouseholdPlan;
      setPlan(nextPlan);
    } catch (err) {
      if (stepTimer.current) { clearInterval(stepTimer.current); stepTimer.current = null; }
      setError(err instanceof Error ? err.message : "Impossible de générer le planning personnalisé.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Hero card ── */}
      <Card className="overflow-hidden hero-galaxy text-white hero-glow-violet premium-shell">
        <div className="grid gap-8 p-7 md:grid-cols-[1.12fr_0.88fr] md:p-8">
          <div className="space-y-5">
            <Badge variant="white">Assistant IA</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-[-0.04em] md:text-5xl">
                Votre planning personnalisé,<br className="hidden md:block" /> généré en un clic.
              </h2>
              <p className="max-w-xl text-[15px] leading-7 text-white/78">
                L&apos;assistant analyse votre foyer, vos tâches, votre budget et vos animaux
                pour retourner un plan concret, distribué sur 7 jours.
              </p>
              {aiStatus && (
                <p className="text-sm text-white/70">
                  {aiStatus.configured
                    ? `Connecté à OpenAI · modèle ${aiStatus.model}`
                    : "Mode heuristique — ajoutez une clé OpenAI pour l'IA complète"}
                </p>
              )}
            </div>

            {/* Loading steps */}
            {isLoading ? (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                  <p className="text-sm font-semibold text-white">{LOAD_STEPS[loadStep]}</p>
                </div>
                <div className="flex gap-1">
                  {LOAD_STEPS.map((s, i) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-all duration-700 ${i <= loadStep ? "bg-white" : "bg-white/20"}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={runAssistant}
                  disabled={!ready || isLoading}
                >
                  {isLoading
                    ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours…</>
                    : <><BrainCircuit className="mr-2 h-4 w-4" />{plan ? "Regénérer le plan" : "Générer mon planning"}</>
                  }
                </Button>
                {state.profile.household.isExpectingBaby && (
                  <Button asChild variant="secondary">
                    <Link href="/app/birth-list">
                      <Gift className="mr-2 h-4 w-4" />Liste de naissance
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Stats column */}
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {[
              {
                label: "Foyer prêt",
                value: ready ? "Oui ✓" : "Presque",
                sub: "Nom, logement et membres"
              },
              {
                label: "Contexte analysé",
                value: String(state.profile.members.length + state.profile.pets.length),
                sub: "membres + animaux"
              },
              {
                label: "Mode naissance",
                value: state.profile.household.isExpectingBaby ? "Actif" : "Off",
                sub: "Liste bébé intégrée"
              }
            ].map((stat) => (
              <div key={stat.label} className="rounded-[20px] border border-white/18 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs text-white/60">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-white/60">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Error ── */}
      {error && (
        <Card>
          <div className="flex items-center gap-3 p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
              <BrainCircuit className="h-4 w-4" />
            </span>
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        </Card>
      )}

      {/* ── Plan results ── */}
      {plan && (
        <>
          {/* Summary card */}
          <Card>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant={plan.usedFallback ? "yellow" : "mint"}>
                    {plan.usedFallback ? "Mode heuristique" : "OpenAI ✓"}
                  </Badge>
                  <h3 className="text-2xl font-bold tracking-[-0.03em]">{plan.headline}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{state.tasks.length} tâches analysées</Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/app/tasks">
                      Voir les tâches <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <p className="max-w-4xl text-[15px] leading-7 text-[var(--foreground-muted)]">{plan.summary}</p>
            </div>
          </Card>

          {/* 3-column results */}
          <section className="grid gap-5 xl:grid-cols-3">
            {/* Task priorities */}
            <Card>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(109,94,244,0.1)] text-[#6D5EF4]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Priorités tâches</h3>
                    <p className="text-xs text-[var(--foreground-muted)]">Qui fait quoi et à quel moment.</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {plan.taskFocus.map((item) => (
                    <div
                      key={`${item.title}-${item.who}`}
                      className="rounded-2xl border border-[rgba(224,231,255,0.8)] bg-[linear-gradient(180deg,#ffffff,#f8f7ff)] p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#0f0e1a]">{item.title}</p>
                        {item.estimatedMinutes && (
                          <span className="shrink-0 rounded-full bg-[#f0f3fb] px-2 py-0.5 text-[10px] font-semibold text-[#6b7280]">
                            {item.estimatedMinutes}min
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-[var(--foreground-muted)]">{item.reason}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-[#6D5EF4]/10 px-2 py-0.5 text-[10px] font-semibold text-[#6D5EF4]">
                          {item.who}
                        </span>
                        <span className="text-[10px] text-[#9ca3af]">·</span>
                        <span className="text-[10px] text-[#6b7280]">{item.when}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Routines */}
            <Card>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(16,185,129,0.1)] text-[var(--brand-mint-strong)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Routines conseillées</h3>
                    <p className="text-xs text-[var(--foreground-muted)]">À stabiliser sur la semaine.</p>
                  </div>
                </div>

                {/* Detailed routine suggestions */}
                {Array.isArray(plan.routineSuggestions) && plan.routineSuggestions.length > 0 ? (
                  <div className="space-y-2.5">
                    {plan.routineSuggestions.map((r) => (
                      <div key={r.title} className="rounded-2xl border border-[#d1fae5] bg-[#f0fdf4] p-3.5">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {r.timing}
                          </span>
                          <p className="text-xs font-bold text-[#0f0e1a]">{r.title}</p>
                        </div>
                        <ol className="space-y-1 pl-1">
                          {r.steps.map((step, i) => (
                            <li key={step} className="flex items-start gap-2 text-[11px] text-[#4b5563]">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plan.routines.map((item) => (
                      <div key={item} className="rounded-2xl bg-[linear-gradient(180deg,#ffffff,#f0fdf4)] p-3.5 border border-[#d1fae5]">
                        <p className="text-xs leading-5 text-[var(--foreground)]">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Savings */}
            <Card>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(245,158,11,0.1)] text-[var(--brand-yellow)]">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Économies suggérées</h3>
                    <p className="text-xs text-[var(--foreground-muted)]">Actions simples, impact budget.</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {plan.savingsMoves.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 rounded-2xl border border-[#fef3c7] bg-[#fffbeb] p-3.5">
                      <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <p className="text-xs leading-5 text-[var(--foreground)]">{item}</p>
                    </div>
                  ))}
                  {Array.isArray(plan.budgetSuggestions) && plan.budgetSuggestions.length > 0 && (
                    <>
                      <p className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                        Budget additionnel
                      </p>
                      {plan.budgetSuggestions.map((item) => (
                        <div key={item} className="flex items-start gap-2.5 rounded-2xl border border-[#fef3c7] bg-[#fffbeb] p-3.5">
                          <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                          <p className="text-xs leading-5 text-[var(--foreground)]">{item}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </Card>
          </section>

          {/* Birth list suggestions */}
          {state.profile.household.isExpectingBaby && plan.birthListSuggestions.length > 0 && (
            <Card>
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(244,63,94,0.1)] text-[var(--brand-coral)]">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Suggestions liste de naissance</h3>
                      <p className="text-xs text-[var(--foreground-muted)]">Complément IA à la liste partageable.</p>
                    </div>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/app/birth-list">Ouvrir la liste <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {plan.birthListSuggestions.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-[rgba(244,63,94,0.15)] bg-[linear-gradient(180deg,#ffffff,#fff5f7)] p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <Badge variant={
                          item.priority === "essentiel" ? "coral"
                            : item.priority === "utile" ? "mint"
                            : "outline"
                        }>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
