import type { HouseholdProfile } from "@familyflow/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface MealPreferences {
  diets: string[];
  allergies: string[];
  avoids: string[];
  childFriendly: boolean;
  budgetTight: boolean;
  quickMeals: boolean;
  batchCooking: boolean;
  healthyFocus: boolean;
  notes?: string;
}

export interface HouseholdAiContext {
  profile: HouseholdProfile;
  goals: Array<{ title: string; category: string; status: string }>;
  budgetSummary: { income: number; spend: number };
  mealPreferences: MealPreferences;
}

const defaultMealPreferences: MealPreferences = {
  diets: [],
  allergies: [],
  avoids: [],
  childFriendly: false,
  budgetTight: false,
  quickMeals: false,
  batchCooking: false,
  healthyFocus: true
};

export async function buildHouseholdAiContext(supabase: SupabaseClient, household: HouseholdProfile): Promise<HouseholdAiContext> {
  const householdId = household.household.id;
  const [{ data: goals }, { data: budgetItems }, { data: mealPreferences }] = await Promise.all([
    supabase.from("household_goals").select("title, category, status").eq("household_id", householdId).is("deleted_at", null).limit(30),
    supabase.from("budgets").select("id").eq("household_id", householdId).is("deleted_at", null).limit(1).maybeSingle(),
    supabase.from("household_meal_preferences").select("*").eq("household_id", householdId).maybeSingle()
  ]);

  let income = 0;
  let spend = 0;
  if (budgetItems?.id) {
    const { data: rows } = await supabase.from("budget_items").select("amount, type").eq("budget_id", budgetItems.id).is("deleted_at", null);
    income = (rows ?? []).filter((i) => i.type === "income").reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    spend = (rows ?? []).filter((i) => i.type !== "income").reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
  }

  return {
    profile: household,
    goals: (goals ?? []) as HouseholdAiContext["goals"],
    budgetSummary: { income, spend },
    mealPreferences: mealPreferences ? {
      diets: (mealPreferences.diets as string[] | null) ?? [],
      allergies: (mealPreferences.allergies as string[] | null) ?? [],
      avoids: (mealPreferences.avoids as string[] | null) ?? [],
      childFriendly: Boolean(mealPreferences.child_friendly),
      budgetTight: Boolean(mealPreferences.budget_tight),
      quickMeals: Boolean(mealPreferences.quick_meals),
      batchCooking: Boolean(mealPreferences.batch_cooking),
      healthyFocus: Boolean(mealPreferences.healthy_focus),
      notes: (mealPreferences.notes as string | null) ?? undefined
    } : defaultMealPreferences
  };
}
