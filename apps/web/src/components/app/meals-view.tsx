"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Sparkles, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const weekStart = () => {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
};

type MealRow = { id?: string; dayOfWeek: number; mealType: "lunch" | "dinner"; title: string; notes?: string };

export function MealsView() {
  const [rows, setRows] = useState<MealRow[]>([]);
  const [goal, setGoal] = useState("equilibre");
  const [servings, setServings] = useState(4);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    const res = await fetch(`/api/meals?weekStart=${weekStart()}`);
    if (!res.ok) {
      setLoadError("Impossible de charger les repas.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const byDay = useMemo(
    () =>
      days.map((label, i) => {
        const lunch = rows.find((r) => r.dayOfWeek === i && r.mealType === "lunch")?.title ?? "";
        const dinner = rows.find((r) => r.dayOfWeek === i && r.mealType === "dinner")?.title ?? "";
        return { label, dayOfWeek: i, lunch, dinner };
      }),
    [rows]
  );

  const saveMeal = async (dayOfWeek: number, mealType: "lunch" | "dinner", title: string) => {
    const normalized = title.trim();
    if (!normalized) return;
    setSaveError(null);
    setSaving(`${dayOfWeek}-${mealType}`);
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: weekStart(), dayOfWeek, mealType, title: normalized })
    });
    if (!res.ok) {
      setSaveError("Impossible de sauvegarder le repas.");
      setSaving(null);
      return;
    }
    const saved = await res.json();
    setRows((prev) => [...prev.filter((r) => !(r.dayOfWeek === dayOfWeek && r.mealType === mealType)), saved]);
    setSaving(null);
  };

  const adaptWithAi = async (dayOfWeek: number, mealType: "lunch" | "dinner") => {
    const res = await fetch("/api/ai/meal-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, dayOfWeek, mealType, servings })
    });
    if (!res.ok) return;
    const data = await res.json();
    await saveMeal(dayOfWeek, mealType, data.title);
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#0f766e_0%,#0d9488_30%,#14b8a6_70%,#5eead4_100%)] text-white shadow-[0_25px_70px_rgba(20,184,166,0.35)]">
        <div className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div className="space-y-2">
            <Badge variant="white">Repas semaine</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Planning repas clair, joli et persistant</h2>
            <p className="text-sm text-white/80">Éditez, laissez l’IA suggérer, et retrouvez vos repas sans perte.</p>
          </div>
          <div className="grid gap-2 text-black sm:grid-cols-2 md:grid-cols-1">
            <select className="rounded-xl bg-white px-3 py-2 text-sm" value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="rapide">Rapide</option>
              <option value="economique">Économique</option>
              <option value="equilibre">Équilibré</option>
              <option value="batch">Batch cooking</option>
            </select>
            <input className="w-full rounded-xl bg-white px-3 py-2 text-sm" type="number" min={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--foreground-muted)]">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Chargement des repas...
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {byDay.map((row) => (
            <Card key={row.label} className="overflow-hidden border border-[#d1fae5] bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_100%)]">
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-[#0f172a]">{row.label}</p>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">{servings} pers.</span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0f766e]">Déjeuner</p>
                  <input
                    className="w-full rounded-xl border border-[#99f6e4] bg-white px-3 py-2 text-sm"
                    value={row.lunch}
                    placeholder="Ex: Salade complète"
                    onChange={(e) =>
                      setRows((prev) => [
                        ...prev.filter((r) => !(r.dayOfWeek === row.dayOfWeek && r.mealType === "lunch")),
                        { dayOfWeek: row.dayOfWeek, mealType: "lunch", title: e.target.value }
                      ])
                    }
                    onBlur={(e) => void saveMeal(row.dayOfWeek, "lunch", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0f766e]">Dîner</p>
                    <Button size="sm" variant="secondary" onClick={() => void adaptWithAi(row.dayOfWeek, "dinner")}>
                      <Sparkles className="mr-1 h-3.5 w-3.5" /> IA
                    </Button>
                  </div>
                  <input
                    className="w-full rounded-xl border border-[#99f6e4] bg-white px-3 py-2 text-sm"
                    value={row.dinner}
                    placeholder="Ex: Poulet et légumes"
                    onChange={(e) =>
                      setRows((prev) => [
                        ...prev.filter((r) => !(r.dayOfWeek === row.dayOfWeek && r.mealType === "dinner")),
                        { dayOfWeek: row.dayOfWeek, mealType: "dinner", title: e.target.value }
                      ])
                    }
                    onBlur={(e) => void saveMeal(row.dayOfWeek, "dinner", e.target.value)}
                  />
                </div>

                {saving === `${row.dayOfWeek}-lunch` || saving === `${row.dayOfWeek}-dinner` ? (
                  <p className="text-xs text-teal-700">Sauvegarde...</p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      {(loadError ?? saveError) ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{loadError ?? saveError}</p>
      ) : null}

      <Card>
        <div className="flex items-center gap-3 p-4 text-sm text-[var(--foreground-muted)]">
          <UtensilsCrossed className="h-4 w-4" />
          Les repas sont sauvegardés automatiquement et peuvent être pré-remplis après l’assistant IA.
        </div>
      </Card>
    </div>
  );
}
