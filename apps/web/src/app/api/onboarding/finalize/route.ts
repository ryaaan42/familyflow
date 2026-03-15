import { NextResponse } from "next/server";

import { createAiHouseholdPlan } from "@/lib/ai/familyflow-ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";
import { bootstrapDefaultTasksIfEmpty, listTasksForCurrentUser, persistAiPlanTasks } from "@/lib/supabase/task-actions";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  await bootstrapDefaultTasksIfEmpty();

  const onboardingAnswers = {
    household: household.household,
    members: household.members,
    pets: household.pets
  };

  await supabase
    .from("onboarding_profiles")
    .upsert({
      household_id: household.household.id,
      created_by: user.id,
      objective: "tasks",
      answers: onboardingAnswers,
      completed_at: new Date().toISOString()
    });

  const currentTasks = await listTasksForCurrentUser();

  const { data: budgetItemsRaw } = await supabase
    .from("budget_items")
    .select("id, budget_id, type, category, label, amount, recurring")
    .limit(80);

  const { data: birthListItemsRaw } = await supabase
    .from("birth_list_items")
    .select("*")
    .eq("household_id", household.household.id)
    .limit(80);

  const plan = await createAiHouseholdPlan({
    profile: household,
    tasks: currentTasks,
    budgetItems: (budgetItemsRaw ?? []).map((item) => ({
      id: item.id as string,
      budgetId: item.budget_id as string,
      type: item.type as "income" | "fixed" | "variable",
      category: item.category as any,
      label: item.label as string,
      amount: Number(item.amount ?? 0),
      recurring: Boolean(item.recurring)
    })),
    birthListItems: (birthListItemsRaw ?? []).map((item) => ({
      id: item.id as string,
      householdId: item.household_id as string,
      title: item.title as string,
      description: (item.description as string | null) ?? undefined,
      category: item.category as any,
      priority: item.priority as any,
      status: item.status as any,
      quantity: Number(item.quantity ?? 1),
      reservedQuantity: Number(item.reserved_quantity ?? 0),
      estimatedPrice: item.estimated_price != null ? Number(item.estimated_price) : undefined,
      storeUrl: (item.store_url as string | null) ?? undefined,
      notes: (item.notes as string | null) ?? undefined
    })),
    onboardingAnswers
  });

  const { data: generation } = await supabase
    .from("ai_generations")
    .insert({
      household_id: household.household.id,
      created_by: user.id,
      model: "gpt-5-mini",
      status: plan.usedFallback ? "fallback" : "success",
      input_snapshot: { profile: household, onboardingAnswers },
      output_payload: plan
    })
    .select("id")
    .single();

  if (generation?.id) {
    const suggestions = [
      ...plan.taskFocus.map((item) => ({ suggestion_type: "task", title: item.title, body: `${item.reason} — ${item.who} (${item.when})`, metadata: item })),
      ...(plan.routineSuggestions ?? []).map((item) => ({ suggestion_type: "routine", title: item.title, body: item.steps.join(" · "), metadata: item })),
      ...plan.routines.map((item) => ({ suggestion_type: "routine", title: null, body: item, metadata: {} })),
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

  await persistAiPlanTasks({ householdId: household.household.id, plan });

  const finalTasks = await listTasksForCurrentUser();

  return NextResponse.json({
    ok: true,
    aiTriggered: true,
    usedFallback: plan.usedFallback,
    tasksCount: finalTasks.length
  });
}
