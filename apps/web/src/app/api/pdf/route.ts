import React from "react";
import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  buildTaskSuggestions,
  createDemoDataset,
  PdfTheme,
  type BudgetItem,
  type BudgetMonth,
  type DemoDataset,
  type MealPlan
} from "@familyflow/shared";

import { getUserHousehold } from "@/lib/supabase/household-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createFamilyFlowPdfDocument } from "@/components/pdf/familyflow-pdf-document";

function getMondayOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

async function fetchMealPlans(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  householdId: string
): Promise<MealPlan[]> {
  const weekStart = getMondayOfCurrentWeek();
  const { data } = await supabase
    .from("meal_plans")
    .select()
    .eq("household_id", householdId)
    .eq("week_start", weekStart)
    .order("day_of_week")
    .order("meal_type");

  return (data ?? []).map((row) => ({
    id: row.id,
    householdId: row.household_id,
    weekStart: row.week_start,
    dayOfWeek: row.day_of_week,
    mealType: row.meal_type as "lunch" | "dinner",
    title: row.title,
    notes: row.notes ?? undefined
  }));
}

async function buildRealDataset(): Promise<{ dataset: DemoDataset; mealPlans: MealPlan[] } | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return null;

    const householdProfile = await getUserHousehold();
    if (!householdProfile) return null;

    const { data: userData } = await supabase
      .from("users")
      .select("display_name, locale, currency, plan")
      .eq("id", user.id)
      .maybeSingle();

    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    // Budget
    const { data: budgetRow } = await supabase
      .from("budgets")
      .select()
      .eq("household_id", householdProfile.household.id)
      .eq("month", currentMonth)
      .maybeSingle();

    const budget: BudgetMonth = budgetRow
      ? {
          id: budgetRow.id,
          householdId: budgetRow.household_id,
          month: budgetRow.month,
          targetSavings: Number(budgetRow.target_savings ?? 0)
        }
      : { id: "", householdId: householdProfile.household.id, month: currentMonth, targetSavings: 0 };

    const { data: dbBudgetItems } = budgetRow
      ? await supabase
          .from("budget_items")
          .select()
          .eq("budget_id", budgetRow.id)
          .is("deleted_at", null)
      : { data: [] };

    const budgetItems: BudgetItem[] = (dbBudgetItems ?? []).map((i) => ({
      id: i.id,
      budgetId: i.budget_id,
      type: i.type,
      category: i.category,
      label: i.label,
      amount: Number(i.amount),
      recurring: i.recurring
    }));

    // Birth list
    const { data: dbBirthItems } = await supabase
      .from("birth_list_items")
      .select()
      .eq("household_id", householdProfile.household.id)
      .is("deleted_at", null);

    const birthListItems = (dbBirthItems ?? []).map((i) => ({
      id: i.id,
      householdId: i.household_id,
      title: i.title,
      category: i.category,
      priority: i.priority,
      status: i.status,
      quantity: i.quantity,
      reservedQuantity: i.reserved_quantity,
      estimatedPrice: i.estimated_price ? Number(i.estimated_price) : undefined,
      storeUrl: i.store_url ?? undefined,
      description: i.description ?? undefined
    }));

    // Tasks — DB first, fallback to generated suggestions
    const { data: dbTasks } = await supabase
      .from("tasks")
      .select()
      .eq("household_id", householdProfile.household.id)
      .is("deleted_at", null)
      .limit(40);

    const tasks =
      dbTasks && dbTasks.length > 0
        ? dbTasks.map((t) => ({
            id: t.id,
            householdId: t.household_id,
            title: t.title,
            category: t.category,
            frequency: t.frequency,
            status: t.status,
            estimatedMinutes: t.estimated_minutes ?? 20,
            assignedMemberId: t.assigned_member_id ?? undefined,
            origin: t.origin ?? "custom",
            indirectCostPerMonth: t.indirect_cost_per_month
              ? Number(t.indirect_cost_per_month)
              : undefined,
            smartReason: t.smart_reason ?? undefined,
            recurring: t.recurring ?? true
          }))
        : buildTaskSuggestions(householdProfile).slice(0, 20);

    const [mealPlans] = await Promise.all([
      fetchMealPlans(supabase, householdProfile.household.id)
    ]);

    return {
      dataset: {
        user: {
          id: user.id,
          email: user.email ?? "",
          displayName: userData?.display_name ?? user.email ?? "Utilisateur",
          locale: userData?.locale ?? "fr-FR",
          currency: userData?.currency ?? "EUR",
          plan: (userData?.plan as DemoDataset["user"]["plan"]) ?? "free",
          isAdmin: false
        },
        profile: householdProfile,
        tasks,
        completions: [],
        budget,
        budgetItems,
        savingsScenarios: [],
        birthListItems,
        pdfPreferences: { theme: "premium", includeBudgetSummary: true, includeBirthList: true },
        notificationSettings: {
          channels: [],
          types: [],
          budgetThreshold: 80,
          taskReminderHours: 24
        }
      },
      mealPlans
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const theme = (request.nextUrl.searchParams.get("theme") as PdfTheme | null) ?? "premium";
  const real = await buildRealDataset();
  const data = real?.dataset ?? createDemoDataset();
  const mealPlans = real?.mealPlans ?? [];
  const pdfBuffer = await renderToBuffer(createFamilyFlowPdfDocument(data, theme, mealPlans));

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="familyflow-${theme}.pdf"`
    }
  });
}
