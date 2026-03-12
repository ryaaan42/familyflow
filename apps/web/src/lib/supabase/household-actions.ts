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
  objective?: string;
}

export interface CreateMemberInput {
  displayName: string;
  age: number;
  role: "parent" | "adulte" | "ado" | "enfant" | "autre";
  avatarColor: string;
  isAdmin?: boolean;
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
    return { householdId: null, error: "Non authentifie" };
  }

  const { data: existingHousehold } = await supabase
    .from("households")
    .select("id")
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (existingHousehold) {
    return { householdId: existingHousehold.id as string, error: null };
  }

  const { data: newHousehold, error: householdError } = await supabase
    .from("households")
    .insert({
      owner_user_id: user.id,
      name: household.name,
      housing_type: household.housingType,
      surface_sqm: household.surfaceSqm,
      rooms: household.rooms,
      children_count: household.childrenCount,
      has_pets: household.hasPets,
      city: household.city ?? null
    })
    .select("id")
    .single();

  if (householdError || !newHousehold) {
    return { householdId: null, error: householdError?.message ?? "Erreur creation foyer" };
  }

  const householdId = newHousehold.id as string;

  if (members.length > 0) {
    const memberRows = members.map((m, index) => ({
      household_id: householdId,
      user_id: index === 0 ? user.id : null,
      display_name: m.displayName,
      age: m.age,
      role: m.role,
      avatar_color: m.avatarColor,
      availability_hours_per_week: 10,
      is_admin: index === 0 ? true : (m.isAdmin ?? false)
    }));

    const { error: membersError } = await supabase
      .from("household_members")
      .insert(memberRows);

    if (membersError) {
      return { householdId, error: membersError.message };
    }
  }

  return { householdId, error: null };
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
      is_admin: member.isAdmin ?? false
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
  }>
): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;

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
