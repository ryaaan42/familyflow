import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getUserHousehold } from "@/lib/supabase/household-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listTasksForCurrentUser } from "@/lib/supabase/task-actions";

const itemSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["menage", "cuisine", "animaux", "enfants", "administratif", "budget", "courses", "hygiene", "entretien", "routine"]).optional(),
  assignedMemberId: z.string().uuid().nullable(),
  dayOfWeek: z.number().int().min(1).max(7),
  status: z.enum(["todo", "in_progress", "done", "late"]).default("todo")
});

const payloadSchema = z.object({
  items: z.array(itemSchema).max(400)
});

const toDateFromDayOfWeek = (dayOfWeek: number) => {
  const now = new Date();
  const monday = new Date(now);
  const mondayOffset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - mondayOffset + (dayOfWeek - 1));
  return monday.toISOString().slice(0, 10);
};

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Payload invalide" }, { status: 400 });

  for (const item of parsed.data.items) {
    const taskDate = toDateFromDayOfWeek(item.dayOfWeek);

    const taskUpdate: Record<string, unknown> = {
      due_date: taskDate,
      status: item.status
    };
    if (item.title !== undefined) taskUpdate.title = item.title;
    if (item.description !== undefined) taskUpdate.description = item.description;
    if (item.category !== undefined) taskUpdate.category = item.category;

    const taskWrite = await supabase
      .from("tasks")
      .update(taskUpdate)
      .eq("id", item.taskId)
      .eq("household_id", household.household.id);
    if (taskWrite.error) return NextResponse.json({ error: taskWrite.error.message }, { status: 500 });

    if (!item.assignedMemberId) {
      const { error } = await supabase
        .from("task_assignments")
        .delete()
        .eq("task_id", item.taskId)
        .eq("household_id", household.household.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      continue;
    }

    const { error } = await supabase.from("task_assignments").upsert(
      {
        task_id: item.taskId,
        member_id: item.assignedMemberId,
        household_id: household.household.id,
        day_of_week: item.dayOfWeek,
        scheduled_for: taskDate,
        status: item.status
      },
      { onConflict: "task_id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tasks = await listTasksForCurrentUser();
  return NextResponse.json({ tasks });
}
