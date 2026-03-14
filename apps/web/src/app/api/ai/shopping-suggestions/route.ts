import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const normalize = (v: string) => v.toLowerCase();

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const context = normalize(String(body.context ?? ""));

  const { data: meals } = await supabase
    .from("meal_plans")
    .select("title")
    .eq("household_id", household.household.id)
    .limit(30);

  const { data: goals } = await supabase
    .from("household_goals")
    .select("title, category")
    .eq("household_id", household.household.id)
    .is("deleted_at", null)
    .limit(20);

  const members = household.members.length;
  const hasKids = household.members.some((m) => (m.memberCategory ?? "") === "enfant" || (m.memberCategory ?? "") === "bebe");

  const items = new Set<string>();

  ["Légumes de saison", "Fruits", "Œufs", "Lait", "Pain complet", "Riz", "Pâtes", "Huile d'olive"].forEach((i) => items.add(i));
  if (members >= 4) ["Yaourts x12", "Pack eau", "Compotes familiales"].forEach((i) => items.add(i));
  if (hasKids) ["Purée nature", "Fromage râpé", "Bananes"].forEach((i) => items.add(i));

  const mealText = (meals ?? []).map((m) => normalize(String(m.title ?? ""))).join(" ");
  if (mealText.includes("curry") || context.includes("curry")) items.add("Lait de coco");
  if (mealText.includes("salade") || context.includes("léger")) ["Salade", "Tomates", "Concombre"].forEach((i) => items.add(i));
  if (mealText.includes("poulet")) items.add("Blancs de poulet");
  if (mealText.includes("poisson")) items.add("Poisson frais / surgelé");

  const goalText = (goals ?? []).map((g) => `${normalize(String(g.title ?? ""))} ${normalize(String(g.category ?? ""))}`).join(" ");
  if (goalText.includes("budget") || context.includes("budget")) {
    ["Légumineuses (lentilles/pois chiches)", "Flocons d'avoine", "Produits marque distributeur"].forEach((i) => items.add(i));
  }

  if (context.includes("veggie") || context.includes("végét")) ["Tofu", "Pois chiches", "Haricots rouges"].forEach((i) => items.add(i));
  if (context.includes("allerg") || context.includes("sans gluten")) ["Farine de riz", "Pâtes sans gluten"].forEach((i) => items.add(i));

  return NextResponse.json({
    items: Array.from(items).slice(0, 24),
    meta: {
      members,
      mealsConsidered: (meals ?? []).length,
      goalsConsidered: (goals ?? []).length
    }
  });
}
