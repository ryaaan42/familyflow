"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { AiHouseholdPlan } from "@familyflow/shared";
import {
  BrainCircuit,
  CheckCircle2,
  Gift,
  LoaderCircle,
  Sparkles,
  Wallet
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AssistantView() {
  const state = useFamilyFlowStore();
  const [plan, setPlan] = useState<AiHouseholdPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openAiStatus, setOpenAiStatus] = useState<{ configured: boolean; model: string } | null>(null);
  const ready = Boolean(
    state.profile.household.name &&
      state.profile.household.housingType &&
      state.profile.members.length > 0
  );



  useEffect(() => {
    fetch("/api/ai/status")
      .then((response) => response.json())
      .then((payload) => {
        setOpenAiStatus({
          configured: Boolean(payload.configured),
          model: String(payload.model ?? "gpt-5-mini")
        });
      })
      .catch(() => {
        setOpenAiStatus(null);
      });
  }, []);
  const runAssistant = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/household-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile: state.profile,
          tasks: state.tasks,
          budgetItems: state.budgetItems,
          birthListItems: state.birthListItems
        })
      });

      if (!response.ok) {
        throw new Error("Analyse indisponible");
      }

      const nextPlan = (await response.json()) as AiHouseholdPlan;
      setPlan(nextPlan);
    } catch {
      setError("Impossible de generer le planning personnalise pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden hero-galaxy text-white hero-glow-violet premium-shell">
        <div className="grid gap-8 p-7 md:grid-cols-[1.12fr_0.88fr] md:p-8">
          <div className="space-y-5">
            <Badge variant="white">Assistant IA</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                Une fois les infos du foyer remplies, fais mon planning personnalise.
              </h2>
              <p className="max-w-3xl text-[15px] leading-7 text-white/78">
                L'assistant analyse votre foyer, vos taches, votre budget, les animaux et, si une grossesse est declaree,
                la liste de naissance. Il retourne un plan concret, actionnable et lisible.
              </p>
              {openAiStatus ? (
                <p className="text-sm text-white/80">
                  IA {openAiStatus.configured ? "connectée à OpenAI" : "en mode fallback"} · modèle {openAiStatus.model}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={runAssistant} disabled={!ready || isLoading}>
                {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Faire mon planning personnalise
              </Button>
              {state.profile.household.isExpectingBaby ? (
                <Button asChild variant="secondary">
                  <Link href="/app/birth-list">
                    <Gift className="mr-2 h-4 w-4" />
                    Voir la liste de naissance
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Foyer pret</p>
              <p className="mt-3 text-3xl font-semibold">{ready ? "Oui" : "Presque"}</p>
              <p className="mt-2 text-sm text-white/72">nom, logement et membres deja presents</p>
            </div>
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Contexte pris en compte</p>
              <p className="mt-3 text-3xl font-semibold">{state.profile.members.length + state.profile.pets.length}</p>
              <p className="mt-2 text-sm text-white/72">membres + animaux analyses</p>
            </div>
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Mode naissance</p>
              <p className="mt-3 text-3xl font-semibold">{state.profile.household.isExpectingBaby ? "Actif" : "Off"}</p>
              <p className="mt-2 text-sm text-white/72">liste bebe integree si grossesse declaree</p>
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <Card>
          <div className="p-6">
            <p className="text-sm text-[var(--brand-coral)]">{error}</p>
          </div>
        </Card>
      ) : null}

      {plan ? (
        <>
          <Card>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Badge variant={plan.usedFallback ? "yellow" : "mint"}>
                    {plan.usedFallback ? "Mode heuristique" : "OpenAI live"}
                  </Badge>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{plan.headline}</h3>
                </div>
                <Badge variant="outline">{state.tasks.length} taches analysees</Badge>
              </div>
              <p className="max-w-4xl text-[15px] leading-7 text-[var(--foreground-muted)]">{plan.summary}</p>
            </div>
          </Card>

          <section className="grid gap-5 xl:grid-cols-3">
            <Card>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Priorites taches</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">Qui fait quoi et a quel moment.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {plan.taskFocus.map((item) => (
                    <div key={`${item.title}-${item.who}`} className="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,255,0.92))] p-4">
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-2 text-sm text-[var(--foreground-muted)]">{item.reason}</p>
                      <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                        {item.who} | {item.when}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[rgba(86,199,161,0.18)] p-3 text-[var(--brand-mint-strong)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Routines conseillees</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">A stabiliser sur la semaine.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {plan.routines.map((item) => (
                    <div key={item} className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,248,245,0.92))] p-4">
                      <p className="text-sm leading-6 text-[var(--foreground)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Economies suggerees</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">Actions simples avec impact budget.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {plan.savingsMoves.map((item) => (
                    <div key={item} className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,241,237,0.92))] p-4">
                      <p className="text-sm leading-6 text-[var(--foreground)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </section>

          {state.profile.household.isExpectingBaby && plan.birthListSuggestions.length > 0 ? (
            <Card>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Suggestions IA pour la liste de naissance</h3>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        Complement utile a la liste partageable du foyer.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href="/app/birth-list">Ouvrir la liste</Link>
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {plan.birthListSuggestions.map((item) => (
                    <div key={item.title} className="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,241,237,0.92))] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{item.title}</p>
                        <Badge variant={item.priority === "essentiel" ? "coral" : item.priority === "utile" ? "mint" : "outline"}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
