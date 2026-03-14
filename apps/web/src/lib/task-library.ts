import type { Frequency, Pet, TaskCategory } from "@familyflow/shared";

import type { HouseholdMemberCategory } from "@/lib/household-member";

export interface TaskLibraryItem {
  title: string;
  description: string;
  category: TaskCategory;
  frequency: Frequency;
  estimatedMinutes: number;
  minAge: number;
  maxAge?: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags?: Array<"pets" | "baby" | "kids" | "budget" | "morning" | "evening" | "house">;
  petType?: "chien" | "chat" | "autre" | "any";
}

export const DEFAULT_TASK_LIBRARY: TaskLibraryItem[] = [
  { title: "Passer l'aspirateur", description: "Aspirer les pièces de vie et l'entrée.", category: "menage", frequency: "hebdomadaire", estimatedMinutes: 30, minAge: 14, difficulty: 2, tags: ["house"] },
  { title: "Sortir les poubelles", description: "Vider les bacs et sortir les sacs de tri.", category: "entretien", frequency: "hebdomadaire", estimatedMinutes: 10, minAge: 12, difficulty: 1, tags: ["house"] },
  { title: "Changer les draps", description: "Retirer, laver et remettre les draps des chambres.", category: "menage", frequency: "hebdomadaire", estimatedMinutes: 25, minAge: 14, difficulty: 2, tags: ["house"] },
  { title: "Vider le lave-vaisselle", description: "Ranger la vaisselle propre dans les placards.", category: "cuisine", frequency: "quotidienne", estimatedMinutes: 10, minAge: 10, difficulty: 1 },
  { title: "Mettre la table", description: "Préparer assiettes et couverts avant le repas.", category: "cuisine", frequency: "quotidienne", estimatedMinutes: 8, minAge: 6, difficulty: 1 },
  { title: "Débarrasser la table", description: "Retirer assiettes et nettoyer la table.", category: "cuisine", frequency: "quotidienne", estimatedMinutes: 10, minAge: 7, difficulty: 1 },
  { title: "Planifier les repas", description: "Préparer un menu de semaine simple et équilibré.", category: "courses", frequency: "hebdomadaire", estimatedMinutes: 25, minAge: 18, difficulty: 2, tags: ["budget"] },
  { title: "Faire les courses", description: "Acheter les produits de base de la semaine.", category: "courses", frequency: "hebdomadaire", estimatedMinutes: 60, minAge: 16, difficulty: 2 },
  { title: "Lancer une lessive", description: "Trier le linge et démarrer une machine.", category: "routine", frequency: "hebdomadaire", estimatedMinutes: 20, minAge: 12, difficulty: 2 },
  { title: "Plier le linge", description: "Plier et répartir le linge propre.", category: "routine", frequency: "hebdomadaire", estimatedMinutes: 20, minAge: 10, difficulty: 1 },
  { title: "Nettoyer la salle de bain", description: "Lavabo, miroir, WC et douche.", category: "hygiene", frequency: "hebdomadaire", estimatedMinutes: 30, minAge: 15, difficulty: 2, tags: ["house"] },
  { title: "Ranger les chambres", description: "Remettre vêtements et objets à leur place.", category: "enfants", frequency: "quotidienne", estimatedMinutes: 15, minAge: 4, maxAge: 17, difficulty: 1, tags: ["kids"] },
  { title: "Ranger les jouets", description: "Trier et ranger les jouets après la journée.", category: "enfants", frequency: "quotidienne", estimatedMinutes: 10, minAge: 4, maxAge: 12, difficulty: 1, tags: ["kids"] },
  { title: "Préparer les cartables", description: "Vérifier agenda, devoirs et affaires pour demain.", category: "routine", frequency: "quotidienne", estimatedMinutes: 12, minAge: 8, maxAge: 17, difficulty: 1, tags: ["kids", "evening"] },
  { title: "Donner le bain au bébé", description: "Bain du bébé, soin et pyjama.", category: "enfants", frequency: "quotidienne", estimatedMinutes: 25, minAge: 18, difficulty: 2, tags: ["baby", "evening"] },
  { title: "Préparer le sac bébé", description: "Couches, tenue de rechange et biberon pour sortie.", category: "routine", frequency: "quotidienne", estimatedMinutes: 12, minAge: 16, difficulty: 1, tags: ["baby", "morning"] },

  { title: "Remplir les gamelles", description: "Nourrir les animaux et vérifier l'eau.", category: "animaux", frequency: "quotidienne", estimatedMinutes: 8, minAge: 8, difficulty: 1, tags: ["pets"], petType: "any" },
  { title: "Nettoyer l'espace repas des animaux", description: "Laver la zone de repas et renouveler l'eau.", category: "animaux", frequency: "hebdomadaire", estimatedMinutes: 10, minAge: 10, difficulty: 1, tags: ["pets"], petType: "any" },
  { title: "Vérifier eau et confort des animaux", description: "Contrôle rapide eau, couchage, propreté.", category: "animaux", frequency: "quotidienne", estimatedMinutes: 6, minAge: 8, difficulty: 1, tags: ["pets"], petType: "any" },

  { title: "Promener le chien", description: "Sortie hygiène et dépense quotidienne.", category: "animaux", frequency: "quotidienne", estimatedMinutes: 25, minAge: 12, difficulty: 2, tags: ["pets"], petType: "chien" },
  { title: "Sortie rapide du chien", description: "Petite sortie complémentaire selon le rythme.", category: "animaux", frequency: "quotidienne", estimatedMinutes: 15, minAge: 12, difficulty: 2, tags: ["pets"], petType: "chien" },
  { title: "Brosser le chien", description: "Entretien du pelage et contrôle rapide de la peau.", category: "animaux", frequency: "hebdomadaire", estimatedMinutes: 15, minAge: 12, difficulty: 2, tags: ["pets"], petType: "chien" },
  { title: "Nettoyer les accessoires du chien", description: "Laver laisse, gamelles et couchage.", category: "animaux", frequency: "hebdomadaire", estimatedMinutes: 18, minAge: 14, difficulty: 2, tags: ["pets"], petType: "chien" },

  { title: "Changer la litière", description: "Retirer les déchets et remettre de la litière propre.", category: "animaux", frequency: "hebdomadaire", estimatedMinutes: 12, minAge: 14, difficulty: 2, tags: ["pets"], petType: "chat" },
  { title: "Brosser le chat", description: "Limiter les poils et surveiller le confort du chat.", category: "animaux", frequency: "hebdomadaire", estimatedMinutes: 10, minAge: 10, difficulty: 1, tags: ["pets"], petType: "chat" },

  { title: "Suivi des dépenses hebdomadaires", description: "Passer en revue les dépenses de la semaine.", category: "budget", frequency: "hebdomadaire", estimatedMinutes: 20, minAge: 18, difficulty: 2, tags: ["budget"] },
  { title: "Vérifier les abonnements", description: "Contrôler paiements, doublons et résiliations possibles.", category: "administratif", frequency: "mensuelle", estimatedMinutes: 20, minAge: 18, difficulty: 2, tags: ["budget"] },
  { title: "Routine du matin", description: "Petit-déjeuner, habillage, sacs et départ à l'heure.", category: "routine", frequency: "quotidienne", estimatedMinutes: 25, minAge: 6, difficulty: 1, tags: ["morning"] },
  { title: "Routine du soir", description: "Rangement rapide, préparation du lendemain et coucher.", category: "routine", frequency: "quotidienne", estimatedMinutes: 25, minAge: 6, difficulty: 1, tags: ["evening"] },
  { title: "Entretien maison rapide", description: "Tour rapide: surfaces, poussière et entrée.", category: "entretien", frequency: "hebdomadaire", estimatedMinutes: 20, minAge: 12, difficulty: 1, tags: ["house"] }
];

