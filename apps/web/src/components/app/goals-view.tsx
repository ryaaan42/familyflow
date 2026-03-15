"use client";

import { useState, useEffect, useCallback } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { CheckCircle2, Plus, Target, Trash2, TrendingUp, X } from "lucide-react";
import type { HouseholdGoal, GoalCategory, GoalStatus } from "@familyflow/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  budget: "Budget",
  sante: "Santé",
  organisation: "Organisation",
  education: "Éducation",
  sport: "Sport",
  ecologie: "Écologie",
  autre: "Autre"
};

const CATEGORY_COLORS: Record<GoalCategory, string> = {
  budget: "bg-amber-100 text-amber-700",
  sante: "bg-rose-100 text-rose-700",
  organisation: "bg-violet-100 text-violet-700",
  education: "bg-blue-100 text-blue-700",
  sport: "bg-emerald-100 text-emerald-700",
  ecologie: "bg-green-100 text-green-700",
  autre: "bg-gray-100 text-gray-600"
};

const STATUS_LABEL: Record<GoalStatus, string> = {
  active: "En cours",
  completed: "Atteint",
  abandoned: "Abandonné"
};

const GOAL_UNIT_OPTIONS = ["€", "%", "fois", "heures", "jours", "km", "sessions"];

interface AddGoalFormProps {
  onSave: (data: { title: string; description?: string; targetValue?: number; unit?: string; category: GoalCategory; dueDate?: string }) => Promise<boolean>;
  onClose: () => void;
}

function AddGoalForm({ onSave, onClose }: AddGoalFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<GoalCategory>("organisation");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const saved = await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        targetValue: targetValue ? Number(targetValue) : undefined,
        unit: unit.trim() || undefined,
        category,
        dueDate: dueDate || undefined
      });
      if (saved) onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Nouvel objectif</h3>
          <button type="button" onClick={onClose}><X className="h-4 w-4 text-[var(--foreground-muted)]" /></button>
        </div>
        <div className="space-y-3">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'objectif*" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optionnel)" rows={2} className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="Valeur cible" className="rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]">
              <option value="">Unité</option>
              {GOAL_UNIT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)} className="rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" disabled={!title.trim() || saving} onClick={() => void handleSubmit()}>Créer l'objectif</Button>
        </div>
      </div>
    </div>
  );
}

interface ProgressModalProps {
  goal: HouseholdGoal;
  onUpdate: (id: string, currentValue: number) => Promise<void>;
  onClose: () => void;
}

function ProgressModal({ goal, onUpdate, onClose }: ProgressModalProps) {
  const [value, setValue] = useState(String(goal.currentValue));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]">
        <h3 className="mb-1 text-base font-semibold">Mettre à jour la progression</h3>
        <p className="mb-3 text-sm text-[var(--foreground-muted)]">{goal.title}</p>
        <div className="flex items-center gap-2">
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]" />
          {goal.unit && <span className="text-sm text-[var(--foreground-muted)]">{goal.unit}</span>}
        </div>
        {goal.targetValue && (
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">Objectif : {goal.targetValue} {goal.unit ?? ""}</p>
        )}
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" onClick={async () => { await onUpdate(goal.id, Number(value)); onClose(); }}>Valider</Button>
        </div>
      </div>
    </div>
  );
}

