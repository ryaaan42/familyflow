import { describe, expect, it } from "vitest";

import { createDemoDataset } from "../demo";
import { buildSavingsSummary } from "./savings-projections";

describe("buildSavingsSummary", () => {
  it("computes a positive monthly savings value for demo data", () => {
    const dataset = createDemoDataset();
    const summary = buildSavingsSummary(
      dataset.savingsScenarios,
      dataset.tasks,
      dataset.budgetItems
    );

    expect(summary.monthlySavings).toBeGreaterThan(0);
    expect(summary.projections).toHaveLength(3);
  });
});
