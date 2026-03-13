import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BudgetView } from "@/components/app/budget-view";
import type { BudgetMonth, BudgetItem } from "@familyflow/shared";

async function loadBudget(): Promise<{ budget: BudgetMonth; items: BudgetItem[] }> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: household } = await supabase
      .from("households")
      .select("id")
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (!household) return { budget: emptyBudget(), items: [] };

    const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

    // Fetch or create the budget row
    let { data: row } = await supabase
      .from("budgets")
      .select()
      .eq("household_id", household.id)
      .eq("month", currentMonth)
      .maybeSingle();

    if (!row) {
      const { data: inserted } = await supabase
        .from("budgets")
        .insert({ household_id: household.id, month: currentMonth, target_savings: 0 })
        .select()
        .maybeSingle();
      row = inserted;
    }

    if (!row) return { budget: emptyBudget(), items: [] };

    const { data: dbItems } = await supabase
      .from("budget_items")
      .select()
      .eq("budget_id", row.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    const budget: BudgetMonth = {
      id: row.id,
      householdId: row.household_id,
      month: row.month,
      targetSavings: row.target_savings ?? 0
    };

    const items: BudgetItem[] = (dbItems ?? []).map((i) => ({
      id: i.id,
      budgetId: i.budget_id,
      type: i.type,
      category: i.category,
      label: i.label,
      amount: Number(i.amount),
      recurring: i.recurring
    }));

    return { budget, items };
  } catch {
    return { budget: emptyBudget(), items: [] };
  }
}

function emptyBudget(): BudgetMonth {
  return {
    id: "",
    householdId: "",
    month: new Date().toISOString().slice(0, 7) + "-01",
    targetSavings: 0
  };
}

export default async function BudgetPage() {
  const { budget, items } = await loadBudget();
  return <BudgetView initialBudget={budget} initialItems={items} />;
}
