import { BudgetItem, SavingsProjection, SavingsScenario, Task } from "../types";

export interface SavingsSummary {
  currentMonthlyCost: number;
  optimizedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  projections: SavingsProjection[];
  taskWasteMonthly: number;
}

export const buildSavingsSummary = (
  scenarios: SavingsScenario[],
  tasks: Task[],
  budgetItems: BudgetItem[]
): SavingsSummary => {
  const scenarioCurrent = scenarios.reduce((sum, scenario) => sum + scenario.monthlyCost, 0);
  const scenarioImproved = scenarios.reduce(
    (sum, scenario) => sum + scenario.improvedMonthlyCost,
    0
  );
  const taskWasteMonthly = tasks.reduce(
    (sum, task) => sum + (task.status === "done" ? 0 : task.indirectCostPerMonth ?? 0),
    0
  );
  const variableSpend = budgetItems
    .filter((item) => item.type === "variable")
    .reduce((sum, item) => sum + item.amount, 0);

  const currentMonthlyCost = scenarioCurrent + taskWasteMonthly + variableSpend * 0.12;
  const optimizedMonthlyCost = scenarioImproved + variableSpend * 0.08;
  const monthlySavings = Math.max(currentMonthlyCost - optimizedMonthlyCost, 0);
  const annualSavings = monthlySavings * 12;

  const projections = [3, 6, 12].map((months) => ({
    label: `${months} mois`,
    months,
    currentCost: currentMonthlyCost * months,
    improvedCost: optimizedMonthlyCost * months,
    savings: monthlySavings * months
  }));

  return {
    currentMonthlyCost,
    optimizedMonthlyCost,
    monthlySavings,
    annualSavings,
    projections,
    taskWasteMonthly
  };
};

