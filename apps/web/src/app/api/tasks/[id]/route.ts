import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";
import { listTasksForCurrentUser } from "@/lib/supabase/task-actions";

const patchSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.enum(["menage", "cuisine", "animaux", "enfants", "administratif", "budget", "courses", "hygiene", "entretien", "routine"]).optional(),
  frequency: z.enum(["quotidienne", "hebdomadaire", "mensuelle", "personnalisee"]).optional(),
  estimatedMinutes: z.number().int().min(5).max(240).optional(),
  status: z.enum(["todo", "in_progress", "done", "late"]).optional(),
  assignedMemberId: z.string().uuid().nullable().optional(),
  dayOfWeek: z.number().int().min(1).max(7).optional(),
  origin: z.enum(["template", "custom", "smart"]).optional()
});

const toDateFromDayOfWeek = (dayOfWeek: number) => {
  const now = new Date();
  const monday = new Date(now);
  const mondayOffset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - mondayOffset + (dayOfWeek - 1));
  return monday.toISOString().slice(0, 10);
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();

  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const body = patchSchema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Payload invalide" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (body.data.title !== undefined) updates.title = body.data.title;
  if (body.data.description !== undefined) updates.description = body.data.description;
  if (body.data.category !== undefined) updates.category = body.data.category;
  if (body.data.frequency !== undefined) updates.frequency = body.data.frequency;
  if (body.data.estimatedMinutes !== undefined) updates.estimated_minutes = body.data.estimatedMinutes;
  if (body.data.status !== undefined) updates.status = body.data.status;
  if (body.data.origin !== undefined) updates.origin = body.data.origin;
  if (body.data.dayOfWeek !== undefined) updates.due_date = toDateFromDayOfWeek(body.data.dayOfWeek);

  if (Object.keys(updates).length) {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id).eq("household_id", household.household.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const assignmentFieldsProvided = body.data.assignedMemberId !== undefined || body.data.dayOfWeek !== undefined || body.data.status !== undefined;
  if (assignmentFieldsProvided) {
    if (body.data.assignedMemberId === null) {
      const deletion = await supabase.from("task_assignments").delete().eq("task_id", id).eq("household_id", household.household.id);
      if (deletion.error) return NextResponse.json({ error: deletion.error.message }, { status: 500 });
    } else {
      const { data: existingAssignment } = await supabase
        .from("task_assignments")
        .select("member_id, day_of_week, status")
        .eq("task_id", id)
        .maybeSingle();

      const resolvedMemberId = body.data.assignedMemberId ?? (existingAssignment?.member_id as string | undefined);
      if (resolvedMemberId) {
        const fallbackDayOfWeek = body.data.dayOfWeek ?? (existingAssignment?.day_of_week as number | undefined) ?? (((new Date().getDay() + 6) % 7) + 1);
        const upsert = await supabase.from("task_assignments").upsert(
          {
            task_id: id,
            member_id: resolvedMemberId,
            household_id: household.household.id,
            day_of_week: fallbackDayOfWeek,
            scheduled_for: toDateFromDayOfWeek(fallbackDayOfWeek),
            status: body.data.status ?? (existingAssignment?.status as string | undefined) ?? "todo"
          },
          { onConflict: "task_id" }
        );

        if (upsert.error) return NextResponse.json({ error: upsert.error.message }, { status: 500 });
      }
    }
  }

  const tasks = await listTasksForCurrentUser();
  return NextResponse.json(tasks);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const { error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("household_id", household.household.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tasks = await listTasksForCurrentUser();
  return NextResponse.json(tasks);
}
