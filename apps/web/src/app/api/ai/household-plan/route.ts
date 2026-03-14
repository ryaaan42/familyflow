import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createAiHouseholdPlan,
  type AiHouseholdRequest
} from "@/lib/ai/familyflow-ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

export const runtime = "nodejs";

const requestSchema = z.object({
  profile: z.any(),
  tasks: z.array(z.any()),
  budgetItems: z.array(z.any()),
  birthListItems: z.array(z.any()).default([])
});

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const household = await getUserHousehold();
  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload IA invalide." },
      { status: 400 }
    );
  }

  const aiRequest: AiHouseholdRequest = {
    profile: parsed.data.profile,
    tasks: parsed.data.tasks,
    budgetItems: parsed.data.budgetItems,
    birthListItems: parsed.data.birthListItems ?? []
  };
  const plan = await createAiHouseholdPlan(aiRequest);

  const { data: generation } = await supabase
    .from("ai_generations")
    .insert({
      household_id: household.household.id,
      created_by: user.id,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      status: plan.usedFallback ? "fallback" : "success",
      input_snapshot: aiRequest,
      output_payload: plan
    })
    .select("id")
    .single();

  if (generation?.id) {
    const suggestions = [
      ...plan.taskFocus.map((item) => ({ suggestion_type: "task", title: item.title, body: `${item.reason} — ${item.who} (${item.when})`, metadata: item })),
      ...plan.routines.map((item) => ({ suggestion_type: "routine", title: null, body: item, metadata: {} })),
      ...plan.savingsMoves.map((item) => ({ suggestion_type: "budget", title: null, body: item, metadata: {} }))
    ];

    if (suggestions.length) {
      await supabase.from("ai_suggestions").insert(
        suggestions.map((s) => ({
          generation_id: generation.id,
          household_id: household.household.id,
          suggestion_type: s.suggestion_type,
          title: s.title,
          body: s.body,
          metadata: s.metadata
        }))
      );
    }
  }

  return NextResponse.json(plan);
}
