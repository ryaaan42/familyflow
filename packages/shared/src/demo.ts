import { formatISO, startOfMonth } from "date-fns";

import { buildTaskSuggestions } from "./engines/task-suggestions";
import {
  BirthListItem,
  BudgetItem,
  BudgetMonth,
  DemoDataset,
  HouseholdProfile,
  SavingsScenario,
  Task,
  TaskCompletion,
  UserProfile
} from "./types";

const now = new Date("2026-03-11T09:00:00.000Z");

export const createDemoDataset = (): DemoDataset => {
  const user: UserProfile = {
    id: "user-demo",
    email: "emma@familyflow.app",
    displayName: "Emma Martin",
    locale: "fr-FR",
    currency: "EUR",
    plan: "plus" as const
  };

  const profile: HouseholdProfile = {
    household: {
      id: "household-demo",
      name: "Famille Martin",
      housingType: "maison" as const,
      surfaceSqm: 118,
      rooms: 6,
      childrenCount: 2,
      hasPets: true,
      city: "Lyon",
      isExpectingBaby: true,
      pregnancyDueDate: "2026-07-18",
      birthListShareSlug: "martin-baby-jules",
      balanceScore: 82,
      createdAt: now.toISOString()
    },
    members: [
      {
        id: "member-emma",
        householdId: "household-demo",
        name: "Emma",
        age: 38,
        role: "parent" as const,
        avatarColor: "#6D5EF4",
        availabilityHoursPerWeek: 12,
        isPregnant: true,
        favoriteCategories: ["budget", "courses"],
        blockedCategories: []
      },
      {
        id: "member-lucas",
        householdId: "household-demo",
        name: "Lucas",
        age: 40,
        role: "parent" as const,
        avatarColor: "#FF7E6B",
        availabilityHoursPerWeek: 10,
        favoriteCategories: ["administratif", "entretien"],
        blockedCategories: []
      },
      {
        id: "member-lea",
        householdId: "household-demo",
        name: "Lea",
        age: 15,
        role: "ado" as const,
        avatarColor: "#56C7A1",
        availabilityHoursPerWeek: 7,
        favoriteCategories: ["animaux", "cuisine"],
        blockedCategories: ["administratif"]
      },
      {
        id: "member-noe",
        householdId: "household-demo",
        name: "Noe",
        age: 8,
        role: "enfant" as const,
        avatarColor: "#FFBF5A",
        availabilityHoursPerWeek: 4,
        favoriteCategories: ["enfants", "animaux"],
        blockedCategories: ["hygiene"]
      }
    ],
    pets: [
      {
        id: "pet-moka",
        householdId: "household-demo",
        name: "Moka",
        type: "chien" as const,
        notes: "Sortie courte le matin, longue balade le soir"
      },
      {
        id: "pet-lune",
        householdId: "household-demo",
        name: "Lune",
        type: "chat" as const
      }
    ]
  };

  const suggestedTasks = buildTaskSuggestions(profile, { referenceDate: now });
  const tasks: Task[] = suggestedTasks.map((task, index) => ({
    ...task,
    status:
      index % 5 === 0 ? "done" : index % 4 === 0 ? "in_progress" : "todo"
  }));

  const budget: BudgetMonth = {
    id: "budget-2026-03",
    householdId: "household-demo",
    month: formatISO(startOfMonth(now), { representation: "date" }),
    targetSavings: 450
  };

  const budgetItems: BudgetItem[] = [
    {
      id: "income-1",
      budgetId: budget.id,
      type: "income" as const,
      category: "maison" as const,
      label: "Salaires nets",
      amount: 5200,
      recurring: true
    },
    {
      id: "fixed-1",
      budgetId: budget.id,
      type: "fixed" as const,
      category: "loyer_credit" as const,
      label: "Credit maison",
      amount: 1420,
      recurring: true
    },
    {
      id: "fixed-2",
      budgetId: budget.id,
      type: "fixed" as const,
      category: "abonnements" as const,
      label: "Abonnements",
      amount: 94,
      recurring: true
    },
    {
      id: "variable-1",
      budgetId: budget.id,
      type: "variable" as const,
      category: "courses" as const,
      label: "Courses",
      amount: 780,
      recurring: true
    },
    {
      id: "variable-2",
      budgetId: budget.id,
      type: "variable" as const,
      category: "restaurant_fast_food" as const,
      label: "Livraisons repas",
      amount: 220,
      recurring: true
    },
    {
      id: "variable-3",
      budgetId: budget.id,
      type: "variable" as const,
      category: "sorties" as const,
      label: "Cine du mardi",
      amount: 100,
      recurring: true
    },
    {
      id: "variable-4",
      budgetId: budget.id,
      type: "variable" as const,
      category: "animaux" as const,
      label: "Animaux",
      amount: 130,
      recurring: true
    }
  ];

  const savingsScenarios: SavingsScenario[] = [
    {
      id: "scenario-cinema",
      householdId: profile.household.id,
      title: "Cinema du mardi",
      description: "Passer de 4 sorties a 2 sorties par mois.",
      domain: "sorties" as const,
      monthlyCost: 100,
      improvedMonthlyCost: 50,
      effort: "facile" as const
    },
    {
      id: "scenario-meals",
      householdId: profile.household.id,
      title: "Uber Eats x2 / semaine",
      description: "Remplacer une commande par un repas deja planifie.",
      domain: "repas" as const,
      monthlyCost: 220,
      improvedMonthlyCost: 120,
      linkedTaskCategory: "cuisine" as const,
      effort: "moyen" as const
    },
    {
      id: "scenario-groceries",
      householdId: profile.household.id,
      title: "Courses mal planifiees",
      description: "Limiter le gaspillage via une liste et une routine stock.",
      domain: "courses" as const,
      monthlyCost: 65,
      improvedMonthlyCost: 20,
      linkedTaskCategory: "courses" as const,
      effort: "facile" as const
    }
  ];

  const birthListItems: BirthListItem[] = [
    {
      id: "birth-1",
      householdId: profile.household.id,
      title: "Poussette compacte",
      description: "Modele pliable pratique pour ville et voiture.",
      category: "sorties",
      priority: "essentiel",
      status: "wanted",
      quantity: 1,
      reservedQuantity: 0,
      estimatedPrice: 420,
      storeUrl: "https://familyflow.app/demo/poussette"
    },
    {
      id: "birth-2",
      householdId: profile.household.id,
      title: "Lit cododo",
      description: "Pour les premieres semaines dans la chambre parentale.",
      category: "mobilier",
      priority: "essentiel",
      status: "reserved",
      quantity: 1,
      reservedQuantity: 1,
      estimatedPrice: 210,
      notes: "Reserve par Mamie Claire"
    },
    {
      id: "birth-3",
      householdId: profile.household.id,
      title: "Biberons anti-coliques",
      category: "repas",
      priority: "utile",
      status: "wanted",
      quantity: 6,
      reservedQuantity: 0,
      estimatedPrice: 48
    },
    {
      id: "birth-4",
      householdId: profile.household.id,
      title: "Bodies naissance",
      category: "vetements",
      priority: "essentiel",
      status: "received",
      quantity: 8,
      reservedQuantity: 8,
      estimatedPrice: 36,
      notes: "Deja recus"
    },
    {
      id: "birth-5",
      householdId: profile.household.id,
      title: "Table a langer",
      category: "hygiene",
      priority: "utile",
      status: "wanted",
      quantity: 1,
      reservedQuantity: 0,
      estimatedPrice: 95
    }
  ];

  const completions: TaskCompletion[] = tasks
    .filter((task) => task.status === "done" && task.assignedMemberId)
    .map((task, index) => ({
      id: `completion-${index + 1}`,
      taskId: task.id,
      memberId: task.assignedMemberId as string,
      completedAt: now.toISOString()
    }));

  return {
    user,
    profile,
    tasks,
    completions,
    budget,
    budgetItems,
    savingsScenarios,
    birthListItems,
    pdfPreferences: {
      theme: "premium",
      includeLegend: true,
      includeBudgetSummary: true,
      includeLogo: true,
      paperFormat: "A4"
    },
    notificationSettings: {
      emailDigest: true,
      budgetReminder: true,
      weeklyPdfReminder: false,
      quietHoursStart: "21:30",
      quietHoursEnd: "07:00"
    }
  };
};
