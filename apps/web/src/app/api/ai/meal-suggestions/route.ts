import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { OPENAI_MODEL } from "@/lib/ai/model";
import { buildHouseholdAiContext } from "@/lib/ai/household-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const schema = z.object({
  goal: z.string().default("equilibre"),
  dayOfWeek: z.number().int().min(0).max(6).default(1),
  mealType: z.enum(["lunch", "dinner"]).default("dinner"),
  servings: z.number().int().min(1).max(12).default(4)
});

const fallbackMeals = ["Poêlée légumes + protéine", "Curry pois chiches", "Poisson + riz + légumes", "Pâtes complètes sauce tomate", "Bowl quinoa", "Omelette légumes"];

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const payload = schema.parse(await request.json().catch(() => ({})));
  const context = await buildHouseholdAiContext(supabase, household);

  const noPork = context.mealPreferences.avoids.some((v) => v.toLowerCase().includes("porc")) || context.mealPreferences.diets.includes("halal");
  const hasKids = household.members.some((m) => ["enfant", "bebe"].includes(m.memberCategory ?? ""));

  if (!process.env.OPENAI_API_KEY) {
    const idx = (payload.dayOfWeek + payload.servings) % fallbackMeals.length;
    return NextResponse.json({
      title: `${fallbackMeals[idx]} (${payload.servings} pers.)`,
      notes: `Objectif ${payload.goal} · ${hasKids ? "enfant-friendly" : "foyer adulte"}${noPork ? " · sans porc" : ""}`
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: `Tu proposes un repas unique en JSON {"title":"...","notes":"..."} pour ${payload.mealType} (jour ${payload.dayOfWeek}) pour ${payload.servings} personnes. Contraintes: ${JSON.stringify(context.mealPreferences)}. Membres: ${JSON.stringify(household.members.map((m) => ({name:m.name, age:m.age, category:m.memberCategory})))}. Objectifs: ${JSON.stringify(context.goals)}. Budget foyer: ${JSON.stringify(context.budgetSummary)}.`,
      max_output_tokens: 300
    })
  });

  if (!response.ok) return NextResponse.json({ error: "Suggestion IA indisponible" }, { status: 502 });
  const raw = await response.json() as { output_text?: string };
  try {
    const parsed = JSON.parse(raw.output_text ?? "{}");
    return NextResponse.json({ title: parsed.title, notes: parsed.notes ?? "" });
  } catch {
    return NextResponse.json({ error: "Réponse IA invalide" }, { status: 502 });
  }
}
