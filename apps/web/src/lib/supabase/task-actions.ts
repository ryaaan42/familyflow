import type { AiHouseholdPlan, Task } from "@familyflow/shared";
import { DEFAULT_TASK_LIBRARY, getDefaultTasksForHousehold } from "@/lib/task-library";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

type AssignmentRow = {
  task_id: string;
  member_id: string;
  day_of_week: number;
  status: Task["status"];
  scheduled_for: string;
};

const toTask = (row: Record<string, unknown>, assignment?: AssignmentRow): Task => ({
  id: row.id as string,
  householdId: row.household_id as string,
  title: row.title as string,
  description: (row.description as string | null) ?? undefined,
  category: row.category as Task["category"],
  frequency: row.frequency as Task["frequency"],
  dueDate: row.due_date as string,
  status: (assignment?.status ?? row.status) as Task["status"],
  estimatedMinutes: Number(row.estimated_minutes ?? 15),
  difficulty: Number(row.difficulty ?? 1) as Task["difficulty"],
  indirectCostPerMonth: row.indirect_cost_per_month != null ? Number(row.indirect_cost_per_month) : undefined,
  assignedMemberId: assignment?.member_id,
  dayOfWeek: assignment?.day_of_week as Task["dayOfWeek"],
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
    ? await supabase
        .from("task_assignments")
        .select("task_id, member_id, day_of_week, status, scheduled_for")
        .in("task_id", taskIds)
    : { data: [] as AssignmentRow[] };

  const assignmentMap = new Map<string, AssignmentRow>();
  (assignments ?? []).forEach((a) => {
    assignmentMap.set(a.task_id as string, a as AssignmentRow);
  });

  return (data ?? []).map((row) => toTask(row as Record<string, unknown>, assignmentMap.get(row.id as string)));
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
  const memberCategories = household.members.map((m) => m.memberCategory ?? "adulte");
  const templates = getDefaultTasksForHousehold({
    hasPets: household.household.hasPets,
    housingType: household.household.housingType,
    memberCategories
  });

  const rows = templates.map((item) => ({
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

export async function persistAiPlanTasks(input: { householdId: string; plan: AiHouseholdPlan }) {
  const supabase = await createSupabaseServerClient();
  const nowDate = new Date().toISOString().slice(0, 10);

  const rows = input.plan.taskFocus.map((item) => ({
    household_id: input.householdId,
    title: item.title,
    description: item.reason,
    category: item.category ?? "routine",
    frequency: item.frequency ?? "hebdomadaire",
    due_date: nowDate,
    status: "todo",
    estimated_minutes: item.estimatedMinutes ?? 20,
    difficulty: 1,
    origin: "smart" as const,
    smart_reason: item.reason
  }));

  if (!rows.length) return;

  const { data, error } = await supabase.from("tasks").insert(rows).select("id, title");
  if (error || !data) return;

  for (const created of data) {
    const suggestion = input.plan.taskFocus.find((i) => i.title === created.title);
    if (suggestion?.suggestedMemberId) {
      const dayOfWeek = (((new Date(nowDate).getDay() + 6) % 7) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
      await supabase.from("task_assignments").upsert(
        {
          task_id: created.id,
          member_id: suggestion.suggestedMemberId,
          scheduled_for: nowDate,
          day_of_week: dayOfWeek,
          status: "todo"
        },
        { onConflict: "task_id" }
      );
    }
  }
}

export function buildBaseFallbackPlanSummary() {
  return {
    headline: "Suggestions de base appliquées",
    summary: "L'IA n'a pas répondu correctement, des tâches de base ont été appliquées automatiquement pour que votre planning reste utilisable.",
    taskFocus: DEFAULT_TASK_LIBRARY.slice(0, 8).map((item) => ({
      title: item.title,
      reason: item.description,
      who: "À attribuer",
      when: item.frequency,
      category: item.category,
      frequency: item.frequency,
      estimatedMinutes: item.estimatedMinutes
    })),
    routines: [
      "Routine du matin: préparer petit-déjeuner, sacs et tenues.",
      "Routine du soir: ranger les pièces de vie et préparer le lendemain.",
      "Bloc hebdo de 30 min pour linge et salle de bain.",
      "Revue budget hebdo de 20 min en fin de semaine."
    ],
    savingsMoves: [
      "Planifier les repas pour limiter les dépenses impulsives.",
      "Regrouper les courses sur une sortie hebdomadaire.",
      "Vérifier les abonnements une fois par mois."
    ],
    notes: ["Vous pouvez modifier ou supprimer chaque suggestion avant validation finale."],
    birthListSuggestions: [],
    usedFallback: true
  } as AiHouseholdPlan;
}
