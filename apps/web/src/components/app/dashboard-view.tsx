"use client";

import {
  categoryColors,
  selectDashboardSummary,
  useFamilyFlowStore
} from "@familyflow/shared";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Sparkles,
  Wallet
} from "lucide-react";
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

  const dailyRoutines = state.tasks.filter((task) => task.frequency === "quotidienne").length;
  const smartTasks = state.tasks.filter((task) => task.origin === "smart").length;

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(18,18,48,0.96),rgba(68,60,167,0.92),rgba(67,139,230,0.86),rgba(86,199,161,0.78))] text-white hero-glow">
          <div className="grid gap-8 p-7 md:grid-cols-[1.08fr_0.92fr] md:p-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <Badge className="w-fit bg-white/14 text-white shadow-none">Dashboard familial</Badge>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                  Bonjour {state.user.displayName.split(" ")[0]}, votre foyer est mieux orchestre cette semaine.
                </h2>
              </div>
              <p className="max-w-3xl text-[15px] leading-7 text-white/78">
                Bravo, {summary.completionRate} % des taches sont deja terminees. En reduisant une sortie cinema par mois,
                vous gardez environ {formatCurrency(summary.savings.annualSavings)} sur l'annee.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm text-white/64">Taches intelligentes</p>
                  <p className="mt-3 text-3xl font-semibold">{smartTasks}</p>
                  <p className="mt-2 text-sm text-white/72">proposees automatiquement</p>
                </div>
                <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm text-white/64">Routines quotidiennes</p>
                  <p className="mt-3 text-3xl font-semibold">{dailyRoutines}</p>
                  <p className="mt-2 text-sm text-white/72">a afficher sur le frigo</p>
                </div>
                <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm text-white/64">Budget restant</p>
                  <p className="mt-3 text-3xl font-semibold">{formatCurrency(summary.disposableIncome)}</p>
                  <p className="mt-2 text-sm text-white/72">apres charges mensuelles</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-white/18 bg-white/12 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/66">Membre le plus charge</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {summary.busiestMember?.member.name ?? "Aucun"}
                    </p>
                  </div>
                  <Badge className="bg-white/12 text-white shadow-none">{summary.completionRate} % termines</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  {summary.busiestMember?.load ?? 0} minutes attribuees cette semaine. Le reequilibrage peut redistribuer une partie de cette charge.
                </p>
              </div>

              <div className="rounded-[30px] border border-white/18 bg-white/12 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/66">Economies potentielles</p>
                    <p className="mt-2 text-2xl font-semibold">{formatCurrency(summary.savings.monthlySavings)}</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-white/86" />
                </div>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  Les scenarios relies aux repas, courses et sorties restent les leviers les plus rapides a actionner.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.94))]">
          <div className="space-y-5 p-7">
            <div className="flex items-center justify-between">
              <div>
                <Badge>Focus du jour</Badge>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Priorites a surveiller</h3>
              </div>
              <BarChart3 className="h-5 w-5 text-[var(--brand-primary)]" />
            </div>
            <div className="grid gap-3">
              {state.tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="rounded-[24px] border border-white/70 p-4 shadow-[0_12px_28px_rgba(30,24,77,0.06)]"
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.98), ${categoryColors[task.category]}12)`
                  }}
                >
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
                  <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">{task.smartReason}</p>
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
                  Rendu plus net et plus premium pour suivre le rythme du foyer.
                </p>
              </div>
            </div>
            <div className="h-[260px] rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,240,255,0.82))] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgress}>
                  <defs>
                    <linearGradient id="weekly-progress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D5EF4" stopOpacity={0.88} />
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
                  Vision claire entre taches, routines et postes de charge.
                </p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="h-[260px] rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,240,255,0.82))] p-3 sm:h-[300px] lg:h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tasksByCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={54}
                      outerRadius={82}
                      paddingAngle={4}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid max-h-[300px] gap-3 overflow-y-auto pr-1">
                {tasksByCategory.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,255,0.92))] px-4 py-3"
                  >
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
        <MetricCard
          label="Taches en retard"
          value={`${state.tasks.filter((task) => task.status !== "done").length}`}
          hint="Actions encore ouvertes avec impact indirect sur le quotidien"
        />
        <MetricCard
          label="Depenses evitables"
          value={formatCurrency(summary.savings.currentMonthlyCost)}
          hint="Montant mensuel identifie entre sorties, repas et organisation"
          tone="coral"
        />
        <MetricCard
          label="Temps gagne"
          value="2 h 40"
          hint="Charge mentale redistribuee sur la semaine grace au reequilibrage"
          tone="mint"
        />
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,240,255,0.92))]">
          <div className="space-y-4 p-6">
            <Clock3 className="h-5 w-5 text-[var(--brand-primary)]" />
            <h3 className="text-lg font-semibold">Charge mentale</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Les routines du soir, les repas et le suivi budget sont les 3 zones ou l'application apporte le plus de clarte.
            </p>
          </div>
        </Card>
        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,248,245,0.94))]">
          <div className="space-y-4 p-6">
            <Wallet className="h-5 w-5 text-[var(--brand-coral)]" />
            <h3 className="text-lg font-semibold">Depenses evitables</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              {formatCurrency(summary.savings.currentMonthlyCost)} / mois identifies entre routines non optimisees et habitudes a lisser.
            </p>
          </div>
        </Card>
        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,250,255,0.94))]">
          <div className="space-y-4 p-6">
            <Sparkles className="h-5 w-5 text-[var(--brand-mint-strong)]" />
            <h3 className="text-lg font-semibold">Version plus premium</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Le rendu de l'app gagne en profondeur, en relief et en lisibilite pour approcher une experience plus haut de gamme.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
