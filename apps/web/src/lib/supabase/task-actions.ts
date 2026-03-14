import type { Task } from "@familyflow/shared";
import { DEFAULT_TASK_LIBRARY } from "@/lib/task-library";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const toTask = (row: Record<string, unknown>, assignedMemberId?: string): Task => ({
  id: row.id as string,
  householdId: row.household_id as string,
  title: row.title as string,
  description: (row.description as string | null) ?? undefined,
  category: row.category as Task["category"],
  frequency: row.frequency as Task["frequency"],
  dueDate: row.due_date as string,
  status: row.status as Task["status"],
  estimatedMinutes: Number(row.estimated_minutes ?? 15),
  difficulty: Number(row.difficulty ?? 1) as Task["difficulty"],
  indirectCostPerMonth: row.indirect_cost_per_month != null ? Number(row.indirect_cost_per_month) : undefined,
  assignedMemberId,
  templateId: (row.template_id as string | null) ?? undefined,
  minimumAge: (row.minimum_age as number | null) ?? undefined,
  recommendedRoles: (row.recommended_roles as Task["recommendedRoles"]) ?? [],
  smartReason: (row.smart_reason as string | null) ?? undefined,
  origin: row.origin as Task["origin"],
  createdAt: row.created_at as string
});

export async function listTasksForCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();
  if (!household) return [] as Task[];

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("household_id", household.household.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const taskIds = (data ?? []).map((t) => t.id as string);
  const { data: assignments } = taskIds.length
    ? await supabase.from("task_assignments").select("task_id, member_id").in("task_id", taskIds)
    : { data: [] as Array<Record<string, unknown>> };

  const map = new Map<string, string>();
  (assignments ?? []).forEach((a) => {
    if (!map.has(a.task_id as string)) map.set(a.task_id as string, a.member_id as string);
  });

  return (data ?? []).map((row) => toTask(row as Record<string, unknown>, map.get(row.id as string)));
}

export async function bootstrapDefaultTasksIfEmpty() {
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();
  if (!household) return;

  const { count } = await supabase
    .from("tasks")
    .select("id", { head: true, count: "exact" })
    .eq("household_id", household.household.id)
    .is("deleted_at", null);

  if ((count ?? 0) > 0) return;

  const nowDate = new Date().toISOString().slice(0, 10);
  const rows = DEFAULT_TASK_LIBRARY.map((item) => ({
    household_id: household.household.id,
    title: item.title,
    description: item.description,
    category: item.category,
    frequency: item.frequency,
    due_date: nowDate,
    estimated_minutes: item.estimatedMinutes,
    difficulty: item.difficulty,
    minimum_age: item.minAge,
    origin: "template" as const
  }));

  await supabase.from("tasks").insert(rows);
}
