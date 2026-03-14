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
      suggestedMemberId: z.string().uuid().optional(),
      suggestedDayOfWeek: z.number().int().min(1).max(7).optional()
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

const getMemberCategory = (m: { memberCategory?: string; age: number }) =>
  m.memberCategory ?? (m.age <= 3 ? "bebe" : m.age <= 11 ? "enfant" : m.age <= 17 ? "ado" : "adulte");

const buildFallbackPlan = ({ profile, tasks, budgetItems, birthListItems }: AiHouseholdRequest): AiHouseholdPlan => {
  const mainAdult = profile.members.find((m) => getMemberCategory(m) === "adulte");
  const pregnantMember = profile.members.find((m) => m.isPregnant);
  const hasBaby = profile.members.some((m) => getMemberCategory(m) === "bebe");
  const hasKids = profile.members.some((m) => ["enfant", "ado"].includes(getMemberCategory(m)));
  const hasCat = profile.pets.some((pet) => pet.type === "chat");
  const hasDog = profile.pets.some((pet) => pet.type === "chien");
  const hasOtherPet = profile.pets.some((pet) => pet.type === "autre");
  const hasPets = profile.pets.length > 0;
  const eatSpend = budgetItems.filter((item) => ["restaurant_fast_food", "courses"].includes(item.category)).reduce((sum, item) => sum + item.amount, 0);

  return {
    headline: "Plan de continuité généré automatiquement",
    summary: `L'IA n'est pas disponible actuellement. Nous avons préparé un plan de continuité basé sur le profil du foyer (${profile.members.length} membre(s), logement ${profile.household.housingType}${hasPets ? `, ${profile.pets.length} animal(aux): ${profile.pets.map((p) => p.name).join(", ")}` : ""}${hasKids ? ", enfant(s) présent(s)" : ""}${pregnantMember ? `, grossesse de ${pregnantMember.name}` : ""}). L'objectif est d'assurer une base opérationnelle immédiate: tâches essentielles, routines matin/soir et arbitrages budget prioritaires.`,
    taskFocus: [
      { title: "Sortir les poubelles", reason: "Évite l'accumulation et garde les zones communes saines.", who: mainAdult?.name ?? "Adulte du foyer", when: "Lundi", category: "entretien", frequency: "hebdomadaire", estimatedMinutes: 10, suggestedMemberId: mainAdult?.id, suggestedDayOfWeek: 1 },
      { title: "Vider le lave-vaisselle", reason: "Maintient une cuisine fonctionnelle chaque jour.", who: "Ado ou adulte", when: "Mardi", category: "cuisine", frequency: "hebdomadaire", estimatedMinutes: 10, suggestedDayOfWeek: 2 },
      { title: "Planifier les repas", reason: "Réduit les achats impulsifs et le stress des soirs de semaine.", who: mainAdult?.name ?? "Adulte", when: "Dimanche", category: "courses", frequency: "hebdomadaire", estimatedMinutes: 25, suggestedMemberId: mainAdult?.id, suggestedDayOfWeek: 7 },
      { title: "Lancer une lessive", reason: "Évite les pics de charge en fin de semaine.", who: "Ado ou adulte", when: "Mercredi", category: "routine", frequency: "hebdomadaire", estimatedMinutes: 20, suggestedDayOfWeek: 3 },
      { title: "Nettoyer la salle de bain", reason: "Préserve l'hygiène générale du foyer.", who: "Adulte", when: "Jeudi", category: "hygiene", frequency: "hebdomadaire", estimatedMinutes: 30, suggestedDayOfWeek: 4 },
      { title: "Passer l'aspirateur", reason: "Maintient les sols propres et sains pour toute la famille.", who: mainAdult?.name ?? "Adulte", when: "Vendredi", category: "menage", frequency: "hebdomadaire", estimatedMinutes: 25, suggestedMemberId: mainAdult?.id, suggestedDayOfWeek: 5 },
      { title: "Faire les courses", reason: "Assure le ravitaillement de la semaine.", who: mainAdult?.name ?? "Adulte", when: "Samedi", category: "courses", frequency: "hebdomadaire", estimatedMinutes: 60, suggestedMemberId: mainAdult?.id, suggestedDayOfWeek: 6 },
      { title: "Suivi des dépenses", reason: "Anticipe les dépassements de budget.", who: mainAdult?.name ?? "Adulte", when: "Dimanche", category: "budget", frequency: "hebdomadaire", estimatedMinutes: 20, suggestedMemberId: mainAdult?.id, suggestedDayOfWeek: 7 },
      ...(hasPets ? [{ title: "Remplir les gamelles", reason: `Routine essentielle pour le bien-être de ${profile.pets.map((p) => p.name).join(", ")}.`, who: "Enfant + supervision adulte", when: "Lundi et Jeudi", category: "animaux" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 8, suggestedDayOfWeek: 1 }] : []),
      ...(hasCat ? [{ title: "Changer la litière", reason: `Maintient un environnement propre pour ${profile.pets.filter((p) => p.type === "chat").map((p) => p.name).join(", ")}.`, who: "Ado ou adulte", when: "Mercredi", category: "animaux" as TaskCategory, frequency: "hebdomadaire" as Frequency, estimatedMinutes: 12, suggestedDayOfWeek: 3 }] : []),
      ...(hasDog ? [{ title: "Promener le chien", reason: `Sorties régulières pour l'équilibre de ${profile.pets.filter((p) => p.type === "chien").map((p) => p.name).join(", ")}.`, who: "Adulte ou ado", when: "Mardi", category: "animaux" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 25, suggestedDayOfWeek: 2 }] : []),
      ...(hasOtherPet ? [{ title: "Vérifier eau et confort des animaux", reason: "Contrôle rapide des besoins essentiels des animaux du foyer.", who: "Adulte", when: "Vendredi", category: "animaux" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 6, suggestedDayOfWeek: 5 }] : []),
      ...(hasKids ? [{ title: "Préparer les cartables", reason: "Réduit les oublis et la tension matinale.", who: "Enfant/Ado avec validation adulte", when: "Lundi soir", category: "routine" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 12, suggestedDayOfWeek: 1 }] : []),
      ...(hasKids ? [{ title: "Aide aux devoirs", reason: "Accompagnement scolaire et suivi des apprentissages.", who: mainAdult?.name ?? "Adulte", when: "Mardi", category: "enfants" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 30, suggestedMemberId: mainAdult?.id, suggestedDayOfWeek: 2 }] : []),
      ...(hasBaby ? [{ title: "Routine bain bébé", reason: "Sécurise le coucher et fluidifie la soirée.", who: "Adulte", when: "Chaque soir", category: "enfants" as TaskCategory, frequency: "quotidienne" as Frequency, estimatedMinutes: 25, suggestedMemberId: mainAdult?.id, suggestedDayOfWeek: 3 }] : []),
      ...(pregnantMember ? [{ title: "Rendez-vous prénatal", reason: `Suivi médical essentiel pour ${pregnantMember.name} et le bébé à venir.`, who: pregnantMember.name, when: "Jeudi", category: "hygiene" as TaskCategory, frequency: "mensuelle" as Frequency, estimatedMinutes: 60, suggestedMemberId: pregnantMember.id, suggestedDayOfWeek: 4 }] : []),
      ...(pregnantMember ? [{ title: "Préparer la valise maternité", reason: "Anticipation des préparatifs pour l'accouchement.", who: pregnantMember.name, when: "Samedi", category: "administratif" as TaskCategory, frequency: "personnalisee" as Frequency, estimatedMinutes: 45, suggestedMemberId: pregnantMember.id, suggestedDayOfWeek: 6 }] : [])
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
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

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
          "Tu dois proposer un plan détaillé, personnalisé et bienveillant pour un foyer réel, structuré et exploitable par le code. " +
          "Respect absolu des catégories d'âge: bebe (0-3), enfant (4-11), ado (12-17), adulte (18+). " +
          "N'assigne jamais une tâche non adaptée à l'âge/capacité. " +
          "Si un membre est enceinte (isPregnant=true), génère des tâches spécifiques: suivi prénatal, préparation chambre bébé, liste naissance. " +
          "Si des animaux sont présents, génère des tâches pour chaque animal (par nom et type: chat=litière/brossage, chien=promenade/bain). " +
          "Si des enfants ou ados sont présents, génère des tâches d'accompagnement (devoirs, activités, cartables). " +
          "Retourne exactement les clés: headline, summary, taskFocus, routineSuggestions, routines, savingsMoves, notes, budgetSuggestions, birthListSuggestions.",
        input:
          "Génère un plan long, concret et actionnable: au moins 12 taskFocus bien répartis sur la semaine, 3 routineSuggestions détaillées, 4 routines, 3 savingsMoves, 3 notes. " +
          "Les taskFocus doivent OBLIGATOIREMENT inclure: titre, raison (25+ chars), qui, quand, catégorie, fréquence, durée estimée, suggestedMemberId quand possible et suggestedDayOfWeek (1=lundi..7=dimanche). " +
          "Distribue les tâches sur TOUS les jours de la semaine (1 à 7), évite de tout mettre le même jour. " +
          "Personnalise CHAQUE tâche en fonction du profil exact: noms des animaux, prénoms des membres, grossesse si applicable, âge des enfants. " +
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
