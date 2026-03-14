import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";
import { listTasksForCurrentUser } from "@/lib/supabase/task-actions";

const createSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  category: z.enum(["menage", "cuisine", "animaux", "enfants", "administratif", "budget", "courses", "hygiene", "entretien", "routine"]),
  frequency: z.enum(["quotidienne", "hebdomadaire", "mensuelle", "personnalisee"]),
  estimatedMinutes: z.number().int().min(5).max(240),
  minimumAge: z.number().int().min(0).max(120).optional(),
  assignedMemberId: z.string().uuid().optional(),
  dayOfWeek: z.number().int().min(1).max(7).optional()
});

const toDateFromDayOfWeek = (dayOfWeek: number) => {
  const now = new Date();
  const monday = new Date(now);
  const mondayOffset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - mondayOffset + (dayOfWeek - 1));
  return monday.toISOString().slice(0, 10);
};

export async function GET() {
  const tasks = await listTasksForCurrentUser();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const rawBody = await request.json();
  const body = createSchema.safeParse(rawBody);
  if (!body.success) {
    const issues = body.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return NextResponse.json({ error: `Validation: ${issues}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      household_id: household.household.id,
      title: body.data.title,
      description: body.data.description ?? null,
      category: body.data.category,
      frequency: body.data.frequency,
      due_date: toDateFromDayOfWeek(body.data.dayOfWeek ?? (((new Date().getDay() + 6) % 7) + 1)),
      status: "todo",
      estimated_minutes: body.data.estimatedMinutes,
      difficulty: 1,
      minimum_age: body.data.minimumAge ?? null,
      origin: "custom"
    })
    .select("id")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Erreur création" }, { status: 500 });

  if (body.data.assignedMemberId) {
    const dayOfWeek = body.data.dayOfWeek ?? (((new Date().getDay() + 6) % 7) + 1);
    const assignmentResult = await supabase.from("task_assignments").upsert(
      {
        task_id: data.id,
        member_id: body.data.assignedMemberId,
        scheduled_for: toDateFromDayOfWeek(dayOfWeek),
        day_of_week: dayOfWeek,
        status: "todo"
      },
      { onConflict: "task_id" }
    );

    if (assignmentResult.error) {
      return NextResponse.json({ error: assignmentResult.error.message }, { status: 500 });
    }
  }

  const tasks = await listTasksForCurrentUser();
  return NextResponse.json(tasks);
}
