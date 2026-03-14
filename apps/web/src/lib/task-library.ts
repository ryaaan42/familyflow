import type { TaskCategory, Frequency } from "@familyflow/shared";

export interface TaskLibraryItem {
  title: string;
  description: string;
  category: TaskCategory;
  frequency: Frequency;
  estimatedMinutes: number;
  minAge: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export const DEFAULT_TASK_LIBRARY: TaskLibraryItem[] = [
  { title: "Ranger le salon", description: "Remettre en ordre le salon et les jouets.", category: "menage", frequency: "quotidienne", estimatedMinutes: 15, minAge: 8, difficulty: 1 },
  { title: "Lancer une machine de linge", description: "Trier et lancer une lessive.", category: "routine", frequency: "hebdomadaire", estimatedMinutes: 20, minAge: 14, difficulty: 2 },
  { title: "Vider le lave-vaisselle", description: "Ranger la vaisselle propre.", category: "cuisine", frequency: "quotidienne", estimatedMinutes: 10, minAge: 10, difficulty: 1 },
  { title: "Préparer le menu de la semaine", description: "Prévoir 5 repas et la liste de courses.", category: "courses", frequency: "hebdomadaire", estimatedMinutes: 25, minAge: 18, difficulty: 2 },
  { title: "Nettoyer la salle de bain", description: "Lavabo, miroir et toilettes.", category: "hygiene", frequency: "hebdomadaire", estimatedMinutes: 25, minAge: 14, difficulty: 2 },
  { title: "Routine du matin", description: "Petit-déjeuner, sacs, tenue prête.", category: "routine", frequency: "quotidienne", estimatedMinutes: 20, minAge: 6, difficulty: 1 },
  { title: "Routine du soir", description: "Rangement express, vêtements pour demain.", category: "routine", frequency: "quotidienne", estimatedMinutes: 20, minAge: 6, difficulty: 1 },
  { title: "Suivi budget hebdomadaire", description: "Passer en revue les dépenses de la semaine.", category: "budget", frequency: "hebdomadaire", estimatedMinutes: 30, minAge: 18, difficulty: 2 },
  { title: "Sortir les poubelles", description: "Vider les bacs et sortir les sacs.", category: "entretien", frequency: "hebdomadaire", estimatedMinutes: 10, minAge: 12, difficulty: 1 },
  { title: "Nourrir les animaux", description: "Repas et eau des animaux.", category: "animaux", frequency: "quotidienne", estimatedMinutes: 10, minAge: 8, difficulty: 1 }
];
