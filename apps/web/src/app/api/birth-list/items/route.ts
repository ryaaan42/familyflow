import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const household = await getUserHousehold();

  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable." }, { status: 404 });
  }

  const { data: items, error } = await supabase
    .from("birth_list_items")
    .select()
    .eq("household_id", household.household.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[birth-list/items] fetch error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement." }, { status: 500 });
  }

  return NextResponse.json({ items: items ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Verify the user is authenticated
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  // Get the user's household
  const household = await getUserHousehold();

  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable." }, { status: 404 });
  }

  const body = await req.json();
  const { title, category, priority, estimatedPrice, quantity, storeUrl, description } = body;

  if (!title?.trim() || !category || !priority) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  const { data: item, error: insertError } = await supabase
    .from("birth_list_items")
    .insert({
      household_id: household.household.id,
      title: title.trim(),
      category,
      priority,
      status: "wanted",
      quantity: Math.max(1, parseInt(quantity) || 1),
      reserved_quantity: 0,
      estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : null,
      store_url: storeUrl?.trim() || null,
      description: description?.trim() || null
    })
    .select()
    .single();

  if (insertError) {
    console.error("[birth-list/items] insert error:", insertError);
    return NextResponse.json({ error: "Erreur lors de l'ajout." }, { status: 500 });
  }

  return NextResponse.json({ success: true, item }, { status: 201 });
}