const uniqByTitle = (items: TaskLibraryItem[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  });
};

export const getTaskTemplatesForPets = (pets: Pet[]) => {
  const petTypes = new Set(pets.map((pet) => pet.type));
  const items = DEFAULT_TASK_LIBRARY.filter((task) => {
    if (!task.tags?.includes("pets")) return true;
    if (pets.length === 0) return false;
    if (!task.petType || task.petType === "any") return true;
    if (task.petType === "autre") return petTypes.has("autre");
    return petTypes.has(task.petType);
  });

  return uniqByTitle(items);
};

export const getDefaultTasksForHousehold = (input: {
  hasPets: boolean;
  housingType: "appartement" | "maison";
  memberCategories: HouseholdMemberCategory[];
  pets?: Pet[];
}) => {
  const hasBaby = input.memberCategories.includes("bebe");
  const hasKids = input.memberCategories.includes("enfant") || input.memberCategories.includes("ado");

  const petAwareLibrary = getTaskTemplatesForPets(input.pets ?? []);

  return petAwareLibrary.filter((task) => {
    if (task.tags?.includes("pets") && !input.hasPets) return false;
    if (task.tags?.includes("baby") && !hasBaby) return false;
    if (task.tags?.includes("kids") && !hasKids) return false;
    if (task.tags?.includes("house") && input.housingType === "appartement" && task.title === "Entretien maison rapide") {
      return true;
    }
    return true;
  });
};
