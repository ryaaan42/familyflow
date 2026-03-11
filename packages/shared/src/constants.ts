import { TaskTemplate } from "./types";

export const APP_NAME = "FamilyFlow";

export const taskTemplates: TaskTemplate[] = [
  {
    id: "tpl-toys",
    title: "Ranger les jouets",
    description: "Remettre les jouets dans les bacs avant le diner.",
    category: "enfants",
    minAge: 4,
    roles: ["enfant", "ado"],
    baseFrequency: "quotidienne",
    estimatedMinutes: 10,
    difficulty: 1,
    points: 10
  },
  {
    id: "tpl-table",
    title: "Aider a mettre la table",
    description: "Installer les couverts et les verres pour toute la famille.",
    category: "cuisine",
    minAge: 6,
    roles: ["enfant", "ado"],
    baseFrequency: "quotidienne",
    estimatedMinutes: 10,
    difficulty: 1,
    points: 10
  },
  {
    id: "tpl-vacuum",
    title: "Passer l'aspirateur",
    description: "Nettoyer les pieces communes et l'entree.",
    category: "menage",
    minAge: 13,
    roles: ["ado", "parent", "adulte"],
    housingTypes: ["appartement", "maison"],
    baseFrequency: "hebdomadaire",
    estimatedMinutes: 35,
    difficulty: 3,
    indirectCostPerMonth: 12,
    points: 35
  },
  {
    id: "tpl-trash",
    title: "Sortir les poubelles",
    description: "Sortir le tri et les dechets menagers la veille du ramassage.",
    category: "entretien",
    minAge: 12,
    roles: ["ado", "parent", "adulte"],
    baseFrequency: "hebdomadaire",
    estimatedMinutes: 12,
    difficulty: 2,
    indirectCostPerMonth: 4,
    points: 15
  },
  {
    id: "tpl-dishwasher",
    title: "Vider le lave-vaisselle",
    description: "Remettre la vaisselle propre dans les placards.",
    category: "cuisine",
    minAge: 12,
    roles: ["ado", "parent", "adulte"],
    baseFrequency: "quotidienne",
    estimatedMinutes: 15,
    difficulty: 2,
    indirectCostPerMonth: 8,
    points: 18
  },
  {
    id: "tpl-bathroom",
    title: "Nettoyer la salle de bain",
    description: "Lavabo, miroir, douche et petite desinfection.",
    category: "hygiene",
    minAge: 15,
    roles: ["ado", "parent", "adulte"],
    baseFrequency: "hebdomadaire",
    estimatedMinutes: 30,
    difficulty: 3,
    indirectCostPerMonth: 15,
    points: 30
  },
  {
    id: "tpl-shopping",
    title: "Planifier les courses",
    description: "Verifier les stocks et preparer une liste avant achat.",
    category: "courses",
    minAge: 18,
    roles: ["parent", "adulte"],
    baseFrequency: "hebdomadaire",
    estimatedMinutes: 25,
    difficulty: 3,
    indirectCostPerMonth: 40,
    points: 28
  },
  {
    id: "tpl-mealprep",
    title: "Planifier les repas",
    description: "Prevoir les repas de la semaine pour limiter les achats impulsifs.",
    category: "budget",
    minAge: 18,
    roles: ["parent", "adulte"],
    baseFrequency: "hebdomadaire",
    estimatedMinutes: 30,
    difficulty: 3,
    indirectCostPerMonth: 55,
    points: 32
  },
  {
    id: "tpl-laundry",
    title: "Lancer une lessive optimisee",
    description: "Regrouper le linge et utiliser un cycle adapte.",
    category: "entretien",
    minAge: 16,
    roles: ["ado", "parent", "adulte"],
    baseFrequency: "hebdomadaire",
    estimatedMinutes: 20,
    difficulty: 2,
    indirectCostPerMonth: 18,
    points: 22
  },
  {
    id: "tpl-admin",
    title: "Verifier les papiers et rendez-vous",
    description: "Factures, messages ecole, assurance et agenda familial.",
    category: "administratif",
    minAge: 18,
    roles: ["parent", "adulte"],
    baseFrequency: "hebdomadaire",
    estimatedMinutes: 25,
    difficulty: 4,
    points: 24
  },
  {
    id: "tpl-dog-walk",
    title: "Promener le chien",
    description: "Sortie de 20 minutes minimum.",
    category: "animaux",
    minAge: 12,
    roles: ["ado", "parent", "adulte"],
    requiresPetType: "chien",
    baseFrequency: "quotidienne",
    estimatedMinutes: 25,
    difficulty: 2,
    indirectCostPerMonth: 20,
    points: 20
  },
  {
    id: "tpl-litter",
    title: "Nettoyer la litiere",
    description: "Retirer les dechets et remettre de la litiere propre.",
    category: "animaux",
    minAge: 14,
    roles: ["ado", "parent", "adulte"],
    requiresPetType: "chat",
    baseFrequency: "quotidienne",
    estimatedMinutes: 12,
    difficulty: 2,
    indirectCostPerMonth: 10,
    points: 16
  },
  {
    id: "tpl-feeding",
    title: "Remplir les gamelles",
    description: "Verifier eau et nourriture des animaux.",
    category: "animaux",
    minAge: 8,
    roles: ["enfant", "ado", "parent", "adulte"],
    requiresPetType: "any",
    baseFrequency: "quotidienne",
    estimatedMinutes: 8,
    difficulty: 1,
    points: 8
  },
  {
    id: "tpl-routine-evening",
    title: "Routine du soir",
    description: "Cartables, tenue du lendemain, table du petit-dejeuner.",
    category: "routine",
    minAge: 6,
    roles: ["enfant", "ado", "parent", "adulte"],
    baseFrequency: "quotidienne",
    estimatedMinutes: 15,
    difficulty: 2,
    indirectCostPerMonth: 22,
    points: 14
  }
];

export const categoryColors: Record<string, string> = {
  menage: "#6D5EF4",
  cuisine: "#FF7E6B",
  animaux: "#56C7A1",
  enfants: "#FFBF5A",
  administratif: "#468BFF",
  budget: "#4AB5A4",
  courses: "#FF8DB2",
  hygiene: "#A07BFF",
  entretien: "#3AB0FF",
  routine: "#7AC74F"
};

