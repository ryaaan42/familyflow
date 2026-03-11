import { describe, expect, it } from "vitest";

import { createDemoDataset } from "../demo";
import { buildTaskSuggestions } from "./task-suggestions";

describe("buildTaskSuggestions", () => {
  it("includes pet tasks when the household has pets", () => {
    const dataset = createDemoDataset();
    const suggestions = buildTaskSuggestions(dataset.profile, {
      referenceDate: new Date("2026-03-11T09:00:00.000Z")
    });

    expect(suggestions.some((task) => task.category === "animaux")).toBe(true);
  });

  it("assigns tasks to eligible members", () => {
    const dataset = createDemoDataset();
    const suggestions = buildTaskSuggestions(dataset.profile, {
      referenceDate: new Date("2026-03-11T09:00:00.000Z")
    });

    expect(suggestions.every((task) => task.assignedMemberId)).toBe(true);
  });
});

