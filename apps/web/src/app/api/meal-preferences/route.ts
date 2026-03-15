import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const schema = z.object({
  diets: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  avoids: z.array(z.string()).default([]),
  childFriendly: z.boolean().default(false),
  budgetTight: z.boolean().default(false),
  quickMeals: z.boolean().default(false),
  batchCooking: z.boolean().default(false),
  healthyFocus: z.boolean().default(true),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const { data } = await supabase.from("household_meal_preferences").select("*").eq("household_id", household.household.id).maybeSingle();
  return NextResponse.json(data ?? {
    diets: [], allergies: [], avoids: [], child_friendly: false, budget_tight: false,
    quick_meals: false, batch_cooking: false, healthy_focus: true, notes: ""
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Payload invalide" }, { status: 400 });

  const payload = parsed.data;
  const { data, error } = await supabase.from("household_meal_preferences").upsert({
    household_id: household.household.id,
    diets: payload.diets,
    allergies: payload.allergies,
    avoids: payload.avoids,
    child_friendly: payload.childFriendly,
    budget_tight: payload.budgetTight,
    quick_meals: payload.quickMeals,
    batch_cooking: payload.batchCooking,
    healthy_focus: payload.healthyFocus,
    notes: payload.notes || null
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("households").update({
    ai_context: {
      ...(household.household.aiContext ?? {}),
      foodConstraints: [payload.diets.join(", "), payload.avoids.join(", "), payload.allergies.join(", ")].filter(Boolean).join(" | "),
      mealPreferences: [payload.quickMeals ? "repas rapides" : "", payload.batchCooking ? "batch cooking" : "", payload.healthyFocus ? "healthy" : ""].filter(Boolean).join(", ")
    }
  }).eq("id", household.household.id);

  return NextResponse.json(data);
}
