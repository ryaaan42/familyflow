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
}

export interface CreateMemberInput {
  displayName: string;
  age: number;
  role: "parent" | "adulte" | "ado" | "enfant" | "autre";
  avatarColor: string;
  isAdmin?: boolean;
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
  const { data: existingHousehold } = await supabase
    .from("households")
    .select("id")
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (existingHousehold) {
    return { householdId: existingHousehold.id as string, error: null };
  }

  // Utiliser la fonction RPC pour créer le foyer + membres en une seule transaction.
  // Le RPC bypasse le cache schema PostgREST et garantit l'atomicité.
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
      p_members: members.map((m, i) => ({
        displayName: m.displayName,
        age: m.age,
        role: m.role,
        avatarColor: m.avatarColor,
        isAdmin: i === 0,
        isPregnant: m.isPregnant ?? false
      }))
    }
  );

  if (rpcError || !householdId) {
    return {
      householdId: null,
      error: rpcError?.message ?? "Erreur lors de la création du foyer"
    };
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
      role: member.role,
      avatar_color: member.avatarColor,
      availability_hours_per_week: 10,
      is_admin: member.isAdmin ?? false,
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
    role: "parent" | "adulte" | "ado" | "enfant" | "autre";
    avatarColor: string;
    isPregnant: boolean;
  }>
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;
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
