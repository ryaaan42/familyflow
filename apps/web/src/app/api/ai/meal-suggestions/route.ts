import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const base = {
  rapide: ["Salade complète", "Omelette légumes", "Wrap poulet crudités"],
  economique: ["Lentilles-carottes", "Riz sauté aux légumes", "Pâtes tomate-basilic"],
  equilibre: ["Poisson + quinoa + brocoli", "Poulet rôti + légumes", "Buddha bowl"],
  batch: ["Chili sin carne (batch)", "Lasagnes légumes (batch)", "Soupe maison (batch)"]
} as const;

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const { goal = "equilibre", dayOfWeek = 1, mealType = "dinner", servings = household.members.length } = await request.json().catch(() => ({}));
  const key = String(goal).toLowerCase();
  const options = base[key as keyof typeof base] ?? base.equilibre;
  const idx = (Number(dayOfWeek) + (mealType === "lunch" ? 1 : 0) + Number(servings)) % options.length;

  return NextResponse.json({
    title: `${options[idx]} (${servings} pers.)`,
    notes: `Adapté au foyer ${household.household.name} · objectif ${goal}`
  });
}
