import { z } from "zod";
import type {
  AiHouseholdPlan,
  BirthListItem,
  BudgetItem,
  HouseholdProfile,
  Task
} from "@familyflow/shared";

const aiPlanSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  taskFocus: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      who: z.string(),
      when: z.string()
    })
  ).max(5),
  routines: z.array(z.string()).max(5),
  savingsMoves: z.array(z.string()).max(5),
  birthListSuggestions: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      priority: z.enum(["essentiel", "utile", "confort"])
    })
  ).max(5)
});

export interface AiHouseholdRequest {
  profile: HouseholdProfile;
  tasks: Task[];
  budgetItems: BudgetItem[];
  birthListItems: BirthListItem[];
}

const extractJsonBlock = (value: string) => {
  const fenced = value.match(/```json\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return value.slice(firstBrace, lastBrace + 1);
  }

  return value.trim();
};

const buildFallbackPlan = ({
  profile,
  tasks,
  budgetItems,
  birthListItems
}: AiHouseholdRequest): AiHouseholdPlan => {
  const topTasks = [...tasks]
    .sort((left, right) => (right.indirectCostPerMonth ?? 0) - (left.indirectCostPerMonth ?? 0))
    .slice(0, 3);
  const eatingSpend = budgetItems
    .filter((item) => item.category === "restaurant_fast_food" || item.category === "courses")
    .reduce((sum, item) => sum + item.amount, 0);
  const pregnantMember = profile.members.find((member) => member.isPregnant);
  const missingBirthList = birthListItems
    .filter((item) => item.status === "wanted")
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      reason: item.description ?? "Encore non reserve sur la liste partagee.",
      priority: item.priority
    }));

  return {
    headline: profile.household.isExpectingBaby
      ? "Priorite a une maison fluide avant l'arrivee du bebe"
      : "Priorite a des routines plus legeres et plus constantes",
    summary: profile.household.isExpectingBaby
      ? `Le foyer peut reduire la charge physique de ${pregnantMember?.name ?? "la future maman"} et concentrer l'organisation sur les routines du soir, les courses et la naissance.`
      : "Le foyer gagne surtout a clarifier qui fait quoi, a lisser la cuisine et a reserver un moment budget chaque semaine.",
    taskFocus: topTasks.map((task) => ({
      title: task.title,
      reason: task.smartReason ?? "Cette tache a un impact concret sur le quotidien du foyer.",
      who:
        profile.members.find((member) => member.id === task.assignedMemberId)?.name ?? "A attribuer",
      when: task.frequency === "quotidienne" ? "Tous les jours" : "Cette semaine"
    })),
    routines: [
      "Bloc de 10 minutes chaque soir pour cartables, linge et table du petit-dejeuner.",
      "Liste de courses fermee la veille des achats pour limiter les doublons.",
      "Un repas prepare a l'avance le dimanche pour soulager les jours charges."
    ],
    savingsMoves: [
      `Les depenses repas et courses representent deja ${eatingSpend} EUR / mois. Prioriser la planification repas aura un effet rapide.`,
      "Fixer une revue budget le dimanche soir pour arbitrer les sorties avant qu'elles s'empilent.",
      "Concentrer les lessives et le rangement entree/chambres limite les achats de depannage inutiles."
    ],
    birthListSuggestions: profile.household.isExpectingBaby
      ? missingBirthList.length > 0
        ? missingBirthList
        : [
            {
              title: "Veilleuse douce",
              reason: "Petit achat confortable a partager si les essentiels sont deja couverts.",
              priority: "confort"
            }
          ]
      : [],
    usedFallback: true
  };
};

export const createAiHouseholdPlan = async (
  request: AiHouseholdRequest
): Promise<AiHouseholdPlan> => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-5-mini";

  if (!apiKey) {
    return buildFallbackPlan(request);
  }

  const compactContext = {
    household: request.profile.household,
    members: request.profile.members.map((member) => ({
      name: member.name,
      role: member.role,
      age: member.age,
      availabilityHoursPerWeek: member.availabilityHoursPerWeek,
      isPregnant: member.isPregnant,
      favoriteCategories: member.favoriteCategories
    })),
    pets: request.profile.pets.map((pet) => ({
      name: pet.name,
      type: pet.type
    })),
    tasks: request.tasks.slice(0, 18).map((task) => ({
      title: task.title,
      category: task.category,
      frequency: task.frequency,
      assignedMemberId: task.assignedMemberId,
      estimatedMinutes: task.estimatedMinutes,
      indirectCostPerMonth: task.indirectCostPerMonth,
      smartReason: task.smartReason
    })),
    budget: request.budgetItems.map((item) => ({
      label: item.label,
      type: item.type,
      category: item.category,
      amount: item.amount
    })),
    birthList: request.birthListItems.map((item) => ({
      title: item.title,
      category: item.category,
      priority: item.priority,
      status: item.status,
      estimatedPrice: item.estimatedPrice
    }))
  };

  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        instructions:
          "Tu es l'assistant IA de Planille. Tu aides un foyer francophone a repartir les taches de maniere adaptee au profil de chaque membre. " +
          "Regles d'attribution obligatoires : " +
          "1) Les membres avec role 'enfant' (< 12 ans en general) ne peuvent recevoir que des taches simples, legeres et sans produits chimiques (ex : ranger ses affaires, mettre la table, nourrir un animal). " +
          "2) Les membres avec role 'ado' peuvent faire plus mais pas les taches physiquement lourdes ou administratives complexes. " +
          "3) Les membres avec isPregnant=true ne doivent pas se voir assigner de taches physiquement epuisantes ou exposant a des produits chimiques (menage lourd, port de charges, bricolage). Privilegie les taches administratives, cuisine legere, coordination. " +
          "4) Tiens compte de l'age : un enfant de moins de 8 ans ne fait que des micro-taches (< 10 min). " +
          "Reponds en JSON strict uniquement, sans markdown.",
        input:
          `Analyse ce foyer et genere un plan concret, court et actionnable. ` +
          `Donne 3 a 5 priorites de taches (avec attribution adaptee aux profils), 3 a 5 routines, 3 a 5 economies et, si le foyer attend un bebe, 1 a 5 suggestions de liste de naissance.\n\n` +
          `Contexte:\n${JSON.stringify(compactContext)}`,
        max_output_tokens: 1400
      })
    });
  } catch {
    return buildFallbackPlan(request);
  }

  if (!response.ok) {
    return buildFallbackPlan(request);
  }

  const payload = (await response.json()) as { output_text?: string };
  let maybeJson: unknown;

  try {
    maybeJson = JSON.parse(extractJsonBlock(payload.output_text ?? ""));
  } catch {
    return buildFallbackPlan(request);
  }

  const parsed = aiPlanSchema.safeParse(maybeJson);

  if (!parsed.success) {
    return buildFallbackPlan(request);
  }

  return {
    ...parsed.data,
    usedFallback: false
  };
};
