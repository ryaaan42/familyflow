"use client";

import { useEffect, useMemo, useState } from "react";
import { UtensilsCrossed, Sparkles } from "lucide-react";

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

  const load = async () => {
    const res = await fetch(`/api/meals?weekStart=${weekStart()}`);
    if (!res.ok) return;
    const data = await res.json();
    setRows(data ?? []);
  };

  useEffect(() => { void load(); }, []);

  const byDay = useMemo(() => days.map((label, i) => {
    const lunch = rows.find((r) => r.dayOfWeek === i && r.mealType === "lunch")?.title ?? "—";
    const dinner = rows.find((r) => r.dayOfWeek === i && r.mealType === "dinner")?.title ?? "—";
    return { label, dayOfWeek: i, lunch, dinner };
  }), [rows]);

  const saveMeal = async (dayOfWeek: number, mealType: "lunch" | "dinner", title: string) => {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: weekStart(), dayOfWeek, mealType, title })
    });
    if (res.ok) {
      const saved = await res.json();
      setRows((prev) => [...prev.filter((r) => !(r.dayOfWeek === dayOfWeek && r.mealType === mealType)), saved]);
    }
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
      <Card className="overflow-hidden hero-teal text-white hero-glow-teal premium-shell">
        <div className="grid gap-4 p-6 md:grid-cols-[1fr_auto]">
          <div>
            <Badge variant="white">Planning repas</Badge>
            <h2 className="mt-2 text-3xl font-bold">Repas modifiables et persistés</h2>
          </div>
          <div className="flex gap-2 text-black">
            <select className="rounded-xl bg-white px-3" value={goal} onChange={(e) => setGoal(e.target.value)}><option value="rapide">Rapide</option><option value="economique">Économique</option><option value="equilibre">Équilibré</option><option value="batch">Batch cooking</option></select>
            <input className="w-20 rounded-xl bg-white px-3" type="number" min={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} />
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {byDay.map((row) => (
          <Card key={row.label}><div className="space-y-2 p-4"><p className="font-semibold">{row.label}</p>
            <input className="w-full rounded-xl border px-3 py-2 text-sm" value={row.lunch} onChange={(e) => setRows((prev)=>[...prev.filter((r)=>!(r.dayOfWeek===row.dayOfWeek&&r.mealType==='lunch')),{dayOfWeek: row.dayOfWeek, mealType:'lunch', title:e.target.value}])} onBlur={(e)=>void saveMeal(row.dayOfWeek,'lunch',e.target.value)} />
            <div className="flex gap-2"><input className="w-full rounded-xl border px-3 py-2 text-sm" value={row.dinner} onChange={(e) => setRows((prev)=>[...prev.filter((r)=>!(r.dayOfWeek===row.dayOfWeek&&r.mealType==='dinner')),{dayOfWeek: row.dayOfWeek, mealType:'dinner', title:e.target.value}])} onBlur={(e)=>void saveMeal(row.dayOfWeek,'dinner',e.target.value)} />
            <Button size="sm" variant="secondary" onClick={() => void adaptWithAi(row.dayOfWeek, "dinner")}><Sparkles className="h-3.5 w-3.5" /></Button></div>
          </div></Card>
        ))}
      </div>

      <Card><div className="flex items-center gap-3 p-4 text-sm text-[var(--foreground-muted)]"><UtensilsCrossed className="h-4 w-4" />Les repas sont sauvegardés à chaque édition et retrouvés après refresh.</div></Card>
    </div>
  );
}
