"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  categoryColors,
  selectDashboardSummary,
  useFamilyFlowStore
} from "@familyflow/shared";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  ListTodo,
  Settings2,
  Sparkles,
  Users,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import { MetricCard } from "./metric-card";

const weeklyProgress = [
  { day: "Lun", rate: 0 },
  { day: "Mar", rate: 0 },
  { day: "Mer", rate: 0 },
  { day: "Jeu", rate: 0 },
  { day: "Ven", rate: 0 },
  { day: "Sam", rate: 0 },
  { day: "Dim", rate: 0 }
];

const DASHBOARD_WIDGETS = [
  { id: "focus", label: "Focus du jour" },
  { id: "progress", label: "Progression hebdomadaire" },
  { id: "categories", label: "Répartition des catégories" },
  { id: "metrics", label: "KPIs du foyer" },
  { id: "insights", label: "Insights organisation" },
  { id: "notes", label: "Bloc-notes rapide" }
] as const;

type DashboardWidgetId = (typeof DASHBOARD_WIDGETS)[number]["id"];

const createDefaultWidgets = (): Record<DashboardWidgetId, boolean> => ({
  focus: true,
  progress: true,
  categories: true,
  metrics: true,
  insights: true,
  notes: true
});

function EmptyDashboard({ householdName, userName }: { householdName: string; userName: string }) {
  return (
    <div className="space-y-5">
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(18,18,48,0.96),rgba(68,60,167,0.92),rgba(67,139,230,0.86),rgba(86,199,161,0.78))] text-white hero-glow">
        <div className="p-7 md:p-8 space-y-4">
          <div className="space-y-2">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Dashboard familial</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              Bienvenue, {userName.split(" ")[0]} !
            </h2>
          </div>
          <p className="max-w-2xl text-[15px] leading-7 text-white/78">
            Votre foyer <strong className="text-white">{householdName}</strong> est prêt. Commencez par ajouter vos membres et configurer vos premières tâches.
          </p>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="space-y-4 p-6">
            <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 w-fit text-[var(--brand-primary)]">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Gérer le foyer</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Ajoutez et modifiez les membres de votre famille.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/app/household">Voir le foyer</Link>
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="space-y-4 p-6">
            <div className="rounded-2xl bg-[rgba(86,199,161,0.14)] p-3 w-fit text-[var(--brand-mint-strong)]">
              <ListTodo className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Premières tâches</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Créez vos premières tâches et répartissez-les entre les membres.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/app/tasks">Voir les tâches</Link>
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="space-y-4 p-6">
            <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 w-fit text-[var(--brand-coral)]">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Budget du mois</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Renseignez vos revenus et dépenses pour suivre votre budget.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/app/budget">Voir le budget</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function DashboardView() {
  const state = useFamilyFlowStore();
  const summary = selectDashboardSummary(state);

  const hasTasks = state.tasks.length > 0;
  const [widgets, setWidgets] = useState<Record<DashboardWidgetId, boolean>>(createDefaultWidgets);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const rawWidgets = window.localStorage.getItem("planille-dashboard-widgets");
    const rawNotes = window.localStorage.getItem("planille-dashboard-notes");

    if (rawWidgets) {
      try {
        const parsed = JSON.parse(rawWidgets) as Partial<Record<DashboardWidgetId, boolean>>;
        setWidgets({ ...createDefaultWidgets(), ...parsed });
      } catch {
        setWidgets(createDefaultWidgets());
      }
    }

    if (rawNotes) {
      setNotes(rawNotes);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("planille-dashboard-widgets", JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    window.localStorage.setItem("planille-dashboard-notes", notes);
  }, [notes]);

  if (!hasTasks && state.budgetItems.length === 0) {
    return (
      <EmptyDashboard
        householdName={state.profile.household.name}
        userName={state.user.displayName || "vous"}
      />
    );
  }

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

  const chartData = hasTasks ? weeklyProgress : weeklyProgress;
  const activeWidgets = useMemo(
    () => DASHBOARD_WIDGETS.filter((widget) => widgets[widget.id]),
    [widgets]
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(18,18,48,0.96),rgba(68,60,167,0.92),rgba(67,139,230,0.86),rgba(86,199,161,0.78))] text-white hero-glow">
          <div className="grid gap-8 p-7 md:grid-cols-[1.08fr_0.92fr] md:p-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <Badge className="w-fit bg-white/14 text-white shadow-none">Dashboard familial</Badge>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                  Bonjour {(state.user.displayName || "").split(" ")[0]}, votre foyer est mieux orchestré cette semaine.
                </h2>
              </div>
              <p className="max-w-3xl text-[15px] leading-7 text-white/78">
                {hasTasks
                  ? `Bravo, ${summary.completionRate} % des tâches sont déjà terminées.`
                  : "Commencez à ajouter vos tâches pour suivre votre progression."}{" "}
                {summary.savings.annualSavings > 0
                  ? `En réduisant une sortie cinéma par mois, vous gardez environ ${formatCurrency(summary.savings.annualSavings)} sur l'année.`
                  : ""}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm text-white/64">Tâches intelligentes</p>
                  <p className="mt-3 text-3xl font-semibold">{smartTasks}</p>
                  <p className="mt-2 text-sm text-white/72">proposées automatiquement</p>
                </div>
                <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm text-white/64">Routines quotidiennes</p>
                  <p className="mt-3 text-3xl font-semibold">{dailyRoutines}</p>
                  <p className="mt-2 text-sm text-white/72">à afficher sur le frigo</p>
                </div>
                <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm text-white/64">Budget restant</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {summary.disposableIncome !== 0 ? formatCurrency(summary.disposableIncome) : "—"}
                  </p>
                  <p className="mt-2 text-sm text-white/72">après charges mensuelles</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-white/18 bg-white/12 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/66">Membre le plus chargé</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {summary.busiestMember?.member.name ?? "Aucun"}
                    </p>
                  </div>
                  <Badge className="bg-white/12 text-white shadow-none">
                    {hasTasks ? `${summary.completionRate} % terminés` : "0 %"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  {summary.busiestMember
                    ? `${summary.busiestMember.load} minutes attribuées cette semaine.`
                    : "Ajoutez des tâches pour voir la répartition de la charge."}
                </p>
              </div>

              <div className="rounded-[30px] border border-white/18 bg-white/12 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/66">Économies potentielles</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {summary.savings.monthlySavings > 0
                        ? formatCurrency(summary.savings.monthlySavings)
                        : "—"}
                    </p>
                  </div>
                  <Sparkles className="h-5 w-5 text-white/86" />
                </div>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  {summary.savings.monthlySavings > 0
                    ? "Les scénarios liés aux repas, courses et sorties restent les leviers les plus rapides à actionner."
                    : "Ajoutez des scénarios d'économies pour visualiser vos potentiels gains."}
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
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Priorités à surveiller</h3>
              </div>
              <BarChart3 className="h-5 w-5 text-[var(--brand-primary)]" />
            </div>
            {widgets.focus && state.tasks.length > 0 ? (
              <div className="grid gap-3">
                {state.tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[24px] border border-white/70 p-4 shadow-[0_12px_28px_rgba(30,24,77,0.06)]"
                    style={{
                      background: `linear-gradient(180deg, rgba(255,255,255,0.98), ${categoryColors[task.category] ?? "#f0f0f0"}12)`
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                          {state.profile.members.find((member) => member.id === task.assignedMemberId)?.name ?? "À assigner"}
                        </p>
                      </div>
                      <Badge variant={task.status === "done" ? "mint" : "outline"}>
                        {task.status === "done" ? "Terminé" : "À faire"}
                      </Badge>
                    </div>
                    {task.smartReason ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">{task.smartReason}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : widgets.focus ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-[var(--border)] py-10 text-center">
                <ListTodo className="h-8 w-8 text-[var(--foreground-subtle)]" />
                <p className="text-sm text-[var(--foreground-muted)]">Aucune tâche pour l'instant</p>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/app/tasks">Créer une tâche</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">Widget désactivé dans la configuration.</p>
            )}
          </div>
        </Card>
      </section>

      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Widgets du dashboard</h3>
              <p className="text-sm text-[var(--foreground-muted)]">Activez uniquement les blocs utiles pour votre foyer.</p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Settings2 className="h-4 w-4" />
              {activeWidgets.length} actifs
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {DASHBOARD_WIDGETS.map((widget) => (
              <label
                key={widget.id}
                className="flex items-center justify-between rounded-[20px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,255,0.92))] px-4 py-3"
              >
                <span className="text-sm font-medium">{widget.label}</span>
                <input
                  type="checkbox"
                  checked={widgets[widget.id]}
                  onChange={(event) =>
                    setWidgets((current) => ({
                      ...current,
                      [widget.id]: event.target.checked
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        {widgets.progress ? (
        <Card>
          <div className="space-y-4 p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Progression hebdomadaire</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Suivi du rythme du foyer semaine après semaine.
                </p>
              </div>
            </div>
            <div className="h-[260px] rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,240,255,0.82))] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
        ) : null}

        {widgets.categories ? (
        <Card>
          <div className="space-y-4 p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Répartition des catégories</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Vision claire entre tâches, routines et postes de charge.
                </p>
              </div>
            </div>
            {tasksByCategory.length > 0 ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-[var(--border)] py-10 text-center">
                <p className="text-sm text-[var(--foreground-muted)]">Aucune tâche à afficher</p>
              </div>
            )}
          </div>
        </Card>
        ) : null}
      </section>

      {widgets.metrics ? (
      <section className="grid gap-5 md:grid-cols-3">
        <MetricCard
          label="Tâches en retard"
          value={`${state.tasks.filter((task) => task.status !== "done").length}`}
          hint="Actions encore ouvertes avec impact indirect sur le quotidien"
        />
        <MetricCard
          label="Dépenses évitables"
          value={summary.savings.currentMonthlyCost > 0 ? formatCurrency(summary.savings.currentMonthlyCost) : "—"}
          hint="Montant mensuel identifié entre sorties, repas et organisation"
          tone="coral"
        />
        <MetricCard
          label="Temps gagné"
          value={hasTasks ? "2 h 40" : "—"}
          hint="Charge mentale redistribuée sur la semaine grâce au rééquilibrage"
          tone="mint"
        />
      </section>
      ) : null}

      {widgets.insights || widgets.notes ? (
      <section className="grid gap-5 md:grid-cols-3">
        {widgets.insights ? (
        <>
        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,240,255,0.92))]">
          <div className="space-y-4 p-6">
            <Clock3 className="h-5 w-5 text-[var(--brand-primary)]" />
            <h3 className="text-lg font-semibold">Charge mentale</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Les routines du soir, les repas et le suivi budget sont les 3 zones où l'application apporte le plus de clarté.
            </p>
          </div>
        </Card>
        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,248,245,0.94))]">
          <div className="space-y-4 p-6">
            <Wallet className="h-5 w-5 text-[var(--brand-coral)]" />
            <h3 className="text-lg font-semibold">Dépenses évitables</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              {summary.savings.currentMonthlyCost > 0
                ? `${formatCurrency(summary.savings.currentMonthlyCost)} / mois identifiés entre routines non optimisées et habitudes à lisser.`
                : "Ajoutez des scénarios d'économies pour identifier vos dépenses évitables."}
            </p>
          </div>
        </Card>
        <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,250,255,0.94))]">
          <div className="space-y-4 p-6">
            <Sparkles className="h-5 w-5 text-[var(--brand-mint-strong)]" />
            <h3 className="text-lg font-semibold">Assistant IA</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Obtenez des recommandations personnalisées pour optimiser la gestion de votre foyer.
            </p>
          </div>
        </Card>
        </>
        ) : null}
        {widgets.notes ? (
          <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,252,245,0.94))] md:col-span-3">
            <div className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">Bloc-notes du foyer</h3>
              <p className="text-sm text-[var(--foreground-muted)]">Idéal pour noter les imprévus, courses urgentes et rappels scolaires.</p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-[var(--border)] bg-white/90 p-3 text-sm outline-none focus:border-[var(--brand-primary)]"
                placeholder="Ex: Jeudi 18h -> rendez-vous pédiatre, penser à prendre le carnet de santé."
              />
            </div>
          </Card>
        ) : null}
      </section>
      ) : null}
    </div>
  );
}
