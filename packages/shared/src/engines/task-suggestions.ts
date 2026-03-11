import { addDays } from "date-fns";

import { taskTemplates } from "../constants";
import {
  HouseholdProfile,
  HouseholdMember,
  Task,
  TaskCategory,
  TaskTemplate
} from "../types";

export interface SuggestionOptions {
  referenceDate?: Date;
  includeKidBadges?: boolean;
}

const categoryDayOffsets: Record<TaskCategory, number> = {
  routine: 0,
  courses: 1,
  administratif: 2,
  entretien: 3,
  hygiene: 4,
  menage: 5,
  budget: 6,
  cuisine: 2,
  enfants: 1,
  animaux: 5
};

const isTemplateEligible = (template: TaskTemplate, profile: HouseholdProfile) => {
  if (template.housingTypes && !template.housingTypes.includes(profile.household.housingType)) {
    return false;
  }

  if (template.householdSizeMin && profile.members.length < template.householdSizeMin) {
    return false;
  }

  if (template.childrenCountMin && profile.household.childrenCount < template.childrenCountMin) {
    return false;
  }

  if (template.roomCountMin && profile.household.rooms < template.roomCountMin) {
    return false;
  }

  if (template.requiresPetType) {
    if (template.requiresPetType === "any") {
      return profile.pets.length > 0;
    }

    return profile.pets.some((pet) => pet.type === template.requiresPetType);
  }

  return true;
};

const matchesMember = (member: HouseholdMember, template: TaskTemplate) => {
  if (member.age < template.minAge) {
    return false;
  }

  if (template.maxAge && member.age > template.maxAge) {
    return false;
  }

  if (!template.roles.includes(member.role)) {
    return false;
  }

  if (member.blockedCategories.includes(template.category)) {
    return false;
  }

  return true;
};

const buildTemplatePriority = (template: TaskTemplate, profile: HouseholdProfile) => {
  let score = template.points;

  if (template.category === "animaux" && profile.pets.length > 0) {
    score += 24;
  }

  if (template.category === "routine" && profile.household.childrenCount > 0) {
    score += 18;
  }

  if (template.category === "courses" && profile.members.length >= 4) {
    score += 16;
  }

  if (template.category === "budget" && profile.members.length >= 3) {
    score += 14;
  }

  if ((template.category === "menage" || template.category === "entretien") && profile.household.rooms >= 5) {
    score += 15;
  }

  if (template.category === "cuisine" && profile.household.childrenCount > 0) {
    score += 10;
  }

  if (template.baseFrequency === "quotidienne") {
    score += 8;
  }

  if (template.indirectCostPerMonth) {
    score += Math.min(template.indirectCostPerMonth / 2, 18);
  }

  return score;
};

const scoreMember = (
  member: HouseholdMember,
  template: TaskTemplate,
  currentLoadMinutes: number,
  profile: HouseholdProfile
) => {
  const preferenceBoost = member.favoriteCategories.includes(template.category) ? 26 : 0;
  const availabilityBoost = member.availabilityHoursPerWeek * 2.4;
  const ageHeadroomBoost = Math.max(member.age - template.minAge, 0) * 0.4;
  const loadPenalty = currentLoadMinutes * 0.85;
  const adminBoost = member.role === "parent" && template.category === "administratif" ? 14 : 0;
  const budgetBoost = member.role !== "enfant" && template.category === "budget" ? 12 : 0;
  const kitchenBoost =
    (member.role === "ado" || member.role === "parent" || member.role === "adulte") &&
    template.category === "cuisine"
      ? 8
      : 0;
  const petBoost =
    template.category === "animaux" && member.favoriteCategories.includes("animaux") ? 10 : 0;
  const kidBoost =
    member.role === "enfant" && (template.category === "enfants" || template.category === "routine")
      ? 12
      : 0;
  const pregnancyPenalty =
    member.isPregnant && (template.category === "menage" || template.estimatedMinutes >= 30 || template.difficulty >= 4)
      ? 22
      : 0;
  const pregnancySafeBoost =
    member.isPregnant && (template.category === "administratif" || template.category === "budget" || template.category === "routine")
      ? 10
      : 0;
  const householdComplexityBoost =
    profile.members.length >= 4 && member.role !== "enfant" && template.difficulty >= 3 ? 6 : 0;

  return (
    preferenceBoost +
    availabilityBoost +
    ageHeadroomBoost +
    adminBoost +
    budgetBoost +
    kitchenBoost +
    petBoost +
    kidBoost +
    pregnancySafeBoost +
    householdComplexityBoost -
    pregnancyPenalty -
    loadPenalty
  );
};

const getDayOffset = (template: TaskTemplate, index: number) => {
  if (typeof template.preferredDayOffset === "number") {
    return template.preferredDayOffset % 7;
  }

  if (template.baseFrequency === "quotidienne") {
    return 0;
  }

  if (template.baseFrequency === "hebdomadaire") {
    return (categoryDayOffsets[template.category] + index) % 7;
  }

  return (index + 3) % 7;
};

