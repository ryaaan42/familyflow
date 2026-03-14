export type HouseholdMemberCategory = "adulte" | "ado" | "enfant" | "bebe";

export const getMemberCategoryFromAge = (age: number): HouseholdMemberCategory => {
  if (age <= 3) return "bebe";
  if (age <= 11) return "enfant";
  if (age <= 17) return "ado";
  return "adulte";
};

export const getMemberCategoryLabel = (category: HouseholdMemberCategory) => {
  switch (category) {
    case "adulte":
      return "Adulte";
    case "ado":
      return "Ado";
    case "enfant":
      return "Enfant";
    case "bebe":
      return "Bébé";
  }
};

export const isAgeMatchingCategory = (age: number, category: HouseholdMemberCategory) => {
  return getMemberCategoryFromAge(age) === category;
};
