import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/budget — returns (or creates) the current month's budget + its items
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const { data: household } = await supabase
    .from("households")
    .select("id")
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (!household) return NextResponse.json({ error: "Foyer introuvable." }, { status: 404 });

  const currentMonth = new Date().toISOString().slice(0, 7) + "-01"; // YYYY-MM-01

  // Upsert budget for current month
  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .upsert(
      { household_id: household.id, month: currentMonth, target_savings: 0 },
      { onConflict: "household_id,month", ignoreDuplicates: true }
    )
    .select()
    .maybeSingle();

  // If upsert returned nothing (row already existed), fetch it
  const { data: existingBudget } = budget
    ? { data: budget }
    : await supabase
        .from("budgets")
        .select()
        .eq("household_id", household.id)
        .eq("month", currentMonth)
        .single();

  if (budgetError && !existingBudget) {
    console.error("[api/budget] budget error:", budgetError);
    return NextResponse.json({ error: "Erreur budget." }, { status: 500 });
  }

  const finalBudget = budget ?? existingBudget;

  const { data: items } = await supabase
    .from("budget_items")
    .select()
    .eq("budget_id", finalBudget.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return NextResponse.json({ budget: finalBudget, items: items ?? [] });
}

// PATCH /api/budget — update target_savings for the current month
export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const { budgetId, targetSavings } = await req.json();
  if (!budgetId || targetSavings === undefined) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  const { error } = await supabase
    .from("budgets")
    .update({ target_savings: Math.max(0, parseFloat(targetSavings)) })
    .eq("id", budgetId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
