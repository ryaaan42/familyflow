import { createSupabaseServerClient } from "./server";
import type { HouseholdProfile, HouseholdMember, UserProfile } from "@familyflow/shared";

export interface DbHousehold {
  id: string;
  owner_user_id: string;
  name: string;
  housing_type: "appartement" | "maison";
  surface_sqm: number;
  rooms: number;
  children_count: number;
  has_pets: boolean;
  city: string | null;
  is_expecting_baby?: boolean;
  pregnancy_due_date?: string | null;
  birth_list_share_slug?: string | null;
  created_at: string;
}

export interface DbHouseholdMember {
  id: string;
  household_id: string;
  user_id: string | null;
  display_name: string;
  age: number;
  role: "parent" | "adulte" | "ado" | "enfant" | "autre";
  avatar_color: string;
  availability_hours_per_week: number;
  favorite_categories: string[];
  blocked_categories: string[];
  is_admin: boolean;
  is_pregnant?: boolean;
}

function mapHousehold(h: DbHousehold): HouseholdProfile["household"] {
  return {
    id: h.id,
    name: h.name,
    housingType: h.housing_type,
    surfaceSqm: h.surface_sqm,
    rooms: h.rooms,
    childrenCount: h.children_count,
    hasPets: h.has_pets,
    city: h.city ?? undefined,
    isExpectingBaby: h.is_expecting_baby,
    pregnancyDueDate: h.pregnancy_due_date ?? undefined,
    birthListShareSlug: h.birth_list_share_slug ?? undefined,
    balanceScore: 0,
    createdAt: h.created_at
  };
}

function mapMember(m: DbHouseholdMember): HouseholdMember {
  return {
    id: m.id,
    householdId: m.household_id,
    name: m.display_name,
    age: m.age,
    role: m.role,
    avatarColor: m.avatar_color,
    availabilityHoursPerWeek: m.availability_hours_per_week,
    isPregnant: m.is_pregnant,
    favoriteCategories: (m.favorite_categories ?? []) as HouseholdMember["favoriteCategories"],
    blockedCategories: (m.blocked_categories ?? []) as HouseholdMember["blockedCategories"]
  };
}

export async function getUserHousehold(): Promise<HouseholdProfile | null> {
  const supabase = await createSupabaseServerClient();

  const { data: householdData, error: householdError } = await supabase
    .from("households")
    .select("*")
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (householdError || !householdData) {
    return null;
  }

  const { data: membersData } = await supabase
    .from("household_members")
    .select("*")
    .eq("household_id", householdData.id)
    .is("deleted_at", null);

  const { data: petsData } = await supabase
    .from("pets")
    .select("*")
    .eq("household_id", householdData.id)
    .is("deleted_at", null);

  return {
    household: mapHousehold(householdData as DbHousehold),
    members: (membersData ?? []).map((m) => mapMember(m as DbHouseholdMember)),
    pets: (petsData ?? []).map((p) => ({
      id: p.id as string,
      householdId: p.household_id as string,
      name: p.name as string,
      type: p.type as "chien" | "chat" | "autre",
      notes: p.notes as string | undefined
    }))
  };
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!userProfile) return null;

  return {
    id: userProfile.id as string,
    email: userProfile.email as string,
    displayName: userProfile.display_name as string,
    locale: (userProfile.locale as string) ?? "fr-FR",
    currency: (userProfile.currency as string) ?? "EUR",
    plan: (userProfile.plan as UserProfile["plan"]) ?? "free"
  };
}
