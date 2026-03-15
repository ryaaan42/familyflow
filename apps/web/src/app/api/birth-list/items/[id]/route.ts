import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const patchSchema = z.object({
  title: z.string().min(1).max(250).optional(),
  category: z.enum(["mobilier", "repas", "sorties", "hygiene", "vetements", "eveil", "soin"]).optional(),
  priority: z.enum(["essentiel", "utile", "confort"]).optional(),
  estimatedPrice: z.coerce.number().nonnegative().optional().nullable(),
  quantity: z.coerce.number().int().min(1).optional(),
  storeUrl: z.string().max(2000).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().max(2000).optional().nullable()
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable." }, { status: 404 });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });

  const updates = {
    title: parsed.data.title?.trim(),
    category: parsed.data.category,
    priority: parsed.data.priority,
    estimated_price:
      parsed.data.estimatedPrice === undefined
        ? undefined
        : parsed.data.estimatedPrice === null
          ? null
          : Number(parsed.data.estimatedPrice),
    quantity: parsed.data.quantity,
    store_url:
      parsed.data.storeUrl === undefined
        ? undefined
        : parsed.data.storeUrl === null
          ? null
          : parsed.data.storeUrl.trim() || null,
    description:
      parsed.data.description === undefined
        ? undefined
        : parsed.data.description === null
          ? null
          : parsed.data.description.trim() || null,
    image_url:
      parsed.data.imageUrl === undefined
        ? undefined
        : parsed.data.imageUrl === null
          ? null
          : parsed.data.imageUrl.trim() || null
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

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la mise a jour." }, { status: 500 });
  }

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

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
