"use client";

import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Shuffle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function TasksView() {
  const state = useFamilyFlowStore();

  const grouped = useMemo(
    () =>
      state.profile.members.map((member) => ({
        member,
        tasks: state.tasks.filter((task) => task.assignedMemberId === member.id)
      })),
    [state.profile.members, state.tasks]
  );

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge>Taches intelligentes</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">
              Suggestions adaptees au foyer et reequilibrage automatique.
            </h2>
            <p className="max-w-3xl text-[15px] leading-7 text-[var(--foreground-muted)]">
              Le moteur prend en compte les ages, roles, animaux, type de logement et
              disponibilites. Le drag & drop peut s'ajouter ensuite sans casser l'architecture.
            </p>
          </div>
          <Button type="button" onClick={() => state.rebalanceAssignments()}>
            <Shuffle className="mr-2 h-4 w-4" />
            Reequilibrer
          </Button>
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Vue par membre</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Chaque carte represente la charge attribuee pour la semaine.
                </p>
              </div>
              <Badge variant="mint">{state.profile.household.balanceScore}/100</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {grouped.map(({ member, tasks }) => (
                <div key={member.id} className="rounded-[28px] bg-[var(--card-muted)] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-10 w-10 rounded-full"
                        style={{ backgroundColor: member.avatarColor }}
                      />
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-[var(--foreground-muted)]">{member.role}</p>
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
                        className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left"
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-[var(--foreground-muted)]">{task.category}</p>
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

        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Bibliotheque de taches</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Base V1 extensible par templates et taches custom.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {state.tasks.slice(0, 8).map((task) => (
                <div key={task.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {task.frequency}, {task.estimatedMinutes} min, difficulte {task.difficulty}/5
                      </p>
                    </div>
                    <Badge variant="coral">
                      {task.indirectCostPerMonth ? `${task.indirectCostPerMonth} EUR / mois` : "Faible cout"}
                    </Badge>
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

