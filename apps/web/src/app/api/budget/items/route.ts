import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// POST /api/budget/items — add a budget line item
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const body = await req.json();
  const { budgetId, type, category, label, amount, recurring } = body;

  if (!budgetId || !type || !label?.trim() || !amount) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  const { data: item, error } = await supabase
    .from("budget_items")
    .insert({
      budget_id: budgetId,
      type,
      category: category || "maison",
      label: label.trim(),
      amount: Math.abs(parseFloat(amount)),
      recurring: recurring !== false
    })
    .select()
    .single();

  if (error) {
    console.error("[api/budget/items] insert error:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajout." }, { status: 500 });
  }

  return NextResponse.json({ success: true, item }, { status: 201 });
}
