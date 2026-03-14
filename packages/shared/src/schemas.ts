import { z } from "zod";

export const memberSchema = z.object({
  name: z.string().min(2, "Le prenom doit contenir au moins 2 caracteres."),
  age: z.coerce.number().min(1).max(99),
  role: z.enum(["parent", "adulte", "ado", "enfant", "autre"]),
  avatarColor: z.string().min(4),
  availabilityHoursPerWeek: z.coerce.number().min(1).max(80),
  isPregnant: z.boolean().optional().default(false)
});

export const householdSchema = z.object({
  name: z.string().min(2, "Le nom du foyer est requis."),
  housingType: z.enum(["appartement", "maison"]),
  surfaceSqm: z.coerce.number().min(20).max(700),
  rooms: z.coerce.number().min(1).max(20),
  childrenCount: z.coerce.number().min(0).max(12),
  city: z.string().optional(),
  isExpectingBaby: z.boolean().default(false),
  pregnancyDueDate: z.string().optional(),
  birthListShareSlug: z.string().optional(),
  aiContext: z.object({
    housingDetails: z.string().max(500).optional(),
    petsDetails: z.string().max(500).optional(),
    childrenAges: z.string().max(200).optional(),
    lifestyleRhythm: z.string().max(500).optional(),
    preferredTaskDays: z.string().max(500).optional(),
    mealPreferences: z.string().max(500).optional(),
    foodConstraints: z.string().max(500).optional(),
    organizationGoals: z.string().max(500).optional(),
    scheduleConstraints: z.string().max(500).optional(),
    routinesWanted: z.string().max(500).optional(),
    weeklyBudget: z.coerce.number().min(0).max(5000).optional(),
    monthlyBudget: z.coerce.number().min(0).max(20000).optional()
  }).optional()
});

export const budgetItemSchema = z.object({
  label: z.string().min(2),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "fixed", "variable"]),
  category: z.enum([
    "loyer_credit",
    "courses",
    "transport",
    "abonnements",
    "loisirs",
    "sorties",
    "restaurant_fast_food",
    "animaux",
    "enfants",
    "sante",
    "imprevus",
    "maison"
  ]),
  recurring: z.boolean().default(true)
});

export const savingsScenarioSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(4),
  domain: z.enum(["sorties", "repas", "courses", "linge", "animaux", "organisation"]),
  monthlyCost: z.coerce.number().positive(),
  improvedMonthlyCost: z.coerce.number().nonnegative(),
  effort: z.enum(["facile", "moyen", "avance"])
});
