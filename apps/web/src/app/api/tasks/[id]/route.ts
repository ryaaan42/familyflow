import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listTasksForCurrentUser } from "@/lib/supabase/task-actions";

const patchSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.enum(["menage", "cuisine", "animaux", "enfants", "administratif", "budget", "courses", "hygiene", "entretien", "routine"]).optional(),
  frequency: z.enum(["quotidienne", "hebdomadaire", "mensuelle", "personnalisee"]).optional(),
  estimatedMinutes: z.number().int().min(5).max(240).optional(),
  status: z.enum(["todo", "in_progress", "done", "late"]).optional(),
  assignedMemberId: z.string().uuid().nullable().optional(),
  origin: z.enum(["template", "custom", "smart"]).optional()
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

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

  if (Object.keys(updates).length) {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.data.assignedMemberId !== undefined) {
    await supabase.from("task_assignments").delete().eq("task_id", id);
    if (body.data.assignedMemberId) {
      await supabase.from("task_assignments").insert({
        task_id: id,
        member_id: body.data.assignedMemberId,
        scheduled_for: new Date().toISOString().slice(0, 10),
        status: "todo"
      });
    }
  }

  const tasks = await listTasksForCurrentUser();
  return NextResponse.json(tasks);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  await supabase.from("tasks").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  const tasks = await listTasksForCurrentUser();
  return NextResponse.json(tasks);
}
