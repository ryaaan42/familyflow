"use server";

import { createSupabaseServerClient } from "./server";

export interface CreateHouseholdInput {
  name: string;
  housingType: "appartement" | "maison";
  surfaceSqm: number;
  rooms: number;
  childrenCount: number;
  hasPets: boolean;
  city?: string;
  isExpectingBaby?: boolean;
  pregnancyDueDate?: string;
  objective?: string;
  aiContext?: {
    lifestyleRhythm?: string;
    mealPreferences?: string;
    organizationGoals?: string;
    weeklyBudget?: number;
    monthlyBudget?: number;
  };
}

export interface CreateMemberInput {
  displayName: string;
  age: number;
  role?: "parent" | "adulte" | "ado" | "enfant" | "autre";
  avatarColor: string;
  isAdmin?: boolean;
  isFemale?: boolean;
  isPregnant?: boolean;
}

export interface CreateHouseholdResult {
  householdId: string | null;
  error: string | null;
}

export async function createHouseholdWithMembers(
  household: CreateHouseholdInput,
  members: CreateMemberInput[]
): Promise<CreateHouseholdResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { householdId: null, error: "Non authentifié" };
  }

  // Vérifier si un household existe déjà (idempotent)
  const { data: existingMembership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (existingMembership?.household_id) {
    return { householdId: existingMembership.household_id as string, error: null };
  }

  // Utiliser la fonction RPC pour créer le foyer + membres en une seule transaction.
  // Le RPC bypasse le cache schema PostgREST et garantit l'atomicité.
  const normalizedMembers = members.map((m, i) => {
    const role = m.age <= 3 ? "autre" : m.age <= 11 ? "enfant" : m.age <= 17 ? "ado" : "adulte";
    return {
      displayName: m.displayName,
      age: m.age,
      role,
      avatarColor: m.avatarColor,
      isAdmin: i === 0,
      isFemale: m.isFemale ?? false,
      isPregnant: m.isPregnant ?? false
    };
  });

  const { data: householdId, error: rpcError } = await supabase.rpc(
    "create_household_with_members",
    {
      p_name: household.name,
      p_housing_type: household.housingType,
      p_surface_sqm: household.surfaceSqm,
      p_rooms: household.rooms,
      p_children_count: household.childrenCount,
      p_has_pets: household.hasPets,
      p_city: household.city ?? "",
      p_is_expecting_baby: household.isExpectingBaby ?? false,
      p_pregnancy_due_date: household.pregnancyDueDate || null,
      p_members: normalizedMembers
    }
  );

  if (rpcError || !householdId) {
    return {
      householdId: null,
      error: rpcError?.message ?? "Erreur lors de la création du foyer"
    };
  }

  if (household.aiContext) {
    const { error: aiContextError } = await supabase
      .from("households")
      .update({ ai_context: household.aiContext })
      .eq("id", householdId as string);

    if (aiContextError && aiContextError.code !== "PGRST204") {
      return {
        householdId: null,
        error: aiContextError.message
      };
    }
  }

  return { householdId: householdId as string, error: null };
}

export async function addHouseholdMember(
  householdId: string,
  member: CreateMemberInput
): Promise<{ memberId: string | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("household_members")
    .insert({
      household_id: householdId,
      display_name: member.displayName,
      age: member.age,
      role: member.age <= 3 ? "autre" : member.age <= 11 ? "enfant" : member.age <= 17 ? "ado" : "adulte",
      avatar_color: member.avatarColor,
      availability_hours_per_week: 10,
      is_admin: member.isAdmin ?? false,
      is_female: member.isFemale ?? false,
      is_pregnant: member.isPregnant ?? false
    })
    .select("id")
    .single();

  if (error || !data) {
    return { memberId: null, error: error?.message ?? "Erreur ajout membre" };
  }

  return { memberId: data.id as string, error: null };
}

export async function updateHouseholdMember(
  memberId: string,
  updates: Partial<{
    displayName: string;
    age: number;
    role?: "parent" | "adulte" | "ado" | "enfant" | "autre";
    avatarColor: string;
    isFemale: boolean;
    isPregnant: boolean;
  }>
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;
  if (updates.isFemale !== undefined) dbUpdates.is_female = updates.isFemale;
  if (updates.isPregnant !== undefined) dbUpdates.is_pregnant = updates.isPregnant;

  const { error } = await supabase
    .from("household_members")
    .update(dbUpdates)
    .eq("id", memberId);

  return { error: error?.message ?? null };
}

export async function deleteHouseholdMember(
  memberId: string
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("household_members")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", memberId);

  return { error: error?.message ?? null };
}
