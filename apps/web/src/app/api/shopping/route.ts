import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().max(50).optional(),
  category: z.enum(["epicerie","frais","boucherie_poisson","fruits_legumes","boissons","hygiene_beaute","menage","bebe","animaux","autre"]).default("autre")
});

function toItem(row: Record<string, unknown>) {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    quantity: row.quantity ?? undefined,
    category: row.category,
    isChecked: row.is_checked,
    addedByMemberId: row.added_by_member_id ?? undefined,
    createdAt: row.created_at
  };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const { data, error } = await supabase
    .from("shopping_list_items")
    .select()
    .eq("household_id", household.household.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(toItem));
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const body = createSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { data, error } = await supabase
    .from("shopping_list_items")
    .insert({
      household_id: household.household.id,
      name: body.data.name,
      quantity: body.data.quantity ?? null,
      category: body.data.category
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toItem(data as Record<string, unknown>));
}
