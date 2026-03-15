import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable." }, { status: 404 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updates = {
    title: typeof body.title === "string" ? body.title.trim() : undefined,
    category: typeof body.category === "string" ? body.category : undefined,
    priority: typeof body.priority === "string" ? body.priority : undefined,
    estimated_price: body.estimatedPrice != null && body.estimatedPrice !== "" ? Number(body.estimatedPrice) : undefined,
    quantity: body.quantity != null ? Math.max(1, Number(body.quantity) || 1) : undefined,
    store_url: typeof body.storeUrl === "string" ? body.storeUrl.trim() || null : undefined,
    description: typeof body.description === "string" ? body.description.trim() || null : undefined,
    image_url: typeof body.imageUrl === "string" ? body.imageUrl.trim() || null : undefined
  };

  const filtered = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));

  if (Object.keys(filtered).length === 0) {
    return NextResponse.json({ error: "Aucune modification." }, { status: 400 });
  }

  const { data: item, error } = await supabase
    .from("birth_list_items")
    .update(filtered)
    .eq("id", id)
    .eq("household_id", household.household.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Erreur lors de la mise a jour." }, { status: 500 });
  return NextResponse.json({ success: true, item });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable." }, { status: 404 });

  const { id } = await params;
  const { error } = await supabase
    .from("birth_list_items")
    .delete()
    .eq("id", id)
    .eq("household_id", household.household.id);

  if (error) return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  return NextResponse.json({ success: true });
}
