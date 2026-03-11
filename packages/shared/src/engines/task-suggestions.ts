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

const isTemplateEligible = (template: TaskTemplate, profile: HouseholdProfile) => {
  if (template.housingTypes && !template.housingTypes.includes(profile.household.housingType)) {
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

  if (!template.roles.includes(member.role)) {
    return false;
  }

  if (member.blockedCategories.includes(template.category)) {
    return false;
  }

  return true;
};

const scoreMember = (
  member: HouseholdMember,
  template: TaskTemplate,
  currentLoadMinutes: number
) => {
  const preferenceBoost = member.favoriteCategories.includes(template.category) ? 18 : 0;
  const availabilityBoost = member.availabilityHoursPerWeek * 2;
  const roleBoost = member.role === "parent" && template.category === "administratif" ? 8 : 0;
  const kidBoost = member.role === "enfant" && template.category === "enfants" ? 6 : 0;

  return preferenceBoost + availabilityBoost + roleBoost + kidBoost - currentLoadMinutes;
};

export const autoBalanceTasks = (
  tasks: Task[],
  profile: HouseholdProfile
): Task[] => {
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
      const leftScore = scoreMember(left, {
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
      }, loadByMember.get(left.id) ?? 0);

      const rightScore = scoreMember(right, {
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
      }, loadByMember.get(right.id) ?? 0);

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
      assignedMemberId: selected?.id ?? task.assignedMemberId
    };
  });
};

export const buildTaskSuggestions = (
  profile: HouseholdProfile,
  options: SuggestionOptions = {}
): Task[] => {
  const now = options.referenceDate ?? new Date();

  const tasks = taskTemplates
    .filter((template) => isTemplateEligible(template, profile))
    .map((template, index) => {
      const dueDate = addDays(
        now,
        template.baseFrequency === "quotidienne"
          ? 0
          : template.baseFrequency === "hebdomadaire"
            ? index % 7
            : 10
      );

      const eligibleMembers = profile.members.filter((member) => matchesMember(member, template));
      const selected = eligibleMembers.sort((left, right) => {
        const leftPref = left.favoriteCategories.includes(template.category) ? 1 : 0;
        const rightPref = right.favoriteCategories.includes(template.category) ? 1 : 0;

        if (leftPref !== rightPref) {
          return rightPref - leftPref;
        }

        return right.availabilityHoursPerWeek - left.availabilityHoursPerWeek;
      })[0];

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
        origin: "smart" as const,
        createdAt: now.toISOString()
      };
    });

  return autoBalanceTasks(tasks, profile);
};

