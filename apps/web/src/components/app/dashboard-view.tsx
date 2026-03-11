"use client";

import {
  categoryColors,
  selectDashboardSummary,
  useFamilyFlowStore
} from "@familyflow/shared";
import { BarChart3, CheckCircle2, Clock3, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import { MetricCard } from "./metric-card";

const weeklyProgress = [
  { day: "Lun", rate: 42 },
  { day: "Mar", rate: 58 },
  { day: "Mer", rate: 76 },
  { day: "Jeu", rate: 68 },
  { day: "Ven", rate: 82 },
  { day: "Sam", rate: 74 },
  { day: "Dim", rate: 88 }
];

export function DashboardView() {
  const state = useFamilyFlowStore();
  const summary = selectDashboardSummary(state);
  const tasksByCategory = Object.entries(
    state.tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.category] = (acc[task.category] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name,
    value,
    fill: categoryColors[name]
  }));

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(109,94,244,0.12),rgba(74,142,255,0.08),rgba(255,255,255,0.85))]">
          <div className="space-y-6 p-7 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <Badge>Dashboard familial</Badge>
                <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                  Bonjour {state.user.displayName.split(" ")[0]}, la semaine avance bien.
                </h2>
              </div>
              <Badge variant="mint">{summary.completionRate} % termines</Badge>
            </div>
            <p className="max-w-3xl text-[15px] leading-7 text-[var(--foreground-muted)]">
              Bravo, cette semaine vous avez termine {summary.completionRate} % des taches.
              En reduisant une sortie cinema par mois, vous economisez deja environ{" "}
              {formatCurrency(summary.savings.annualSavings)} par an.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Taches du jour"
                value={`${state.tasks.filter((task) => task.status !== "done").length}`}
                hint="Toutes categories confondues"
              />
              <MetricCard
                label="Budget restant"
                value={formatCurrency(summary.disposableIncome)}
                hint="Apres revenus et depenses du mois"
                tone="mint"
              />
              <MetricCard
                label="Membre le plus charge"
                value={summary.busiestMember?.member.name ?? "Aucun"}
                hint={`${summary.busiestMember?.load ?? 0} min attribuees`}
                tone="coral"
              />
            </div>
          </div>
        </Card>
        <Card>
          <div className="space-y-5 p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Focus du jour</p>
                <h3 className="text-2xl font-semibold tracking-[-0.03em]">Priorites a surveiller</h3>
              </div>
              <BarChart3 className="h-5 w-5 text-[var(--brand-primary)]" />
            </div>
            <div className="grid gap-3">
              {state.tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-3xl bg-[var(--card-muted)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                        {state.profile.members.find((member) => member.id === task.assignedMemberId)?.name ?? "A assigner"}
                      </p>
                    </div>
                    <Badge variant={task.status === "done" ? "mint" : "outline"}>
                      {task.status === "done" ? "Termine" : "A faire"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="space-y-4 p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Progression hebdomadaire</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Evolution de la completion sur 7 jours
                </p>
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgress}>
                  <defs>
                    <linearGradient id="weekly-progress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D5EF4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6D5EF4" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E2FF" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#6D5EF4"
                    fill="url(#weekly-progress)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4 p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Repartition des categories</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Charge de taches par domaine
                </p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tasksByCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={86}
                      paddingAngle={4}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-3">
                {tasksByCategory.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl bg-[var(--card-muted)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="capitalize">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card>
          <div className="space-y-4 p-6">
            <Clock3 className="h-5 w-5 text-[var(--brand-primary)]" />
            <h3 className="text-lg font-semibold">Taches en retard</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              {state.tasks.filter((task) => task.status !== "done").length} actions ont encore un
              impact indirect sur le budget du foyer.
            </p>
          </div>
        </Card>
        <Card>
          <div className="space-y-4 p-6">
            <Wallet className="h-5 w-5 text-[var(--brand-coral)]" />
            <h3 className="text-lg font-semibold">Depenses evitables</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              {formatCurrency(summary.savings.currentMonthlyCost)} / mois identifies entre routines
              non optimales et depenses variables a lisser.
            </p>
          </div>
        </Card>
        <Card>
          <div className="space-y-4 p-6">
            <BarChart3 className="h-5 w-5 text-[var(--brand-mint-strong)]" />
            <h3 className="text-lg font-semibold">Temps gagne</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Le reequilibrage current estime 2 h 40 de charge mentale redistribuee sur la semaine.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}

