"use client";

import { useState, useEffect, useCallback } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { ChevronLeft, ChevronRight, Coffee, Moon, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import type { MealPlan } from "@familyflow/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return `${monday.toLocaleDateString("fr-FR", opts)} – ${sunday.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
}

interface EditModalProps {
  dayIndex: number;
  mealType: "lunch" | "dinner";
  initial: string;
  onSave: (title: string) => void;
  onClose: () => void;
}

function EditModal({ dayIndex, mealType, initial, onSave, onClose }: EditModalProps) {
  const [value, setValue] = useState(initial);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]">
        <h3 className="text-base font-semibold">
          {mealType === "lunch" ? "Midi" : "Soir"} · {DAYS[dayIndex]}
        </h3>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) { onSave(value.trim()); onClose(); } }}
          placeholder="Ex : Pâtes bolognaise, Restes, Sortie…"
          className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
        />
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" disabled={!value.trim()} onClick={() => { if (value.trim()) { onSave(value.trim()); onClose(); } }}>Enregistrer</Button>
        </div>
      </div>
    </div>
  );
}

export function MealsView() {
  const householdName = useFamilyFlowStore((s) => s.profile.household.name);
  const [monday, setMonday] = useState(() => getMonday(new Date()));
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<{ dayIndex: number; mealType: "lunch" | "dinner" } | null>(null);

  const weekStart = toIso(monday);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals?weekStart=${weekStart}`);
      if (res.ok) setMeals(await res.json());
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { void load(); }, [load]);

  const getMeal = (dayIndex: number, mealType: "lunch" | "dinner") =>
    meals.find((m) => m.dayOfWeek === dayIndex && m.mealType === mealType);

  const saveMeal = async (dayIndex: number, mealType: "lunch" | "dinner", title: string) => {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, dayOfWeek: dayIndex, mealType, title })
    });
    if (res.ok) {
      const saved: MealPlan = await res.json();
      setMeals((prev) => {
        const filtered = prev.filter((m) => !(m.dayOfWeek === dayIndex && m.mealType === mealType));
        return [...filtered, saved];
      });
    }
  };

  const deleteMeal = async (id: string) => {
    await fetch(`/api/meals?id=${id}`, { method: "DELETE" });
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const mealSlotClass = (filled: boolean) =>
    `group relative flex min-h-[68px] flex-col gap-1 rounded-[20px] border p-3 transition ${
      filled
        ? "border-[var(--border)] bg-white shadow-sm"
        : "border-dashed border-[var(--border)] bg-[var(--card-muted)] hover:border-[var(--brand-primary)] hover:bg-[rgba(109,94,244,0.04)] cursor-pointer"
    }`;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(18,18,48,0.96),rgba(68,60,167,0.92),rgba(72,160,110,0.86),rgba(86,199,161,0.78))] text-white hero-glow">
        <div className="grid gap-6 p-7 md:grid-cols-[1.3fr_0.7fr] md:p-8">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Planning repas</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Planifiez vos repas de la semaine</h2>
            <p className="max-w-2xl text-[15px] leading-7 text-white/78">
              Remplissez chaque case midi et soir pour {householdName}. Le planning est exportable en PDF avec le reste du bilan hebdomadaire.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            {[
              { icon: Coffee, label: `${meals.filter((m) => m.mealType === "lunch").length} déjeuners planifiés` },
              { icon: Moon, label: `${meals.filter((m) => m.mealType === "dinner").length} dîners planifiés` },
              { icon: UtensilsCrossed, label: `${14 - meals.length} repas restants cette semaine` }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-[22px] border border-white/18 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <Icon className="h-4 w-4 text-white/80 shrink-0" />
                  <span className="text-sm text-white/90">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Week navigator */}
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={() => setMonday((m) => addDays(m, -7))}
          className="rounded-2xl border border-[var(--border)] bg-white p-2 hover:bg-[var(--card-muted)] transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">{formatWeekLabel(monday)}</p>
          {loading && <p className="text-xs text-[var(--foreground-muted)]">Chargement…</p>}
        </div>
        <button type="button" onClick={() => setMonday((m) => addDays(m, 7))}
          className="rounded-2xl border border-[var(--border)] bg-white p-2 hover:bg-[var(--card-muted)] transition">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {DAYS.map((day, i) => (
          <Card key={day} className="overflow-hidden">
            <div className="space-y-2 p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{SHORT[i]}</p>
                <p className="text-xs text-[var(--foreground-muted)]">{addDays(monday, i).getDate()}</p>
              </div>

              {/* Déjeuner */}
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                  <Coffee className="h-3 w-3" /> Midi
                </p>
                {(() => {
                  const meal = getMeal(i, "lunch");
                  if (meal) return (
                    <div className={mealSlotClass(true)}>
                      <p className="text-xs font-medium leading-4 pr-8">{meal.title}</p>
                      <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                        <button type="button" onClick={() => setEditing({ dayIndex: i, mealType: "lunch" })} className="rounded-lg p-1 hover:bg-[var(--card-muted)]"><Pencil className="h-3 w-3" /></button>
                        <button type="button" onClick={() => deleteMeal(meal.id)} className="rounded-lg p-1 hover:bg-rose-100 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  );
                  return (
                    <div className={mealSlotClass(false)} onClick={() => setEditing({ dayIndex: i, mealType: "lunch" })}>
                      <Plus className="h-3.5 w-3.5 text-[var(--foreground-subtle)] mx-auto my-auto" />
                    </div>
                  );
                })()}
              </div>

              {/* Dîner */}
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                  <Moon className="h-3 w-3" /> Soir
                </p>
                {(() => {
                  const meal = getMeal(i, "dinner");
                  if (meal) return (
                    <div className={mealSlotClass(true)}>
                      <p className="text-xs font-medium leading-4 pr-8">{meal.title}</p>
                      <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                        <button type="button" onClick={() => setEditing({ dayIndex: i, mealType: "dinner" })} className="rounded-lg p-1 hover:bg-[var(--card-muted)]"><Pencil className="h-3 w-3" /></button>
                        <button type="button" onClick={() => deleteMeal(meal.id)} className="rounded-lg p-1 hover:bg-rose-100 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  );
                  return (
                    <div className={mealSlotClass(false)} onClick={() => setEditing({ dayIndex: i, mealType: "dinner" })}>
                      <Plus className="h-3.5 w-3.5 text-[var(--foreground-subtle)] mx-auto my-auto" />
                    </div>
                  );
                })()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <EditModal
          dayIndex={editing.dayIndex}
          mealType={editing.mealType}
          initial={getMeal(editing.dayIndex, editing.mealType)?.title ?? ""}
          onSave={(title) => saveMeal(editing.dayIndex, editing.mealType, title)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
