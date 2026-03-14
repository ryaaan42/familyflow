"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { Reorder } from "framer-motion";
import {
  categoryColors,
  selectDashboardSummary,
  useFamilyFlowStore
} from "@familyflow/shared";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  GripVertical,
  ListTodo,
  Settings2,
  Sparkles,
  Users,
  Wallet,
  X
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

// ── Widget definitions ────────────────────────────────────────────────────────

const ALL_WIDGET_IDS = [
  "focus",
  "budget_kpi",
  "progress_chart",
  "categories",
  "metrics",
  "insight_cards"
] as const;

type WidgetId = (typeof ALL_WIDGET_IDS)[number];

const WIDGET_LABELS: Record<WidgetId, string> = {
  focus: "Focus du jour",
  budget_kpi: "Budget du mois",
  progress_chart: "Progression hebdomadaire",
  categories: "Répartition des catégories",
  metrics: "Métriques clés",
  insight_cards: "Insights du foyer"
};

const STORAGE_KEY = "ff_dashboard_widgets";

function loadWidgetConfig(): { order: WidgetId[]; hidden: Set<WidgetId> } {
  if (typeof window === "undefined") return { order: [...ALL_WIDGET_IDS], hidden: new Set() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: [...ALL_WIDGET_IDS], hidden: new Set() };
    const parsed = JSON.parse(raw) as { order?: string[]; hidden?: string[] };
    const order = (parsed.order ?? [...ALL_WIDGET_IDS]).filter((id): id is WidgetId =>
      ALL_WIDGET_IDS.includes(id as WidgetId)
    );
    const hidden = new Set(
      (parsed.hidden ?? []).filter((id): id is WidgetId =>
        ALL_WIDGET_IDS.includes(id as WidgetId)
      )
    );
    return { order, hidden };
  } catch {
    return { order: [...ALL_WIDGET_IDS], hidden: new Set() };
  }
}

function saveWidgetConfig(order: WidgetId[], hidden: Set<WidgetId>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ order, hidden: [...hidden] })); } catch {}
}

const weeklyProgress = [
  { day: "Lun", rate: 0 }, { day: "Mar", rate: 0 }, { day: "Mer", rate: 0 },
  { day: "Jeu", rate: 0 }, { day: "Ven", rate: 0 }, { day: "Sam", rate: 0 }, { day: "Dim", rate: 0 }
];

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyDashboard({ householdName, userName }: { householdName: string; userName: string }) {
  return (
    <div className="space-y-5">
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(18,18,48,0.96),rgba(68,60,167,0.92),rgba(67,139,230,0.86),rgba(86,199,161,0.78))] text-white hero-glow">
        <div className="p-7 md:p-8 space-y-4">
          <Badge className="w-fit bg-white/14 text-white shadow-none">Dashboard familial</Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Bienvenue, {userName.split(" ")[0]} !</h2>
          <p className="max-w-2xl text-[15px] leading-7 text-white/78">
            Votre foyer <strong className="text-white">{householdName}</strong> est prêt. Commencez par ajouter vos membres et configurer vos premières tâches.
          </p>
        </div>
      </Card>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          { href: "/app/household", icon: Users, bg: "bg-[rgba(109,94,244,0.12)]", color: "text-[var(--brand-primary)]", title: "Gérer le foyer", desc: "Ajoutez et modifiez les membres de votre famille." },
          { href: "/app/tasks", icon: ListTodo, bg: "bg-[rgba(86,199,161,0.14)]", color: "text-[var(--brand-mint-strong)]", title: "Premières tâches", desc: "Créez vos premières tâches et répartissez-les." },
          { href: "/app/budget", icon: Wallet, bg: "bg-[rgba(255,126,107,0.14)]", color: "text-[var(--brand-coral)]", title: "Budget du mois", desc: "Renseignez vos revenus et dépenses." }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.href} className="overflow-hidden">
              <div className="space-y-4 p-6">
                <div className={`rounded-2xl ${item.bg} p-3 w-fit ${item.color}`}><Icon className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">{item.desc}</p>
                <Button asChild variant="secondary" className="w-full"><Link href={item.href}>Accéder</Link></Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Customize panel ───────────────────────────────────────────────────────────

interface CustomizePanelProps {
  order: WidgetId[];
  hidden: Set<WidgetId>;
  onSave: (order: WidgetId[], hidden: Set<WidgetId>) => void;
  onClose: () => void;
}

