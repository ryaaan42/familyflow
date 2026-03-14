import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const patchSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean()
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();
  if (!household) return NextResponse.json([]);

  const { data } = await supabase
    .from("ai_suggestions")
    .select("id, suggestion_type, title, body, metadata, is_active, created_at")
    .eq("household_id", household.household.id)
    .order("created_at", { ascending: false })
    .limit(80);

  return NextResponse.json(data ?? []);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const body = patchSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Payload invalide" }, { status: 400 });

  const { error } = await supabase
    .from("ai_suggestions")
    .update({ is_active: body.data.isActive })
    .eq("id", body.data.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return GET();
}
