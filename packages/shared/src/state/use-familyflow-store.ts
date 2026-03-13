import { create } from "zustand";

import { autoBalanceTasks } from "../engines/task-suggestions";
import { buildSavingsSummary } from "../engines/savings-projections";
import {
  BudgetItem,
  BudgetMonth,
  HouseholdMember,
  HouseholdProfile,
  PdfExportPreference,
  PdfTheme,
  SavingsScenario,
  Task,
  TaskCompletion,
  UserProfile,
  NotificationSetting,
  BirthListItem
} from "../types";

const defaultPdfPreferences: PdfExportPreference = {
  theme: "premium",
  includeLegend: true,
  includeBudgetSummary: true,
  includeLogo: true,
  paperFormat: "A4"
};

const defaultNotificationSettings: NotificationSetting = {
  emailDigest: true,
  budgetReminder: true,
  weeklyPdfReminder: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00"
};

const emptyProfile: HouseholdProfile = {
  household: {
    id: "",
    name: "",
    housingType: "appartement",
    surfaceSqm: 0,
    rooms: 0,
    childrenCount: 0,
    hasPets: false,
    balanceScore: 0,
    createdAt: new Date().toISOString()
  },
  members: [],
  pets: []
};

const emptyUser: UserProfile = {
  id: "",
  email: "",
  displayName: "",
  locale: "fr-FR",
  currency: "EUR",
  plan: "free",
  isAdmin: false
};

const emptyBudget: BudgetMonth = {
  id: "",
  householdId: "",
  month: new Date().toISOString().slice(0, 7),
  targetSavings: 0
};

interface InitializePayload {
  user?: UserProfile;
  profile?: HouseholdProfile;
  tasks?: Task[];
  completions?: TaskCompletion[];
  budget?: BudgetMonth;
  budgetItems?: BudgetItem[];
  savingsScenarios?: SavingsScenario[];
  birthListItems?: BirthListItem[];
}

interface FamilyFlowState {
  user: UserProfile;
  profile: HouseholdProfile;
  tasks: Task[];
  completions: TaskCompletion[];
  budget: BudgetMonth;
  budgetItems: BudgetItem[];
  savingsScenarios: SavingsScenario[];
  birthListItems: BirthListItem[];
  pdfPreferences: PdfExportPreference;
  notificationSettings: NotificationSetting;
  hydratedFromDemo: boolean;
  ready: boolean;
  initialize: (payload: InitializePayload) => void;
  toggleTask: (taskId: string) => void;
  assignTask: (taskId: string, memberId: string) => void;
  unassignTask: (taskId: string) => void;
  rebalanceAssignments: () => void;
  addBudgetItem: (item: BudgetItem) => void;
  addScenario: (scenario: SavingsScenario) => void;
  addMember: (member: HouseholdMember) => void;
  updateMember: (memberId: string, updates: Partial<HouseholdMember>) => void;
  removeMember: (memberId: string) => void;
  setPdfTheme: (theme: PdfTheme) => void;
  addBirthListItem: (item: BirthListItem) => void;
}

export const useFamilyFlowStore = create<FamilyFlowState>((set, get) => ({
  user: emptyUser,
  profile: emptyProfile,
  tasks: [],
  completions: [],
  budget: emptyBudget,
  budgetItems: [],
  savingsScenarios: [],
  birthListItems: [],
  pdfPreferences: defaultPdfPreferences,
  notificationSettings: defaultNotificationSettings,
  hydratedFromDemo: false,
  ready: false,

  initialize: (payload) =>
    set((state) => ({
      user: payload.user ?? state.user,
      profile: payload.profile ?? state.profile,
      tasks: payload.tasks ?? state.tasks,
      completions: payload.completions ?? state.completions,
      budget: payload.budget ?? state.budget,
      budgetItems: payload.budgetItems ?? state.budgetItems,
      savingsScenarios: payload.savingsScenarios ?? state.savingsScenarios,
      birthListItems: payload.birthListItems ?? state.birthListItems,
      hydratedFromDemo: false,
      ready: true
    })),

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

  unassignTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, assignedMemberId: undefined } : task
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

  updateMember: (memberId, updates) =>
    set((state) => ({
      profile: {
        ...state.profile,
        members: state.profile.members.map((m) =>
          m.id === memberId ? { ...m, ...updates } : m
        )
      }
    })),

  removeMember: (memberId) =>
    set((state) => ({
      profile: {
        ...state.profile,
        members: state.profile.members.filter((m) => m.id !== memberId)
      }
    })),

  setPdfTheme: (theme) =>
    set((state) => ({
      pdfPreferences: {
        ...state.pdfPreferences,
        theme
      }
    })),

  addBirthListItem: (item) =>
    set((state) => ({
      birthListItems: [...state.birthListItems, item]
    }))
}));

export const selectDashboardSummary = (state: FamilyFlowState) => {
  const completed = state.tasks.filter((task) => task.status === "done").length;
  const total = state.tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const busiestMember =
    state.profile.members.length > 0
      ? [...state.profile.members]
          .map((member) => ({
            member,
            load: state.tasks
              .filter((task) => task.assignedMemberId === member.id)
              .reduce((sum, task) => sum + task.estimatedMinutes, 0)
          }))
          .sort((left, right) => right.load - left.load)[0]
      : undefined;
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
