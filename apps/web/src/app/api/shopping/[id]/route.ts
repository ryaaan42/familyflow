import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  isChecked: z.boolean().optional(),
  name: z.string().min(1).max(200).optional(),
  quantity: z.string().max(50).optional().nullable()
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = patchSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (body.data.isChecked !== undefined) updates.is_checked = body.data.isChecked;
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.quantity !== undefined) updates.quantity = body.data.quantity;

  const { error } = await supabase.from("shopping_list_items").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  await supabase
    .from("shopping_list_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return NextResponse.json({ ok: true });
}