function CustomizePanel({ order, hidden, onSave, onClose }: CustomizePanelProps) {
  const [localOrder, setLocalOrder] = useState<WidgetId[]>(order);
  const [localHidden, setLocalHidden] = useState<Set<WidgetId>>(new Set(hidden));

  const toggle = (id: WidgetId) =>
    setLocalHidden((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Personnaliser le dashboard</h2>
            <p className="text-xs text-[var(--foreground-muted)]">Glisse pour réordonner · coche pour afficher</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[var(--foreground-muted)] hover:bg-[var(--card-muted)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Reorder.Group axis="y" values={localOrder} onReorder={setLocalOrder} className="space-y-2">
          {localOrder.map((id) => (
            <Reorder.Item key={id} value={id} className="flex cursor-grab items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 active:cursor-grabbing">
              <GripVertical className="h-4 w-4 shrink-0 text-[var(--foreground-subtle)]" />
              <span className="flex-1 text-sm font-medium">{WIDGET_LABELS[id]}</span>
              <input type="checkbox" checked={!localHidden.has(id)} onChange={() => toggle(id)} className="accent-[var(--brand-primary)]" />
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <Button className="mt-5 w-full" onClick={() => { onSave(localOrder, localHidden); onClose(); }}>Appliquer</Button>
      </div>
    </div>
  );
}

// ── Main DashboardView ────────────────────────────────────────────────────────

export function DashboardView() {
  const state = useFamilyFlowStore();
  const summary = selectDashboardSummary(state);
  const hasTasks = state.tasks.length > 0;
  const [showCustomize, setShowCustomize] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState(() => loadWidgetConfig());

  const handleSave = useCallback((order: WidgetId[], hidden: Set<WidgetId>) => {
    saveWidgetConfig(order, hidden);
    setWidgetConfig({ order, hidden });
  }, []);

  const isVisible = (id: WidgetId) => !widgetConfig.hidden.has(id);

  if (!hasTasks && state.budgetItems.length === 0) {
    return <EmptyDashboard householdName={state.profile.household.name} userName={state.user.displayName || "vous"} />;
  }

  const tasksByCategory = Object.entries(
    state.tasks.reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value, fill: categoryColors[name] }));

  const dailyRoutines = state.tasks.filter((t) => t.frequency === "quotidienne").length;
  const smartTasks = state.tasks.filter((t) => t.origin === "smart").length;

  const renderWidget = (id: WidgetId) => {
    if (!isVisible(id)) return null;
    switch (id) {
      case "focus":
        return (
          <Card key="focus" className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.94))]">
            <div className="space-y-5 p-7">
              <div className="flex items-center justify-between">
                <div><Badge>Focus du jour</Badge><h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Priorités à surveiller</h3></div>
                <BarChart3 className="h-5 w-5 text-[var(--brand-primary)]" />
              </div>
              {hasTasks ? (
                <div className="grid gap-3">
                  {state.tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="rounded-[24px] border border-white/70 p-4 shadow-[0_12px_28px_rgba(30,24,77,0.06)]"
                      style={{ background: `linear-gradient(180deg,rgba(255,255,255,0.98),${categoryColors[task.category] ?? "#f0f0f0"}12)` }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                            {state.profile.members.find((m) => m.id === task.assignedMemberId)?.name ?? "À assigner"}
                          </p>
                        </div>
                        <Badge variant={task.status === "done" ? "mint" : "outline"}>{task.status === "done" ? "Terminé" : "À faire"}</Badge>
                      </div>
                      {task.smartReason && <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">{task.smartReason}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-[var(--border)] py-10 text-center">
                  <ListTodo className="h-8 w-8 text-[var(--foreground-subtle)]" />
                  <p className="text-sm text-[var(--foreground-muted)]">Aucune tâche</p>
                  <Button asChild size="sm" variant="secondary"><Link href="/app/tasks">Créer</Link></Button>
                </div>
              )}
            </div>
          </Card>
        );
      case "budget_kpi":
        return (
          <Card key="budget_kpi">
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]"><Wallet className="h-5 w-5" /></div>
                <div><h3 className="text-xl font-semibold">Budget du mois</h3><p className="text-sm text-[var(--foreground-muted)]">Revenu, charges, reste à vivre</p></div>
              </div>
              {state.budgetItems.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Revenus", value: state.budgetItems.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0), color: "text-emerald-600" },
                    { label: "Charges", value: state.budgetItems.filter((i) => i.type !== "income").reduce((s, i) => s + i.amount, 0), color: "text-blue-600" },
                    { label: "Reste", value: summary.disposableIncome, color: summary.disposableIncome >= 0 ? "text-violet-600" : "text-rose-600" }
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-[22px] bg-[var(--card-muted)] p-4 text-center">
                      <p className="text-xs text-[var(--foreground-muted)]">{kpi.label}</p>
                      <p className={`mt-1 text-xl font-bold ${kpi.color}`}>{formatCurrency(kpi.value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--border)] py-8 text-center">
                  <p className="text-sm text-[var(--foreground-muted)]">Aucune donnée budgétaire</p>
                  <Button asChild size="sm" variant="secondary" className="mt-3"><Link href="/app/budget">Remplir le budget</Link></Button>
                </div>
              )}
            </div>
          </Card>
        );
      case "progress_chart":
        return (
          <Card key="progress_chart">
            <div className="space-y-4 p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]"><CheckCircle2 className="h-5 w-5" /></div>
                <div><h3 className="text-xl font-semibold">Progression hebdomadaire</h3><p className="text-sm text-[var(--foreground-muted)]">Suivi du rythme du foyer</p></div>
              </div>
              <div className="h-[240px] rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,240,255,0.82))] p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyProgress}>
                    <defs><linearGradient id="wp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6D5EF4" stopOpacity={0.88}/><stop offset="95%" stopColor="#6D5EF4" stopOpacity={0.08}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E2FF" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="rate" stroke="#6D5EF4" fill="url(#wp)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        );
      case "categories":
        return (
          <Card key="categories">
            <div className="space-y-4 p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]"><Wallet className="h-5 w-5" /></div>
                <div><h3 className="text-xl font-semibold">Répartition des catégories</h3><p className="text-sm text-[var(--foreground-muted)]">Vision par type de tâche</p></div>
              </div>
              {tasksByCategory.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="h-[240px] rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,240,255,0.82))] p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={tasksByCategory} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={4} /><Tooltip /></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid max-h-[280px] gap-2 overflow-y-auto pr-1">
                    {tasksByCategory.map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,255,0.92))] px-4 py-3">
                        <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} /><span className="capitalize text-sm">{item.name}</span></div>
                        <span className="font-semibold text-sm">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[var(--foreground-muted)]">Aucune tâche à afficher</p>
              )}
            </div>
          </Card>
        );
      case "metrics":
        return (
          <div key="metrics" className="grid gap-5 md:grid-cols-3">
            <MetricCard label="Tâches en retard" value={`${state.tasks.filter((t) => t.status !== "done").length}`} hint="Actions encore ouvertes" />
            <MetricCard label="Dépenses évitables" value={summary.savings.currentMonthlyCost > 0 ? formatCurrency(summary.savings.currentMonthlyCost) : "—"} hint="Montant mensuel identifié" tone="coral" />
            <MetricCard label="Tâches intelligentes" value={`${smartTasks}`} hint="Proposées auto par l'IA" tone="mint" />
          </div>
        );
      case "insight_cards":
        return (
          <div key="insight_cards" className="grid gap-5 md:grid-cols-3">
            <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,240,255,0.92))]">
              <div className="space-y-4 p-6">
                <Clock3 className="h-5 w-5 text-[var(--brand-primary)]" />
                <h3 className="text-lg font-semibold">Charge mentale</h3>
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">{dailyRoutines} routine{dailyRoutines !== 1 ? "s" : ""} quotidienne{dailyRoutines !== 1 ? "s" : ""} active{dailyRoutines !== 1 ? "s" : ""}. Les routines du soir et les repas sont les zones où l'app apporte le plus de clarté.</p>
              </div>
            </Card>
            <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,248,245,0.94))]">
              <div className="space-y-4 p-6">
                <Wallet className="h-5 w-5 text-[var(--brand-coral)]" />
                <h3 className="text-lg font-semibold">Dépenses évitables</h3>
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">{summary.savings.currentMonthlyCost > 0 ? `${formatCurrency(summary.savings.currentMonthlyCost)} / mois identifiés entre routines non optimisées et habitudes à lisser.` : "Ajoutez des scénarios d'économies pour identifier vos dépenses évitables."}</p>
              </div>
            </Card>
            <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,250,255,0.94))]">
              <div className="space-y-4 p-6">
                <Sparkles className="h-5 w-5 text-[var(--brand-mint-strong)]" />
                <h3 className="text-lg font-semibold">Assistant IA</h3>
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">Obtenez des recommandations personnalisées pour optimiser la gestion de votre foyer.</p>
                <Button asChild size="sm" variant="secondary"><Link href="/app/assistant">Ouvrir l'assistant</Link></Button>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  // Pair widgets into two-column sections when adjacent
  const COL2_PAIRS: [WidgetId, WidgetId][] = [["focus", "budget_kpi"], ["progress_chart", "categories"]];
  const inPair = new Set(COL2_PAIRS.flat());
  const renderedPairs = new Set<string>();

  const blocks: React.ReactNode[] = [];
  for (const id of widgetConfig.order) {
    if (!inPair.has(id)) { blocks.push(renderWidget(id)); continue; }
    const pair = COL2_PAIRS.find((p) => p.includes(id));
    if (!pair) { blocks.push(renderWidget(id)); continue; }
    const pairKey = pair.join("|");
    if (renderedPairs.has(pairKey)) continue;
    renderedPairs.add(pairKey);
    const [a, b] = pair;
    const aOk = isVisible(a); const bOk = isVisible(b);
    if (aOk && bOk) blocks.push(<section key={pairKey} className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">{renderWidget(a)}{renderWidget(b)}</section>);
    else if (aOk) blocks.push(renderWidget(a));
    else if (bOk) blocks.push(renderWidget(b));
  }

  return (
    <>
      {showCustomize && (
        <CustomizePanel order={widgetConfig.order} hidden={widgetConfig.hidden} onSave={handleSave} onClose={() => setShowCustomize(false)} />
      )}
      <div className="space-y-5">
        {/* Hero — always first */}
        <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(18,18,48,0.96),rgba(68,60,167,0.92),rgba(67,139,230,0.86),rgba(86,199,161,0.78))] text-white hero-glow">
          <div className="grid gap-8 p-7 md:grid-cols-[1.18fr_0.82fr] md:p-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <Badge className="w-fit bg-white/14 text-white shadow-none">Dashboard familial</Badge>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Bonjour {(state.user.displayName || "").split(" ")[0]}, votre foyer est mieux orchestré cette semaine.</h2>
              </div>
              <p className="max-w-3xl text-[15px] leading-7 text-white/78">
                {hasTasks ? `${summary.completionRate} % des tâches sont déjà terminées.` : "Commencez à ajouter vos tâches pour suivre votre progression."}{" "}
                {summary.savings.annualSavings > 0 ? `Potentiel d'économie : ${formatCurrency(summary.savings.annualSavings)} / an.` : ""}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Tâches intelligentes", value: smartTasks, sub: "proposées auto" },
                  { label: "Routines quotidiennes", value: dailyRoutines, sub: "à afficher sur le frigo" },
                  { label: "Budget restant", value: summary.disposableIncome !== 0 ? formatCurrency(summary.disposableIncome) : "—", sub: "après charges mensuelles" }
                ].map((s) => (
                  <div key={s.label} className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
                    <p className="text-sm text-white/64">{s.label}</p>
                    <p className="mt-3 text-3xl font-semibold">{s.value}</p>
                    <p className="mt-2 text-sm text-white/72">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[30px] border border-white/18 bg-white/12 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/66">Membre le plus chargé</p>
                    <p className="mt-2 text-2xl font-semibold">{summary.busiestMember?.member.name ?? "Aucun"}</p>
                  </div>
                  <Badge className="bg-white/12 text-white shadow-none">{summary.completionRate} % terminés</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  {summary.busiestMember ? `${summary.busiestMember.load} min attribuées cette semaine.` : "Ajoutez des tâches pour voir la répartition."}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-[30px] border border-white/18 bg-white/12 p-5 backdrop-blur-md">
                <div>
                  <p className="text-sm text-white/66">Économies potentielles</p>
                  <p className="mt-2 text-2xl font-semibold">{summary.savings.monthlySavings > 0 ? formatCurrency(summary.savings.monthlySavings) : "—"}</p>
                </div>
                <button type="button" onClick={() => setShowCustomize(true)}
                  className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/20 transition">
                  <Settings2 className="h-4 w-4" />
                  Personnaliser
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Customizable widgets */}
        <div className="space-y-5">{blocks}</div>
      </div>
    </>
  );
}
