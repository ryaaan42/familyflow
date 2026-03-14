"use client";

import { useMemo, useRef, useState } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { BudgetItem, BudgetMonth } from "@familyflow/shared";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  PiggyBank,
  Plus,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  income: "Revenus",
  fixed: "Charges fixes",
  variable: "Charges variables"
};

const categoryDots: Record<string, string> = {
  loyer_credit: "#468BFF",
  courses: "#FF8DB2",
  transport: "#3AB0FF",
  abonnements: "#A07BFF",
  loisirs: "#FFBF5A",
  sorties: "#FF7E6B",
  restaurant_fast_food: "#f25f8c",
  animaux: "#56C7A1",
  enfants: "#FFBF5A",
  sante: "#2ec5a1",
  imprevus: "#ffca4e",
  maison: "#6D5EF4"
};

const categoryLabels: Record<string, string> = {
  loyer_credit: "Loyer / Crédit",
  courses: "Courses",
  transport: "Transport",
  abonnements: "Abonnements",
  loisirs: "Loisirs",
  sorties: "Sorties",
  restaurant_fast_food: "Resto / Fast food",
  animaux: "Animaux",
  enfants: "Enfants",
  sante: "Santé",
  imprevus: "Imprévus",
  maison: "Maison"
};

const categoriesByType: Record<string, string[]> = {
  income: [],
  fixed: ["loyer_credit", "abonnements", "transport", "sante", "enfants", "animaux", "maison"],
  variable: ["courses", "restaurant_fast_food", "loisirs", "sorties", "imprevus", "animaux", "enfants"]
};

// ── AddItemModal ────────────────────────────────────────────────────────────

interface AddItemModalProps {
  budgetId: string;
  defaultType: "income" | "fixed" | "variable";
  onClose: () => void;
  onAdded: (item: BudgetItem) => void;
}

