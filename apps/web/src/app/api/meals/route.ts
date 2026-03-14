import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const upsertSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: z.enum(["lunch", "dinner"]),
  title: z.string().min(1).max(200),
  notes: z.string().max(500).optional()
});

function toMealPlan(row: Record<string, unknown>) {
  return {
    id: row.id,
    householdId: row.household_id,
    weekStart: row.week_start,
    dayOfWeek: row.day_of_week,
    mealType: row.meal_type,
    title: row.title,
    notes: row.notes ?? undefined
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const weekStart = request.nextUrl.searchParams.get("weekStart");
  let query = supabase
    .from("meal_plans")
    .select()
    .eq("household_id", household.household.id)
    .order("day_of_week")
    .order("meal_type");

  if (weekStart) query = query.eq("week_start", weekStart);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data ?? []).map(toMealPlan));
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const body = upsertSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { data, error } = await supabase
    .from("meal_plans")
    .upsert(
      {
        household_id: household.household.id,
        week_start: body.data.weekStart,
        day_of_week: body.data.dayOfWeek,
        meal_type: body.data.mealType,
        title: body.data.title,
        notes: body.data.notes ?? null
      },
      { onConflict: "household_id,week_start,day_of_week,meal_type" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(toMealPlan(data as Record<string, unknown>));
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  await supabase.from("meal_plans").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
