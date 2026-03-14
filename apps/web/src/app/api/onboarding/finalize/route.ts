import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";
import { bootstrapDefaultTasksIfEmpty } from "@/lib/supabase/task-actions";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const household = await getUserHousehold();
  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });
  }

  await bootstrapDefaultTasksIfEmpty();

  await supabase
    .from("onboarding_profiles")
    .upsert({
      household_id: household.household.id,
      created_by: user.id,
      objective: "tasks",
      answers: {
        household: household.household,
        members: household.members
      },
      completed_at: new Date().toISOString()
    });

  return NextResponse.json({ ok: true });
}
