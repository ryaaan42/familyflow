"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  categoryColors,
  categoryLabels,
  useFamilyFlowStore
} from "@familyflow/shared";
import {
  BrainCircuit,
  CalendarRange,
  Shuffle,
  Sparkles,
  WandSparkles
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const getMondayIndex = (value: string) => {
  const date = new Date(value);
  return (date.getDay() + 6) % 7;
};

export function TasksView() {
  const state = useFamilyFlowStore();

  const grouped = useMemo(
    () =>
      state.profile.members.map((member) => ({
        member,
        tasks: state.tasks
          .filter((task) => task.assignedMemberId === member.id)
          .sort((left, right) => left.estimatedMinutes - right.estimatedMinutes)
      })),
    [state.profile.members, state.tasks]
  );

  const dailyTasks = useMemo(
    () => state.tasks.filter((task) => task.frequency === "quotidienne").slice(0, 8),
    [state.tasks]
  );

  const weeklyBuckets = useMemo(
    () =>
      weekdayLabels.map((label, index) => ({
        label,
        tasks: state.tasks
          .filter(
            (task) =>
              task.frequency !== "quotidienne" &&
              getMondayIndex(task.dueDate) === index
          )
          .sort((left, right) => left.estimatedMinutes - right.estimatedMinutes)
      })),
    [state.tasks]
  );

  const smartHighlights = useMemo(
    () =>
      state.tasks
        .filter((task) => task.origin === "smart")
        .sort((left, right) => (right.indirectCostPerMonth ?? 0) - (left.indirectCostPerMonth ?? 0))
        .slice(0, 6),
    [state.tasks]
  );

  return (
    <div className="space-y-5">
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(20,17,49,0.94),rgba(70,58,170,0.92),rgba(56,136,224,0.88),rgba(86,199,161,0.82))] text-white hero-glow">
        <div className="grid gap-8 p-7 md:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div className="space-y-5">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Orchestrateur intelligent</Badge>
            <div className="space-y-3">
              <h2 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                Un tableau de semaine vraiment pilotable, avec suggestions selon l'age, les roles et le rythme du foyer.
              </h2>
              <p className="max-w-3xl text-[15px] leading-7 text-white/78">
                FamilyFlow propose plus de taches, les repartit mieux et expose clairement pourquoi elles remontent.
                L'effet "IA" reste pragmatique: age, preferences, animaux, taille du logement, charge et cout indirect.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => state.rebalanceAssignments()}>
                <Shuffle className="mr-2 h-4 w-4" />
                Reequilibrer la semaine
              </Button>
              <Button asChild variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/16">
                <Link href="/app/assistant">
                  <WandSparkles className="mr-2 h-4 w-4" />
                  Suggestions IA pretes
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            {[
              {
                label: "Taches suggerees",
                value: state.tasks.length,
                hint: "catalogue etendu + heuristiques foyer"
              },
              {
                label: "Routines quotidiennes",
                value: dailyTasks.length,
                hint: "habitudes a accrocher sur le frigo"
              },
              {
                label: "Cout evitable",
                value: `${smartHighlights.reduce((sum, task) => sum + (task.indirectCostPerMonth ?? 0), 0)} EUR`,
                hint: "impact potentiel si ces routines sautent"
              }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[28px] border border-white/16 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md"
              >
                <p className="text-sm text-white/64">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="grid-sheen overflow-hidden">
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Badge>Planning hebdo</Badge>
                <h3 className="text-2xl font-semibold tracking-[-0.03em]">Vue semaine a afficher ou imprimer</h3>
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                  Chaque colonne regroupe les actions ciblees du jour. Les routines quotidiennes sont isolees pour rester lisibles.
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                <CalendarRange className="h-5 w-5" />
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="grid min-w-[920px] grid-cols-7 gap-3">
                {weeklyBuckets.map((bucket, index) => (
                  <div
                    key={bucket.label}
                    className="rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,255,0.94))] p-4 shadow-[0_20px_48px_rgba(30,24,77,0.08)]"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{bucket.label}</p>
                        <p className="text-xs text-[var(--foreground-subtle)]">
                          {bucket.tasks.length} tache{bucket.tasks.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <Badge variant={index >= 5 ? "coral" : "outline"}>{index + 1}</Badge>
                    </div>
                    <div className="space-y-3">
                      {bucket.tasks.length === 0 ? (
                        <div className="rounded-2xl bg-[var(--card-muted)] px-3 py-4 text-sm text-[var(--foreground-muted)]">
                          Jour plus leger. Laisser une marge pour les imprevus.
                        </div>
                      ) : (
                        bucket.tasks.slice(0, 4).map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => state.toggleTask(task.id)}
                            className="w-full rounded-[20px] border px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(40,32,92,0.1)]"
                            style={{
                              borderColor: `${categoryColors[task.category]}28`,
                              background: `linear-gradient(180deg, rgba(255,255,255,0.98), ${categoryColors[task.category]}10)`
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                  {state.profile.members.find((member) => member.id === task.assignedMemberId)?.name ?? "A assigner"}
                                </p>
                              </div>
                              <Badge variant={task.status === "done" ? "mint" : "outline"}>
                                {task.status === "done" ? "Fait" : `${task.estimatedMinutes} min`}
                              </Badge>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Routines quotidiennes</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Les repetitives a fixer sur le planning frigo.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {dailyTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="rounded-[24px] border border-white/70 p-4"
                  style={{
                    background:
                      index % 2 === 0
                        ? "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,240,255,0.9))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(235,248,245,0.9))"
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {state.profile.members.find((member) => member.id === task.assignedMemberId)?.name ?? "A assigner"}
                      </p>
                    </div>
                    <Badge variant="mint">Tous les jours</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                    {task.smartReason ?? "Propose automatiquement selon le profil du foyer."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.92))]">
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(86,199,161,0.18)] p-3 text-[var(--brand-mint-strong)]">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Pourquoi ces suggestions remontent</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Version heuristique premium, lisible et maintenable.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {smartHighlights.map((task) => (
                <div key={task.id} className="rounded-[24px] bg-white/88 p-4 shadow-[0_16px_34px_rgba(30,24,77,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant="coral">
                      {task.indirectCostPerMonth ? `${task.indirectCostPerMonth} EUR / mois` : "Impact faible"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {task.smartReason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge>Charge par membre</Badge>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Repartition plus claire et plus jolie</h3>
              </div>
              <Badge variant="mint">{state.profile.household.balanceScore}/100</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {grouped.map(({ member, tasks }) => (
                <div key={member.id} className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,255,0.94))] p-4 shadow-[0_22px_50px_rgba(40,32,92,0.08)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-11 w-11 rounded-full shadow-[0_10px_25px_rgba(30,24,77,0.14)]"
                        style={{ backgroundColor: member.avatarColor }}
                      />
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm capitalize text-[var(--foreground-muted)]">{member.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0)} min
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {tasks.slice(0, 4).map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => state.toggleTask(task.id)}
                        className="flex w-full items-center justify-between rounded-[22px] border border-white/70 bg-white/90 px-4 py-3 text-left shadow-[0_10px_24px_rgba(30,24,77,0.06)]"
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {categoryLabels[task.category]}
                          </p>
                        </div>
                        <Badge variant={task.status === "done" ? "mint" : "outline"}>
                          {task.status === "done" ? "Fait" : "A faire"}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
