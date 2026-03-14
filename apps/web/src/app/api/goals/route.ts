import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().default(0),
  unit: z.string().max(50).optional(),
  category: z.enum(["budget","sante","organisation","education","sport","ecologie","autre"]).default("autre"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

function toGoal(row: Record<string, unknown>) {
  return {
    id: row.id,
    householdId: row.household_id,
    title: row.title,
    description: row.description ?? undefined,
    targetValue: row.target_value != null ? Number(row.target_value) : undefined,
    currentValue: Number(row.current_value ?? 0),
    unit: row.unit ?? undefined,
    category: row.category,
    dueDate: row.due_date ?? undefined,
    status: row.status,
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
    .from("household_goals")
    .select()
    .eq("household_id", household.household.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(toGoal));
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
    .from("household_goals")
    .insert({
      household_id: household.household.id,
      title: body.data.title,
      description: body.data.description ?? null,
      target_value: body.data.targetValue ?? null,
      current_value: body.data.currentValue,
      unit: body.data.unit ?? null,
      category: body.data.category,
      due_date: body.data.dueDate ?? null
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toGoal(data as Record<string, unknown>));
}
