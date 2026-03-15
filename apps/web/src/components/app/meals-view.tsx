"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

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
const DIETS = ["omnivore", "vegetarien", "vegan", "sans porc", "halal", "sans lactose", "sans gluten"];
const FLAGS = [
  { key: "childFriendly", label: "Enfant-friendly" },
  { key: "budgetTight", label: "Budget serré" },
  { key: "quickMeals", label: "Repas rapides" },
  { key: "batchCooking", label: "Batch cooking" },
  { key: "healthyFocus", label: "Équilibré / healthy" }
] as const;

export function MealsView() {
  const [rows, setRows] = useState<MealRow[]>([]);
  const [goal, setGoal] = useState("equilibre");
  const [servings, setServings] = useState(4);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<any>({ diets: [], allergies: [], avoids: [], healthy_focus: true });

  const load = async () => {
    setLoading(true);
    const [mealsRes, prefsRes] = await Promise.all([fetch(`/api/meals?weekStart=${weekStart()}`), fetch("/api/meal-preferences")]);
    if (mealsRes.ok) setRows(await mealsRes.json());
    if (prefsRes.ok) setPrefs(await prefsRes.json());
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const byDay = useMemo(() => days.map((label, i) => ({
    label,
    dayOfWeek: i,
    lunch: rows.find((r) => r.dayOfWeek === i && r.mealType === "lunch")?.title ?? "",
    dinner: rows.find((r) => r.dayOfWeek === i && r.mealType === "dinner")?.title ?? ""
  })), [rows]);

  const savePrefs = async () => {
    const payload = {
      diets: prefs.diets ?? [], allergies: String(prefs.allergies ?? "").split(",").map((v: string) => v.trim()).filter(Boolean),
      avoids: String(prefs.avoids ?? "").split(",").map((v: string) => v.trim()).filter(Boolean),
      childFriendly: Boolean(prefs.child_friendly), budgetTight: Boolean(prefs.budget_tight), quickMeals: Boolean(prefs.quick_meals),
      batchCooking: Boolean(prefs.batch_cooking), healthyFocus: Boolean(prefs.healthy_focus), notes: prefs.notes ?? ""
    };
    const res = await fetch("/api/meal-preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) setError("Impossible de sauvegarder les préférences alimentaires.");
  };

  const saveMeal = async (dayOfWeek: number, mealType: "lunch" | "dinner", title: string) => {
    const normalized = title.trim(); if (!normalized) return;
    setSaving(`${dayOfWeek}-${mealType}`);
    const res = await fetch("/api/meals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weekStart: weekStart(), dayOfWeek, mealType, title: normalized }) });
    if (!res.ok) { setError("Impossible de sauvegarder le repas."); setSaving(null); return; }
    const saved = await res.json();
    setRows((prev) => [...prev.filter((r) => !(r.dayOfWeek === dayOfWeek && r.mealType === mealType)), saved]);
    setSaving(null);
  };

  const adaptWithAi = async (dayOfWeek: number, mealType: "lunch" | "dinner") => {
    setError(null);
    const res = await fetch("/api/ai/meal-suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal, dayOfWeek, mealType, servings }) });
    if (!res.ok) return setError("Suggestion IA indisponible pour le moment.");
    const data = await res.json();
    if (!data?.title) return setError("Réponse IA non exploitable.");
    await saveMeal(dayOfWeek, mealType, data.title);
  };

  return (<div className="space-y-4">
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between"><Badge variant="white">Repas & IA</Badge><Button variant="secondary" onClick={() => void savePrefs()}>Sauver préférences</Button></div>
      <div className="grid gap-2 md:grid-cols-3">
        <select multiple className="rounded-xl border px-3 py-2 text-sm" value={prefs.diets ?? []} onChange={(e) => setPrefs((p: any) => ({ ...p, diets: Array.from(e.target.selectedOptions).map((o) => o.value) }))}>{DIETS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
        <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Allergies (virgules)" value={Array.isArray(prefs.allergies) ? prefs.allergies.join(", ") : prefs.allergies ?? ""} onChange={(e) => setPrefs((p: any) => ({ ...p, allergies: e.target.value }))} />
        <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Aliments à éviter" value={Array.isArray(prefs.avoids) ? prefs.avoids.join(", ") : prefs.avoids ?? ""} onChange={(e) => setPrefs((p: any) => ({ ...p, avoids: e.target.value }))} />
      </div>
      <div className="mt-2 flex flex-wrap gap-3">{FLAGS.map((f) => <label key={f.key} className="text-xs"><input type="checkbox" checked={Boolean(prefs[f.key.replace(/([A-Z])/g, "_$1").toLowerCase()])} onChange={(e) => setPrefs((p: any) => ({ ...p, [f.key.replace(/([A-Z])/g, "_$1").toLowerCase()]: e.target.checked }))} /> {f.label}</label>)}</div>
    </Card>

    <Card className="p-4">
      <div className="grid gap-2 md:grid-cols-2"><select className="rounded-xl border px-3 py-2 text-sm" value={goal} onChange={(e) => setGoal(e.target.value)}><option value="rapide">Rapide</option><option value="economique">Économique</option><option value="equilibre">Équilibré</option><option value="batch">Batch</option></select><input type="number" className="rounded-xl border px-3 py-2 text-sm" value={servings} onChange={(e) => setServings(Number(e.target.value))} /></div>
    </Card>

    {error ? <p className="text-sm text-red-500">{error}</p> : null}
    {loading ? <Card><div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--foreground-muted)]"><LoaderCircle className="h-4 w-4 animate-spin" />Chargement des repas...</div></Card> :
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{byDay.map((row) => <Card key={row.label} className="p-4"><p className="font-semibold">{row.label}</p>
        <div className="mt-2 text-xs">Déjeuner</div><input className="w-full rounded border px-2 py-1" value={row.lunch} onChange={(e) => setRows((prev) => [...prev.filter((r) => !(r.dayOfWeek === row.dayOfWeek && r.mealType === "lunch")), { dayOfWeek: row.dayOfWeek, mealType: "lunch", title: e.target.value }])} onBlur={(e) => void saveMeal(row.dayOfWeek, "lunch", e.target.value)} />
        <Button size="sm" variant="secondary" className="mt-1" onClick={() => void adaptWithAi(row.dayOfWeek, "lunch")}><Sparkles className="mr-1 h-3 w-3" />IA</Button>
        <div className="mt-2 text-xs">Dîner</div><input className="w-full rounded border px-2 py-1" value={row.dinner} onChange={(e) => setRows((prev) => [...prev.filter((r) => !(r.dayOfWeek === row.dayOfWeek && r.mealType === "dinner")), { dayOfWeek: row.dayOfWeek, mealType: "dinner", title: e.target.value }])} onBlur={(e) => void saveMeal(row.dayOfWeek, "dinner", e.target.value)} />
        <Button size="sm" variant="secondary" className="mt-1" onClick={() => void adaptWithAi(row.dayOfWeek, "dinner")}><Sparkles className="mr-1 h-3 w-3" />IA</Button>
        {saving?.startsWith(String(row.dayOfWeek)) ? <p className="mt-1 text-xs text-[var(--foreground-muted)]">Sauvegarde...</p> : null}
      </Card>)}</div>}
  </div>);
}
