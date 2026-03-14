import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getUserHousehold } from "@/lib/supabase/household-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(["chat", "chien", "autre"]),
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

export async function GET() {
  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const pets = await listPets(household.household.id);
  return NextResponse.json(pets);
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Payload invalide" }, { status: 400 });

  const { error } = await supabase.from("pets").insert({
    household_id: household.household.id,
    name: parsed.data.name,
    type: parsed.data.type,
    notes: parsed.data.notes?.trim() || null
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("households")
    .update({ has_pets: true })
    .eq("id", household.household.id);

  const pets = await listPets(household.household.id);
  return NextResponse.json(pets);
}
