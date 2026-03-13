"use client";

import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Card } from "@/components/ui/card";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function MealsView() {
  const profile = useFamilyFlowStore((s) => s.profile);
  const plan = useMemo(() => {
    const childFriendly = profile.household.childrenCount > 0;
    return days.map((day, index) => ({
      day,
      lunch: childFriendly ? ["Pâtes légumes", "Poulet rôti", "Salade fruits"][index % 3] : ["Bowl quinoa", "Poisson vapeur", "Wrap veggie"][index % 3],
      dinner: ["Soupe + tartines", "Omelette salade", "Curry doux", "Poêlée riz", "Gratin maison", "Pizza maison", "Restes créatifs"][index]
    }));
  }, [profile.household.childrenCount]);

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold">Planning repas familial</h2>
        <p className="text-sm text-[var(--foreground-muted)]">Plan généré automatiquement selon votre foyer. Il sera inclus dans le PDF hebdomadaire.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plan.map((row) => (
          <Card key={row.day} className="p-5">
            <p className="font-semibold text-[var(--brand-primary)]">{row.day}</p>
            <p className="mt-3 text-sm"><strong>Midi:</strong> {row.lunch}</p>
            <p className="mt-1 text-sm"><strong>Soir:</strong> {row.dinner}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