function AddItemModal({ budgetId, defaultType, onClose, onAdded }: AddItemModalProps) {
  const [type, setType] = useState<"income" | "fixed" | "variable">(defaultType);
  const [category, setCategory] = useState(categoriesByType[defaultType][0] ?? "maison");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [recurring, setRecurring] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (t: "income" | "fixed" | "variable") => {
    setType(t);
    setCategory(categoriesByType[t][0] ?? "maison");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !amount || parseFloat(amount) <= 0) {
      setError("Libellé et montant requis.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/budget/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetId,
          type,
          category: type === "income" ? "loyer_credit" : category,
          label: label.trim(),
          amount: parseFloat(amount),
          recurring
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur");
      onAdded({
        id: json.item.id,
        budgetId: json.item.budget_id,
        type: json.item.type,
        category: json.item.category,
        label: json.item.label,
        amount: Number(json.item.amount),
        recurring: json.item.recurring
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Ajouter une ligne</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--foreground-muted)] hover:bg-[var(--card-muted)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[var(--card-muted)] p-1">
            {(["income", "fixed", "variable"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  type === t
                    ? "bg-white shadow-sm text-[var(--brand-primary)]"
                    : "text-[var(--foreground-muted)]"
                }`}
              >
                {t === "income" ? "Revenu" : t === "fixed" ? "Fixe" : "Variable"}
              </button>
            ))}
          </div>

          {/* Category (only for fixed/variable) */}
          {type !== "income" && (
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <div className="flex flex-wrap gap-2">
                {categoriesByType[type].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                      category === cat
                        ? "border-transparent bg-[var(--brand-primary)] text-white"
                        : "border-[var(--border)] bg-white text-[var(--foreground-muted)] hover:border-[var(--brand-primary)]"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: categoryDots[cat] ?? "#9CA3AF" }}
                    />
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="item-label">
              {type === "income" ? "Source de revenu" : "Libellé"}
            </Label>
            <Input
              id="item-label"
              placeholder={
                type === "income"
                  ? "ex : Salaire net, Allocations..."
                  : type === "fixed"
                    ? "ex : Loyer, Assurance..."
                    : "ex : Supermarché, Ciné..."
              }
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="item-amount">Montant mensuel (€)</Label>
            <Input
              id="item-amount"
              type="number"
              min={0.01}
              step={0.01}
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Recurring toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
            />
            <span>Récurrent chaque mois</span>
          </label>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ajout…" : "Ajouter"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── TargetSavingsEditor ──────────────────────────────────────────────────────

interface TargetSavingsEditorProps {
  budgetId: string;
  current: number;
  onUpdated: (amount: number) => void;
}

function TargetSavingsEditor({ budgetId, current, onUpdated }: TargetSavingsEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(current));
  const [loading, setLoading] = useState(false);

  const save = async () => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < 0) return;
    setLoading(true);
    await fetch("/api/budget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budgetId, targetSavings: amount })
    });
    setLoading(false);
    setEditing(false);
    onUpdated(amount);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={10}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28 rounded-xl border border-white/40 bg-white/20 px-3 py-1 text-2xl font-bold text-white placeholder-white/50 focus:outline-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-white/20 px-3 py-1 text-sm font-semibold text-white hover:bg-white/30"
        >
          {loading ? "…" : "OK"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-white/60 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => { setValue(String(current)); setEditing(true); }}
      className="group flex items-center gap-2"
    >
      <p className="text-3xl font-bold">{formatCurrency(current)}</p>
      <Pencil className="h-4 w-4 text-white/40 transition group-hover:text-white/80" />
    </button>
  );
}

// ── BudgetView ───────────────────────────────────────────────────────────────

interface BudgetViewProps {
  initialBudget?: BudgetMonth;
  initialItems?: BudgetItem[];
}

export function BudgetView({ initialBudget, initialItems }: BudgetViewProps) {
  const initialized = useRef(false);
  const addBudgetItem = useFamilyFlowStore((s) => s.addBudgetItem);
  const removeBudgetItem = useFamilyFlowStore((s) => s.removeBudgetItem);
  const setTargetSavings = useFamilyFlowStore((s) => s.setTargetSavings);
  const budget = useFamilyFlowStore((s) => s.budget);
  const budgetItems = useFamilyFlowStore((s) => s.budgetItems);

  // Seed the store once with server-fetched data
  if (!initialized.current && initialBudget) {
    initialized.current = true;
    useFamilyFlowStore.setState({
      budget: initialBudget,
      budgetItems: initialItems ?? []
    });
  }

  const [modal, setModal] = useState<"income" | "fixed" | "variable" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const income = budgetItems.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
    const fixed = budgetItems.filter((i) => i.type === "fixed").reduce((s, i) => s + i.amount, 0);
    const variable = budgetItems.filter((i) => i.type === "variable").reduce((s, i) => s + i.amount, 0);
    return { income, fixed, variable, remaining: income - fixed - variable };
  }, [budgetItems]);

  const savingsRate =
    summary.income > 0 ? Math.round((summary.remaining / summary.income) * 100) : 0;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/budget/items/${id}`, { method: "DELETE" });
    removeBudgetItem(id);
    setDeletingId(null);
  };

  const topCards = [
    {
      label: "Revenus mensuels",
      value: formatCurrency(summary.income),
      icon: TrendingUp,
      gradient: "from-emerald-400/20 via-teal-300/10 to-transparent",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      badge: "+stable",
      badgeColor: "bg-emerald-100 text-emerald-700",
      trendIcon: ArrowUpRight,
      trendColor: "text-emerald-600"
    },
    {
      label: "Charges fixes",
      value: formatCurrency(summary.fixed),
      icon: Receipt,
      gradient: "from-blue-400/20 via-indigo-300/10 to-transparent",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      badge: "Engagé",
      badgeColor: "bg-blue-100 text-blue-700",
      trendIcon: ArrowDownRight,
      trendColor: "text-blue-600"
    },
    {
      label: "Charges variables",
      value: formatCurrency(summary.variable),
      icon: TrendingDown,
      gradient: "from-amber-400/20 via-orange-300/10 to-transparent",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      badge: "À optimiser",
      badgeColor: "bg-amber-100 text-amber-700",
      trendIcon: AlertCircle,
      trendColor: "text-amber-600"
    },
    {
      label: "Reste à vivre",
      value: formatCurrency(summary.remaining),
      icon: Wallet,
      gradient:
        summary.remaining >= 0
          ? "from-violet-400/20 via-purple-300/10 to-transparent"
          : "from-red-400/20 via-rose-300/10 to-transparent",
      iconBg: summary.remaining >= 0 ? "bg-violet-100" : "bg-red-100",
      iconColor: summary.remaining >= 0 ? "text-violet-600" : "text-red-600",
      badge: `${savingsRate} % épargnés`,
      badgeColor:
        summary.remaining >= 0
          ? "bg-violet-100 text-violet-700"
          : "bg-red-100 text-red-700",
      trendIcon: summary.remaining >= 0 ? ArrowUpRight : ArrowDownRight,
      trendColor: summary.remaining >= 0 ? "text-violet-600" : "text-red-600"
    }
  ];

  const sectionColors: Record<string, { bg: string; text: string; btn: string }> = {
    income: { bg: "bg-emerald-50", text: "text-emerald-700", btn: "bg-emerald-600 hover:bg-emerald-700" },
    fixed: { bg: "bg-blue-50", text: "text-blue-700", btn: "bg-blue-600 hover:bg-blue-700" },
    variable: { bg: "bg-amber-50", text: "text-amber-700", btn: "bg-amber-600 hover:bg-amber-700" }
  };

  return (
    <>
      {modal && budget.id && (
        <AddItemModal
          budgetId={budget.id}
          defaultType={modal}
          onClose={() => setModal(null)}
          onAdded={(item) => { addBudgetItem(item); setModal(null); }}
        />
      )}

      <div className="space-y-5">
        {/* ── Hero ── */}
        <Card className="overflow-hidden hero-mint text-white hero-glow-mint premium-shell">
          <div className="flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Badge variant="white">Budget mensuel</Badge>
              <h2 className="text-3xl font-semibold tracking-[-0.03em]">Pilotez vos finances</h2>
              <p className="max-w-xl text-sm leading-6 text-white/78">
                Ajoutez vos revenus et charges pour avoir une vision claire de votre reste à vivre.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/16 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/66">Objectif d'épargne</p>
              <div className="mt-1">
                <TargetSavingsEditor
                  budgetId={budget.id}
                  current={budget.targetSavings}
                  onUpdated={(v) => setTargetSavings(v)}
                />
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-white/20">
                <div
                  className="h-2.5 rounded-full bg-[linear-gradient(90deg,#2ec5a1,#00a9ff)]"
                  style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/66">{savingsRate} % de l'objectif atteint</p>
            </div>
          </div>
        </Card>

        {/* ── KPI cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topCards.map((card) => {
            const Icon = card.icon;
            const TrendIcon = card.trendIcon;
            return (
              <Card key={card.label} className={`overflow-hidden bg-gradient-to-br ${card.gradient}`}>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <TrendIcon className={`h-4 w-4 ${card.trendColor}`} />
                  </div>
                  <p className="mt-4 text-2xl font-bold tracking-tight">{card.value}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm text-[var(--foreground-muted)]">{card.label}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <div className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[rgba(53,89,230,0.12)] p-3 text-[var(--brand-primary)]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-[-0.02em]">Détail des postes</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {budgetItems.length} ligne{budgetItems.length !== 1 ? "s" : ""} budgétaire{budgetItems.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {(["income", "fixed", "variable"] as const).map((type) => {
                const items = budgetItems.filter((i) => i.type === type);
                const total = items.reduce((s, i) => s + i.amount, 0);
                const c = sectionColors[type];

                return (
                  <div key={type} className="space-y-3">
                    {/* Section header */}
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.bg} ${c.text}`}>
                        {typeLabels[type]}
                      </span>
                      <div className="flex items-center gap-3">
                        {items.length > 0 && (
                          <span className="text-sm font-semibold text-[var(--foreground-muted)]">
                            {formatCurrency(total)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setModal(type)}
                          disabled={!budget.id}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition ${c.btn} disabled:opacity-40`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Ajouter
                        </button>
                      </div>
                    </div>

                    {/* Items */}
                    {items.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setModal(type)}
                        disabled={!budget.id}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-6 text-sm text-[var(--foreground-muted)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                        {type === "income"
                          ? "Ajouter un revenu"
                          : type === "fixed"
                            ? "Ajouter une charge fixe"
                            : "Ajouter une charge variable"}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="group flex items-center justify-between rounded-2xl border border-white/70 bg-white px-4 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: categoryDots[item.category] ?? "#9CA3AF" }}
                              />
                              <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-xs capitalize text-[var(--foreground-subtle)]">
                                  {categoryLabels[item.category] ?? item.category.replace(/_/g, " ")}
                                  {item.recurring ? " · récurrent" : " · ponctuel"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(item.amount)}</p>
                                <p className="text-xs text-[var(--foreground-subtle)]">
                                  {summary.income > 0
                                    ? Math.round((item.amount / summary.income) * 100)
                                    : 0}{" "}
                                  % du revenu
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                className="rounded-xl p-2 text-[var(--foreground-subtle)] opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 disabled:opacity-40"
                                title="Supprimer"
                              >
                                {deletingId === item.id ? (
                                  <span className="text-xs">…</span>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-5">
            {/* Savings goal */}
            <Card>
              <div className="space-y-5 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                    <PiggyBank className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Objectif du mois</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">Épargne visée et progression</p>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(46,197,161,0.14),rgba(0,169,255,0.08),rgba(255,255,255,0.98))] p-5">
                  <p className="text-sm text-[var(--foreground-muted)]">Cible mensuelle</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight">
                    {formatCurrency(budget.targetSavings)}
                  </p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,#2ec5a1,#00a9ff)]"
                      style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                    {savingsRate} % — {formatCurrency(summary.remaining)} disponibles ce mois
                  </p>
                </div>

                <div className="space-y-3">
                  {summary.variable > 0 && (
                    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <p className="text-sm font-semibold">Poste le plus sensible</p>
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {budgetItems
                          .filter((i) => i.type === "variable")
                          .sort((a, b) => b.amount - a.amount)[0]?.label ?? "—"}{" "}
                        — optimiser les dépenses variables est le levier le plus rapide.
                      </p>
                    </div>
                  )}
                  {summary.variable > 0 && (
                    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <p className="text-sm font-semibold">Potentiel d'économie</p>
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        En optimisant vos postes variables, vous pouvez dégager{" "}
                        <strong className="text-emerald-600">
                          +{formatCurrency(Math.round(summary.variable * 0.18))}/mois
                        </strong>
                        .
                      </p>
                    </div>
                  )}
                  {budgetItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card-muted)] p-4 text-center text-sm text-[var(--foreground-muted)]">
                      Ajoutez vos revenus et charges pour voir vos indicateurs.
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Répartition */}
            {summary.income > 0 && (
              <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.92))]">
                <div className="space-y-3 p-6">
                  <h3 className="font-semibold">Répartition du revenu</h3>
                  {[
                    {
                      label: "Charges fixes",
                      amount: summary.fixed,
                      pct: Math.round((summary.fixed / summary.income) * 100),
                      color: "bg-blue-400"
                    },
                    {
                      label: "Variables",
                      amount: summary.variable,
                      pct: Math.round((summary.variable / summary.income) * 100),
                      color: "bg-amber-400"
                    },
                    {
                      label: "Épargne",
                      amount: Math.max(summary.remaining, 0),
                      pct: Math.max(savingsRate, 0),
                      color: "bg-emerald-400"
                    }
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--foreground-muted)]">{row.label}</span>
                        <span className="font-semibold">
                          {row.pct} % · {formatCurrency(row.amount)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--card-muted)]">
                        <div
                          className={`h-2 rounded-full ${row.color}`}
                          style={{ width: `${Math.min(row.pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
