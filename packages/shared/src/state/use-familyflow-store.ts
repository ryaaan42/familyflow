import { create } from "zustand";

import { createDemoDataset } from "../demo";
import { autoBalanceTasks } from "../engines/task-suggestions";
import { buildSavingsSummary } from "../engines/savings-projections";
import {
  BudgetItem,
  DemoDataset,
  HouseholdMember,
  PdfTheme,
  SavingsScenario
} from "../types";

const demoData = createDemoDataset();

interface FamilyFlowState extends DemoDataset {
  hydratedFromDemo: boolean;
  toggleTask: (taskId: string) => void;
  assignTask: (taskId: string, memberId: string) => void;
  rebalanceAssignments: () => void;
  addBudgetItem: (item: BudgetItem) => void;
  addScenario: (scenario: SavingsScenario) => void;
  addMember: (member: HouseholdMember) => void;
  setPdfTheme: (theme: PdfTheme) => void;
}

export const useFamilyFlowStore = create<FamilyFlowState>((set, get) => ({
  ...demoData,
  hydratedFromDemo: true,
  toggleTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "done" ? "todo" : "done"
            }
          : task
      )
    })),
  assignTask: (taskId, memberId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, assignedMemberId: memberId } : task
      )
    })),
  rebalanceAssignments: () =>
    set((state) => ({
      tasks: autoBalanceTasks(state.tasks, state.profile)
    })),
  addBudgetItem: (item) =>
    set((state) => ({
      budgetItems: [item, ...state.budgetItems]
    })),
  addScenario: (scenario) =>
    set((state) => ({
      savingsScenarios: [scenario, ...state.savingsScenarios]
    })),
  addMember: (member) =>
    set((state) => ({
      profile: {
        ...state.profile,
        members: [...state.profile.members, member]
      }
    })),
  setPdfTheme: (theme) =>
    set((state) => ({
      pdfPreferences: {
        ...state.pdfPreferences,
        theme
      }
    }))
}));

export const selectDashboardSummary = (state: FamilyFlowState) => {
  const completed = state.tasks.filter((task) => task.status === "done").length;
  const completionRate = Math.round((completed / state.tasks.length) * 100);
  const busiestMember = [...state.profile.members]
    .map((member) => ({
      member,
      load: state.tasks
        .filter((task) => task.assignedMemberId === member.id)
        .reduce((sum, task) => sum + task.estimatedMinutes, 0)
    }))
    .sort((left, right) => right.load - left.load)[0];
  const savings = buildSavingsSummary(state.savingsScenarios, state.tasks, state.budgetItems);
  const income = state.budgetItems
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const spend = state.budgetItems
    .filter((item) => item.type !== "income")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    completed,
    completionRate,
    busiestMember,
    savings,
    disposableIncome: income - spend
  };
};

