import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  currentValue: z.number().optional(),
  status: z.enum(["active","completed","abandoned"]).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable()
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = patchSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (body.data.currentValue !== undefined) updates.current_value = body.data.currentValue;
  if (body.data.status !== undefined) updates.status = body.data.status;
  if (body.data.title !== undefined) updates.title = body.data.title;
  if (body.data.description !== undefined) updates.description = body.data.description;

  const { error } = await supabase.from("household_goals").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  await supabase.from("household_goals").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ ok: true });
}
