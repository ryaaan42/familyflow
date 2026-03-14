import { z } from "zod";
import type {
  AiHouseholdPlan,
  BirthListItem,
  BudgetItem,
  HouseholdProfile,
  Task,
  TaskCategory,
  Frequency
} from "@familyflow/shared";

const aiPlanSchema = z.object({
  headline: z.string().min(12),
  summary: z.string().min(220),
  taskFocus: z.array(
    z.object({
      title: z.string().min(3),
      reason: z.string().min(25),
      who: z.string().min(2),
      when: z.string().min(3),
      category: z.enum(["menage", "cuisine", "animaux", "enfants", "administratif", "budget", "courses", "hygiene", "entretien", "routine"]).optional(),
      frequency: z.enum(["quotidienne", "hebdomadaire", "mensuelle", "personnalisee"]).optional(),
      estimatedMinutes: z.number().int().min(5).max(180).optional(),
      suggestedMemberId: z.string().uuid().optional()
    })
  ).min(8).max(20),
  routineSuggestions: z.array(z.object({
    title: z.string().min(5),
    timing: z.enum(["matin", "soir", "hebdomadaire"]),
    steps: z.array(z.string().min(8)).min(2).max(8)
  })).min(3).max(10).default([]),
  routines: z.array(z.string().min(20)).min(4).max(12),
  savingsMoves: z.array(z.string().min(20)).min(3).max(10),
  notes: z.array(z.string().min(20)).min(3).max(10).default([]),
  budgetSuggestions: z.array(z.string().min(15)).max(8).default([]),
  birthListSuggestions: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      priority: z.enum(["essentiel", "utile", "confort"])
    })
  ).max(8).default([])
});

export interface AiHouseholdRequest {
  profile: HouseholdProfile;
  tasks: Task[];
  budgetItems: BudgetItem[];
  birthListItems: BirthListItem[];
  onboardingAnswers?: Record<string, unknown>;
}

const extractJsonBlock = (value: string) => {
  const fenced = value.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) return value.slice(firstBrace, lastBrace + 1);
  return value.trim();
};

const buildFallbackPlan = ({ profile, tasks, budgetItems, birthListItems }: AiHouseholdRequest): AiHouseholdPlan => {
  const mainAdult = profile.members.find((m) => (m.memberCategory ?? (m.age <= 3 ? "bebe" : m.age <= 11 ? "enfant" : m.age <= 17 ? "ado" : "adulte")) === "adulte");
  const hasBaby = profile.members.some((m) => (m.memberCategory ?? (m.age <= 3 ? "bebe" : m.age <= 11 ? "enfant" : m.age <= 17 ? "ado" : "adulte")) === "bebe");
  const hasKids = profile.members.some((m) => ["enfant", "ado"].includes(m.memberCategory ?? ""));
  const eatSpend = budgetItems.filter((item) => ["restaurant_fast_food", "courses"].includes(item.category)).reduce((sum, item) => sum + item.amount, 0);

  return {
    headline: "Plan de continuité généré automatiquement",
    summary: `L'IA n'est pas disponible actuellement. Nous avons préparé un plan de continuité basé sur le profil du foyer (${profile.members.length} membre(s), logement ${profile.household.housingType}${profile.household.hasPets ? ", animaux présents" : ""}). L'objectif est d'assurer une base opérationnelle immédiate: tâches essentielles, routines matin/soir et arbitrages budget prioritaires.`,
    taskFocus: [
      { title: "Sortir les poubelles", reason: "Évite l'accumulation et garde les zones communes saines.", who: mainAdult?.name ?? "Adulte du foyer", when: "2 fois par semaine", category: "entretien", frequency: "hebdomadaire", estimatedMinutes: 10, suggestedMemberId: mainAdult?.id },
      { title: "Vider le lave-vaisselle", reason: "Maintient une cuisine fonctionnelle chaque jour.", who: "Ado ou adulte", when: "Chaque soir", category: "cuisine", frequency: "quotidienne", estimatedMinutes: 10 },
      { title: "Planifier les repas", reason: "Réduit les achats impulsifs et le stress des soirs de semaine.", who: mainAdult?.name ?? "Adulte", when: "Le week-end", category: "courses", frequency: "hebdomadaire", estimatedMinutes: 25, suggestedMemberId: mainAdult?.id },
      { title: "Lancer une lessive", reason: "Évite les pics de charge en fin de semaine.", who: "Ado ou adulte", when: "3 fois/semaine", category: "routine", frequency: "hebdomadaire", estimatedMinutes: 20 },
      { title: "Nettoyer la salle de bain", reason: "Préserve l'hygiène générale du foyer.", who: "Adulte", when: "1 fois/semaine", category: "hygiene", frequency: "hebdomadaire", estimatedMinutes: 30 },
      ...(profile.household.hasPets ? [{ title: "Nourrir les animaux", reason: "Routine essentielle pour le bien-être animal.", who: "Enfant + supervision adulte", when: "Matin et soir", category: "animaux" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 8 }] : []),
      ...(hasKids ? [{ title: "Préparer les cartables", reason: "Réduit les oublis et la tension matinale.", who: "Enfant/Ado avec validation adulte", when: "Chaque soir", category: "routine" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 12 }] : []),
      ...(hasBaby ? [{ title: "Routine bain bébé", reason: "Sécurise le coucher et fluidifie la soirée.", who: "Adulte", when: "Chaque soir", category: "enfants" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 25, suggestedMemberId: mainAdult?.id }] : [])
    ],
    routines: [
      "Routine matin: réveil échelonné, petit-déjeuner, sacs prêts puis départ.",
      "Routine soir: rangement express de 10 minutes puis préparation du lendemain.",
      "Point hebdo ménage: prioriser cuisine, sanitaires et zones de passage.",
      "Point budget hebdomadaire: arbitrer courses et sorties avant la semaine."
    ],
    routineSuggestions: [
      { title: "Routine matin fluide", timing: "matin", steps: ["Préparer table du petit-déjeuner", "Vérifier sacs/affaires", "Check rapide planning du jour"] },
      { title: "Routine soir anticipée", timing: "soir", steps: ["Rangement 10 minutes", "Préparer vêtements et cartables", "Lancer/plier linge selon besoin"] },
      { title: "Revue familiale hebdo", timing: "hebdomadaire", steps: ["Répartir les tâches de la semaine", "Mettre à jour la liste de courses", "Valider les dépenses et abonnements"] }
    ],
    savingsMoves: [
      `Les dépenses courses + repas externes atteignent environ ${eatSpend}€/mois: planifier les repas est prioritaire.`,
      "Centraliser les achats sur une seule session hebdomadaire réduit les achats doublons.",
      "Conserver une check-list d'abonnements permet de supprimer rapidement les frais dormants."
    ],
    budgetSuggestions: [
      "Créer un plafond hebdomadaire pour les repas extérieurs.",
      "Prévoir un menu fixe pour 3 soirs de semaine.",
      "Affecter un budget entretien maison mensuel."
    ],
    notes: [
      "Les suggestions peuvent être éditées et attribuées membre par membre dans l'écran des tâches.",
      "Si une tâche est inadaptée à l'âge, réduisez sa difficulté ou réassignez-la.",
      "Validez une revue de 10 minutes le dimanche pour maintenir le planning à jour."
    ],
    birthListSuggestions: profile.household.isExpectingBaby ? birthListItems.filter((i) => i.status === "wanted").slice(0, 3).map((i) => ({ title: i.title, reason: i.description ?? "À vérifier et prioriser.", priority: i.priority })) : [],
    usedFallback: true
  };
};