const buildSmartReason = (
  template: TaskTemplate,
  profile: HouseholdProfile,
  selected?: HouseholdMember
) => {
  const reasons: string[] = [];

  if (profile.pets.length > 0 && template.category === "animaux") {
    reasons.push(
      profile.pets.length > 1 ? `${profile.pets.length} animaux a gerer` : "1 animal a gerer"
    );
  }

  if (profile.household.childrenCount > 0 && template.category === "routine") {
    reasons.push("routine utile pour fluidifier les matins et les soirs");
  }

  if (profile.members.length >= 4 && (template.category === "courses" || template.category === "cuisine")) {
    reasons.push("foyer actif avec plusieurs repas a anticiper");
  }

  if (profile.household.rooms >= 5 && (template.category === "menage" || template.category === "entretien")) {
    reasons.push(`${profile.household.rooms} pieces a garder sous controle`);
  }

  if (selected && selected.favoriteCategories.includes(template.category)) {
    reasons.push(`${selected.name} est a l'aise sur cette categorie`);
  }

  if (reasons.length === 0) {
    reasons.push(`propose selon l'age minimum ${template.minAge}+ et le profil du foyer`);
  }

  return reasons[0];
};

export const autoBalanceTasks = (tasks: Task[], profile: HouseholdProfile): Task[] => {
  const loadByMember = new Map<string, number>();

  for (const member of profile.members) {
    loadByMember.set(member.id, 0);
  }

  return tasks.map((task) => {
    const eligible = profile.members.filter((member) => {
      if (task.minimumAge && member.age < task.minimumAge) {
        return false;
      }

      if (task.recommendedRoles && !task.recommendedRoles.includes(member.role)) {
        return false;
      }

      return !member.blockedCategories.includes(task.category as TaskCategory);
    });

    const candidates = eligible.length > 0 ? eligible : profile.members;

    const selected = [...candidates].sort((left, right) => {
      const leftScore = scoreMember(
        left,
        {
          id: task.id,
          title: task.title,
          description: task.description ?? "",
          category: task.category,
          minAge: task.minimumAge ?? 0,
          roles: task.recommendedRoles ?? ["parent", "adulte", "ado", "enfant", "autre"],
          baseFrequency: task.frequency,
          estimatedMinutes: task.estimatedMinutes,
          difficulty: task.difficulty,
          indirectCostPerMonth: task.indirectCostPerMonth,
          points: task.estimatedMinutes
        },
        loadByMember.get(left.id) ?? 0,
        profile
      );

      const rightScore = scoreMember(
        right,
        {
          id: task.id,
          title: task.title,
          description: task.description ?? "",
          category: task.category,
          minAge: task.minimumAge ?? 0,
          roles: task.recommendedRoles ?? ["parent", "adulte", "ado", "enfant", "autre"],
          baseFrequency: task.frequency,
          estimatedMinutes: task.estimatedMinutes,
          difficulty: task.difficulty,
          indirectCostPerMonth: task.indirectCostPerMonth,
          points: task.estimatedMinutes
        },
        loadByMember.get(right.id) ?? 0,
        profile
      );

      return rightScore - leftScore;
    })[0];

    if (selected) {
      loadByMember.set(
        selected.id,
        (loadByMember.get(selected.id) ?? 0) + task.estimatedMinutes
      );
    }

    return {
      ...task,
      assignedMemberId: selected?.id ?? task.assignedMemberId,
      smartReason:
        task.smartReason ??
        buildSmartReason(
          {
            id: task.id,
            title: task.title,
            description: task.description ?? "",
            category: task.category,
            minAge: task.minimumAge ?? 0,
            roles: task.recommendedRoles ?? ["parent", "adulte", "ado", "enfant", "autre"],
            baseFrequency: task.frequency,
            estimatedMinutes: task.estimatedMinutes,
            difficulty: task.difficulty,
            indirectCostPerMonth: task.indirectCostPerMonth,
            points: task.estimatedMinutes
          },
          profile,
          selected
        )
    };
  });
};

export const buildTaskSuggestions = (
  profile: HouseholdProfile,
  options: SuggestionOptions = {}
): Task[] => {
  const now = options.referenceDate ?? new Date();
  const loadByMember = new Map<string, number>();

  for (const member of profile.members) {
    loadByMember.set(member.id, 0);
  }

  const tasks = taskTemplates
    .filter((template) => isTemplateEligible(template, profile))
    .sort((left, right) => buildTemplatePriority(right, profile) - buildTemplatePriority(left, profile))
    .map((template, index) => {
      const dueDate = addDays(now, getDayOffset(template, index));
      const eligibleMembers = profile.members.filter((member) => matchesMember(member, template));
      const selected = [...eligibleMembers].sort((left, right) => {
        const leftScore = scoreMember(left, template, loadByMember.get(left.id) ?? 0, profile);
        const rightScore = scoreMember(right, template, loadByMember.get(right.id) ?? 0, profile);
        return rightScore - leftScore;
      })[0];

      if (selected) {
        loadByMember.set(
          selected.id,
          (loadByMember.get(selected.id) ?? 0) + template.estimatedMinutes
        );
      }

      return {
        id: `task-${template.id}`,
        householdId: profile.household.id,
        title: template.title,
        description: template.description,
        category: template.category,
        frequency: template.baseFrequency,
        dueDate: dueDate.toISOString(),
        status: "todo" as const,
        estimatedMinutes: template.estimatedMinutes,
        difficulty: template.difficulty,
        indirectCostPerMonth: template.indirectCostPerMonth,
        assignedMemberId: selected?.id,
        templateId: template.id,
        minimumAge: template.minAge,
        recommendedRoles: template.roles,
        smartReason: buildSmartReason(template, profile, selected),
        origin: "smart" as const,
        createdAt: now.toISOString()
      };
    });

  return autoBalanceTasks(tasks, profile);
};
