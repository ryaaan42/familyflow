import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createAiHouseholdPlan,
  type AiHouseholdRequest
} from "@/lib/ai/familyflow-ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";
import { bootstrapDefaultTasksIfEmpty, listTasksForCurrentUser, persistAiPlanTasks } from "@/lib/supabase/task-actions";

export const runtime = "nodejs";

const getCurrentMonthPeriod = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
};

const requestSchema = z.object({
  profile: z.any(),
  tasks: z.array(z.any()),
  budgetItems: z.array(z.any()),
  birthListItems: z.array(z.any()).default([]),
  onboardingAnswers: z.record(z.any()).optional(),
  autoApplyTasks: z.boolean().optional().default(true)
});

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const { data: profile } = await supabase.from("users").select("plan").eq("id", user.id).maybeSingle();
  const { start, end } = getCurrentMonthPeriod();
  const { data: usageCounter } = await supabase
    .from("usage_counters")
    .select("id, usage_count")
    .eq("user_id", user.id)
    .eq("metric", "ai_generations")
    .eq("period_start", start)
    .maybeSingle();

  const currentUsage = Number(usageCounter?.usage_count ?? 0);
  if ((profile?.plan as string | undefined) === "free" && currentUsage >= 3) {
    return NextResponse.json({ error: "Limite du plan gratuit atteinte (3 suggestions IA/mois)." }, { status: 402 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Payload IA invalide." }, { status: 400 });

  const aiRequest: AiHouseholdRequest = {
    profile: parsed.data.profile,
    tasks: parsed.data.tasks,
    budgetItems: parsed.data.budgetItems,
    birthListItems: parsed.data.birthListItems ?? [],
    onboardingAnswers: parsed.data.onboardingAnswers
  };

  const plan = await createAiHouseholdPlan(aiRequest);

  if (usageCounter?.id) {
    await supabase.from("usage_counters").update({ usage_count: currentUsage + 1 }).eq("id", usageCounter.id);
  } else {
    await supabase.from("usage_counters").insert({
      user_id: user.id,
      household_id: household.household.id,
      metric: "ai_generations",
      period_start: start,
      period_end: end,
      usage_count: 1
    });
  }

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
      ...(plan.routineSuggestions ?? []).map((item) => ({ suggestion_type: "routine", title: item.title, body: item.steps.join(" · "), metadata: item })),
      ...plan.routines.map((item) => ({ suggestion_type: "routine", title: null, body: item, metadata: {} })),
      ...plan.savingsMoves.map((item) => ({ suggestion_type: "budget", title: null, body: item, metadata: {} })),
      ...(plan.budgetSuggestions ?? []).map((item) => ({ suggestion_type: "budget", title: "Budget", body: item, metadata: {} })),
      ...(plan.notes ?? []).map((item) => ({ suggestion_type: "note", title: null, body: item, metadata: {} }))
    ];

    if (suggestions.length) {
      await supabase.from("ai_suggestions").insert(
        suggestions.map((s) => ({
          generation_id: generation.id,
          household_id: household.household.id,
          suggestion_type: s.suggestion_type,
          title: s.title,
          body: s.body,
          metadata: s.metadata,
          is_active: true
        }))
      );
    }
  }

  if (parsed.data.autoApplyTasks) {
    await persistAiPlanTasks({ householdId: household.household.id, plan });
  }

  const tasks = await listTasksForCurrentUser();
  if (!tasks.length) {
    await bootstrapDefaultTasksIfEmpty();
  }

  const refreshedTasks = await listTasksForCurrentUser();
  return NextResponse.json({ ...plan, tasks: refreshedTasks });
}