export const createAiHouseholdPlan = async (request: AiHouseholdRequest): Promise<AiHouseholdPlan> => {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-5-mini";

  if (!apiKey) return buildFallbackPlan(request);

  const compactContext = {
    household: request.profile.household,
    members: request.profile.members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      memberCategory: member.memberCategory,
      age: member.age,
      availabilityHoursPerWeek: member.availabilityHoursPerWeek,
      isPregnant: member.isPregnant,
      favoriteCategories: member.favoriteCategories,
      blockedCategories: member.blockedCategories
    })),
    pets: request.profile.pets,
    existingTasks: request.tasks.slice(0, 30).map((task) => ({
      title: task.title,
      category: task.category,
      frequency: task.frequency,
      assignedMemberId: task.assignedMemberId,
      estimatedMinutes: task.estimatedMinutes,
      minimumAge: task.minimumAge
    })),
    budget: request.budgetItems,
    birthList: request.birthListItems,
    onboardingAnswers: request.onboardingAnswers ?? {}
  };

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        instructions:
          "Tu es l'assistant IA Planille. Réponds en JSON strict, sans markdown. " +
          "Tu dois proposer un plan détaillé pour un foyer, structuré et exploitable par le code. " +
          "Respect absolu des catégories d'âge: bebe (0-3), enfant (4-11), ado (12-17), adulte (18+). " +
          "N'assigne jamais une tâche non adaptée à l'âge/capacité. " +
          "Retourne exactement les clés: headline, summary, taskFocus, routineSuggestions, routines, savingsMoves, notes, budgetSuggestions, birthListSuggestions.",
        input:
          "Génère un plan long, concret et actionnable: au moins 8 taskFocus, 3 routineSuggestions détaillées, 4 routines, 3 savingsMoves, 3 notes. " +
          "Les taskFocus doivent inclure titre, raison, qui, quand, catégorie, fréquence, durée estimée et suggestedMemberId quand possible. " +
          `Données foyer:\n${JSON.stringify(compactContext)}`,
        max_output_tokens: 2400
      })
    });
  } catch {
    return buildFallbackPlan(request);
  }

  if (!response.ok) return buildFallbackPlan(request);

  const payload = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawText =
    payload.output_text ??
    payload.output?.[0]?.content?.find((c) => c.type === "output_text")?.text ??
    payload.choices?.[0]?.message?.content ??
    "";

  let maybeJson: unknown;
  try {
    maybeJson = JSON.parse(extractJsonBlock(rawText));
  } catch {
    return buildFallbackPlan(request);
  }

  const parsed = aiPlanSchema.safeParse(maybeJson);
  if (!parsed.success) return buildFallbackPlan(request);

  return { ...parsed.data, usedFallback: false };
};
