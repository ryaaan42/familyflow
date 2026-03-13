import {
  createDemoDataset,
  type BirthListItem,
  type BudgetItem,
  type BudgetMonth,
  type DemoDataset,
  type SavingsScenario,
  type Task,
  type TaskCompletion
} from "@familyflow/shared";

import { getUserHousehold, getUserProfile } from "@/lib/supabase/household-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
};

export async function buildPdfDatasetForCurrentUser(): Promise<DemoDataset> {
  const fallback = createDemoDataset();
  const supabase = await createSupabaseServerClient();
  const [profile, user] = await Promise.all([getUserHousehold(), getUserProfile()]);

  if (!profile || !user) {
    return fallback;
  }

  const { data: tasksData } = await supabase
    .from("tasks")
    .select("*")
    .eq("household_id", profile.household.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(150);

  const taskIds = (tasksData ?? []).map((task) => task.id as string);

  const { data: assignmentsData } = taskIds.length
    ? await supabase
        .from("task_assignments")
        .select("task_id, member_id, created_at")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false })
    : { data: [] as Array<Record<string, unknown>> };

  const assignmentByTask = new Map<string, string>();
  (assignmentsData ?? []).forEach((row) => {
    const taskId = row.task_id as string;
    if (!assignmentByTask.has(taskId)) {
      assignmentByTask.set(taskId, row.member_id as string);
    }
  });

  const tasks: Task[] = (tasksData ?? []).map((task) => ({
    id: task.id as string,
    householdId: task.household_id as string,
    title: task.title as string,
    description: (task.description as string | null) ?? undefined,
    category: task.category as Task["category"],
    frequency: task.frequency as Task["frequency"],
    dueDate: task.due_date as string,
    status: task.status as Task["status"],
    estimatedMinutes: toNumber(task.estimated_minutes),
    difficulty: toNumber(task.difficulty) as Task["difficulty"],
    indirectCostPerMonth:
      task.indirect_cost_per_month !== null ? toNumber(task.indirect_cost_per_month) : undefined,
    assignedMemberId: assignmentByTask.get(task.id as string),
    templateId: (task.template_id as string | null) ?? undefined,
    minimumAge: (task.minimum_age as number | null) ?? undefined,
    recommendedRoles: ((task.recommended_roles as Task["recommendedRoles"]) ?? []) as Task["recommendedRoles"],
    smartReason: (task.smart_reason as string | null) ?? undefined,
    origin: task.origin as Task["origin"],
    createdAt: task.created_at as string
  }));

  const { data: completionsData } = taskIds.length
    ? await supabase
        .from("task_completions")
        .select("id, task_id, member_id, completed_at")
        .in("task_id", taskIds)
        .order("completed_at", { ascending: false })
        .limit(150)
    : { data: [] as Array<Record<string, unknown>> };

  const completions: TaskCompletion[] = (completionsData ?? []).map((row) => ({
    id: row.id as string,
    taskId: row.task_id as string,
    memberId: row.member_id as string,
    completedAt: row.completed_at as string
  }));

  const { data: budgetData } = await supabase
    .from("budgets")
    .select("id, household_id, month, target_savings")
    .eq("household_id", profile.household.id)
    .is("deleted_at", null)
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();

  const budget: BudgetMonth = budgetData
    ? {
        id: budgetData.id as string,
        householdId: budgetData.household_id as string,
        month: budgetData.month as string,
        targetSavings: toNumber(budgetData.target_savings)
      }
    : fallback.budget;

  const { data: budgetItemsData } = budgetData
    ? await supabase
        .from("budget_items")
        .select("id, budget_id, type, category, label, amount, recurring")
        .eq("budget_id", budgetData.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
    : { data: [] as Array<Record<string, unknown>> };

  const budgetItems: BudgetItem[] = (budgetItemsData ?? []).map((item) => ({
    id: item.id as string,
    budgetId: item.budget_id as string,
    type: item.type as BudgetItem["type"],
    category: item.category as BudgetItem["category"],
    label: item.label as string,
    amount: toNumber(item.amount),
    recurring: Boolean(item.recurring)
  }));

  const { data: savingsData } = await supabase
    .from("savings_scenarios")
    .select("id, household_id, title, description, domain, monthly_cost, improved_monthly_cost, linked_task_category, effort")
    .eq("household_id", profile.household.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const savingsScenarios: SavingsScenario[] = (savingsData ?? []).map((scenario) => ({
    id: scenario.id as string,
    householdId: scenario.household_id as string,
    title: scenario.title as string,
    description: (scenario.description as string | null) ?? "",
    domain: scenario.domain as SavingsScenario["domain"],
    monthlyCost: toNumber(scenario.monthly_cost),
    improvedMonthlyCost: toNumber(scenario.improved_monthly_cost),
    linkedTaskCategory: (scenario.linked_task_category as SavingsScenario["linkedTaskCategory"]) ?? undefined,
    effort: scenario.effort as SavingsScenario["effort"]
  }));

  const { data: birthListData } = await supabase
    .from("birth_list_items")
    .select("*")
    .eq("household_id", profile.household.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const birthListItems: BirthListItem[] = (birthListData ?? []).map((item) => ({
    id: item.id as string,
    householdId: item.household_id as string,
    title: item.title as string,
    description: (item.description as string | null) ?? undefined,
    category: item.category as BirthListItem["category"],
    priority: item.priority as BirthListItem["priority"],
    status: item.status as BirthListItem["status"],
    quantity: toNumber(item.quantity),
    reservedQuantity: toNumber(item.reserved_quantity),
    estimatedPrice: item.estimated_price !== null ? toNumber(item.estimated_price) : undefined,
    storeUrl: (item.store_url as string | null) ?? undefined,
    notes: (item.notes as string | null) ?? undefined
  }));

  return {
    user,
    profile,
    tasks: tasks.length > 0 ? tasks : fallback.tasks,
    completions,
    budget,
    budgetItems,
    savingsScenarios,
    birthListItems,
    pdfPreferences: fallback.pdfPreferences,
    notificationSettings: fallback.notificationSettings
  };
}
