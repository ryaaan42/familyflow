import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getUserHousehold } from "@/lib/supabase/household-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  type: z.enum(["chat", "chien", "autre"]).optional(),
  notes: z.string().max(500).optional()
});

async function listPets(householdId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("pets")
    .select("id, household_id, name, type, notes")
    .eq("household_id", householdId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (data ?? []).map((pet) => ({
    id: pet.id as string,
    householdId: pet.household_id as string,
    name: pet.name as string,
    type: pet.type as "chat" | "chien" | "autre",
    notes: (pet.notes as string | null) ?? undefined
  }));
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();

  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Payload invalide" }, { status: 400 });

  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
  if (parsed.data.type !== undefined) updatePayload.type = parsed.data.type;
  if (parsed.data.notes !== undefined) updatePayload.notes = parsed.data.notes.trim() || null;

  const { error } = await supabase
    .from("pets")
    .update(updatePayload)
    .eq("id", id)
    .eq("household_id", household.household.id)
    .is("deleted_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pets = await listPets(household.household.id);
  return NextResponse.json(pets);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();

  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const { error } = await supabase
    .from("pets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("household_id", household.household.id)
    .is("deleted_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pets = await listPets(household.household.id);

  await supabase
    .from("households")
    .update({ has_pets: pets.length > 0 })
    .eq("id", household.household.id);

  return NextResponse.json(pets);
}
