"use client";

import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { UtensilsCrossed, Sun, Moon, Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Meal = { lunch: string; dinner: string; tag?: string; tagColor?: string };

const days: string[] = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const childMeals: Meal[] = [
  { lunch: "Pâtes bolognaise maison",    dinner: "Soupe de légumes + tartines", tag: "Facile", tagColor: "emerald" },
  { lunch: "Poulet rôti + haricots verts", dinner: "Omelette fromage + salade",  tag: "Équilibré", tagColor: "blue" },
  { lunch: "Gratin de courgettes",        dinner: "Poêlée de riz + légumes",     tag: "Veggie", tagColor: "lime" },
  { lunch: "Nuggets maison + purée",      dinner: "Pizza maison légère",         tag: "Plaisir", tagColor: "orange" },
  { lunch: "Steak haché + carotte râpée", dinner: "Curry doux + riz basmati",    tag: "Complet", tagColor: "violet" },
  { lunch: "Crêpes + compote",            dinner: "Ratatouille + semoule",       tag: "Veggie", tagColor: "lime" },
  { lunch: "Salade de pâtes colorée",     dinner: "Restes créatifs du frigo",    tag: "Zéro gaspi", tagColor: "teal" },
];

const adultMeals: Meal[] = [
  { lunch: "Buddha bowl quinoa & avocat",    dinner: "Soupe miso + tartines grillées", tag: "Healthy", tagColor: "emerald" },
  { lunch: "Poisson vapeur + légumes grillés", dinner: "Wrap veggie houmous",           tag: "Léger", tagColor: "blue" },
  { lunch: "Salade niçoise",                 dinner: "Curry de légumes + naan",        tag: "Veggie", tagColor: "lime" },
  { lunch: "Poulet teriyaki + riz",          dinner: "Frittata épinards + salade",     tag: "Protéiné", tagColor: "orange" },
  { lunch: "Bowl poke thon",                 dinner: "Tarte flambée légère",           tag: "Exotique", tagColor: "violet" },
  { lunch: "Risotto champignons",            dinner: "Brunch œufs-avocat",             tag: "Gourmet", tagColor: "amber" },
  { lunch: "Tartines avocat-saumon",         dinner: "Ramen maison simplifié",         tag: "Tendance", tagColor: "teal" },
];

const tagColors: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue:    "bg-blue-100 text-blue-700",
  lime:    "bg-lime-100 text-lime-700",
  orange:  "bg-orange-100 text-orange-700",
  violet:  "bg-violet-100 text-violet-700",
  teal:    "bg-teal-100 text-teal-700",
  amber:   "bg-amber-100 text-amber-700",
};

const dayAccents = [
  "from-indigo-500 to-violet-500",
  "from-pink-500 to-rose-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-purple-500 to-pink-500",
  "from-teal-500 to-cyan-500",
];

export function MealsView() {
  const profile = useFamilyFlowStore((s) => s.profile);
  const isVeg   = false; // Future: from user settings

  const plan = useMemo(() => {
    const useChildMeals = profile.household.childrenCount > 0;
    const base = useChildMeals ? childMeals : adultMeals;
    return days.map((day, i) => ({ day, ...base[i % base.length] }));
  }, [profile.household.childrenCount]);

  const veggieCount  = plan.filter((d) => d.tag === "Veggie").length;
  const healthyCount = plan.filter((d) => ["Healthy", "Léger", "Équilibré"].includes(d.tag ?? "")).length;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="overflow-hidden hero-teal text-white hero-glow-teal premium-shell">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="space-y-3">
            <Badge variant="white">Planning repas</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              7 jours de repas pensés pour vous.
            </h2>
            <p className="text-sm leading-6 text-white/75">
              Plan généré selon la composition de votre foyer. Inclus automatiquement dans votre PDF hebdomadaire.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium">
                {profile.household.childrenCount > 0 ? "Menu famille" : "Menu adultes"}
              </span>
              {isVeg && <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-medium"><Leaf className="h-3 w-3" /> Végétarien</span>}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {[
              { label: "Repas cette semaine", value: "14" },
              { label: "Plats végétariens",   value: String(veggieCount) },
              { label: "Repas équilibrés",    value: String(healthyCount) },
            ].map((s) => (
              <div key={s.label} className="rounded-[18px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-white/60">{s.label}</p>
                <p className="mt-1 text-3xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Weekly grid */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plan.map((row, i) => (
          <Card key={row.day} className="overflow-hidden">
            <div className="p-5">
              {/* Day header */}
              <div className={`mb-4 -mx-5 -mt-5 bg-gradient-to-r ${dayAccents[i]} px-5 py-3`}>
                <p className="text-sm font-bold text-white">{row.day}</p>
                {row.tag && (
                  <span className="mt-0.5 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {row.tag}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <Sun className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">Midi</p>
                    <p className="text-sm font-medium text-[#1f2937]">{row.lunch}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                    <Moon className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">Soir</p>
                    <p className="text-sm font-medium text-[#1f2937]">{row.dinner}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info note */}
      <Card>
        <div className="flex items-center gap-3 p-4">
          <div className="rounded-[12px] bg-teal-100 p-2.5 text-teal-600">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <p className="text-sm text-[var(--foreground-muted)]">
            Ce planning est généré automatiquement. La personnalisation avancée (régimes, allergies, préférences) sera disponible prochainement.
          </p>
        </div>
      </Card>
    </div>
  );
}