export function GoalsView() {
  const householdName = useFamilyFlowStore((s) => s.profile.household.name);
  const [goals, setGoals] = useState<HouseholdGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<HouseholdGoal | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      if (res.ok) setGoals(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const addGoal = async (data: Parameters<AddGoalFormProps["onSave"]>[0]) => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, currentValue: 0 })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFeedback(data.error ?? "Impossible de créer l'objectif.");
      return false;
    }
    const g: HouseholdGoal = await res.json();
    setGoals((prev) => [g, ...prev]);
    setFeedback("Objectif enregistré.");
    return true;
  };

  const updateProgress = async (id: string, currentValue: number) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue })
    });
    if (!res.ok) {
      setFeedback("Impossible de mettre à jour la progression.");
      return;
    }
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, currentValue } : g));
    setFeedback("Progression sauvegardée.");
  };

  const markStatus = async (id: string, status: GoalStatus) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      setFeedback("Impossible de mettre à jour le statut.");
      return;
    }
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
    setFeedback("Statut mis à jour.");
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const active = goals.filter((g) => g.status === "active");
  const done = goals.filter((g) => g.status !== "active");

  const progress = (g: HouseholdGoal) =>
    g.targetValue ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : null;

  return (
    <div className="space-y-5">
      {feedback ? <p className="rounded-xl bg-indigo-50 px-4 py-2 text-sm text-indigo-700">{feedback}</p> : null}

      {/* Hero */}
      <Card className="overflow-hidden hero-blue text-white hero-glow premium-shell">
        <div className="grid gap-6 p-7 md:grid-cols-[1.3fr_0.7fr] md:p-8">
          <div className="space-y-4">
            <Badge variant="white">Objectifs & Défis</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Fixez vos ambitions familiales</h2>
            <p className="max-w-2xl text-[15px] leading-7 text-white/78">
              Définissez des objectifs concrets pour {householdName} et suivez leur progression ensemble : budget, santé, écologie, organisation…
            </p>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel objectif
            </Button>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {[
              { label: "En cours", value: active.length, color: "text-white" },
              { label: "Atteints", value: goals.filter((g) => g.status === "completed").length, color: "text-emerald-300" }
            ].map((s) => (
              <div key={s.label} className="rounded-[22px] border border-white/18 bg-white/10 px-5 py-4 backdrop-blur-md">
                <p className="text-sm text-white/66">{s.label}</p>
                <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="py-8 text-center text-sm text-[var(--foreground-muted)]">Chargement…</p>
      ) : goals.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Target className="h-10 w-10 text-[var(--foreground-subtle)]" />
            <p className="font-medium">Aucun objectif pour l'instant</p>
            <p className="text-sm text-[var(--foreground-muted)]">Créez votre premier objectif familial.</p>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un objectif
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {active.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {active.map((goal) => {
                const pct = progress(goal);
                return (
                  <Card key={goal.id} className="overflow-hidden">
                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[goal.category as GoalCategory]}`}>
                            {CATEGORY_LABELS[goal.category as GoalCategory]}
                          </span>
                          <h3 className="text-base font-semibold">{goal.title}</h3>
                          {goal.description && <p className="text-sm text-[var(--foreground-muted)]">{goal.description}</p>}
                        </div>
                        <button type="button" onClick={() => remove(goal.id)} className="shrink-0 rounded-xl p-1.5 text-[var(--foreground-subtle)] hover:bg-rose-100 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {pct !== null && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--foreground-muted)]">{goal.currentValue} {goal.unit ?? ""}</span>
                            <span className="font-semibold">{pct} %</span>
                            <span className="text-[var(--foreground-muted)]">{goal.targetValue} {goal.unit ?? ""}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--card-muted)]">
                            <div
                              className="h-2 rounded-full bg-[linear-gradient(90deg,#6D5EF4,#56C7A1)] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {goal.dueDate && (
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Échéance : {new Date(goal.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="flex-1" onClick={() => setEditing(goal)}>
                          <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                          Progression
                        </Button>
                        <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600" onClick={() => void markStatus(goal.id, "completed")}>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Atteint !
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {done.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--foreground-muted)]">Objectifs terminés</p>
              <div className="grid gap-3 md:grid-cols-2">
                {done.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between gap-3 rounded-[24px] border border-[var(--border)] bg-white/60 px-4 py-3 opacity-70">
                    <div>
                      <p className="text-sm font-medium line-through">{goal.title}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{STATUS_LABEL[goal.status as GoalStatus]}</p>
                    </div>
                    <button type="button" onClick={() => remove(goal.id)} className="rounded-xl p-1.5 text-[var(--foreground-subtle)] hover:bg-rose-100 hover:text-rose-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && <AddGoalForm onSave={addGoal} onClose={() => setShowAdd(false)} />}
      {editing && <ProgressModal goal={editing} onUpdate={updateProgress} onClose={() => setEditing(null)} />}
    </div>
  );
}
