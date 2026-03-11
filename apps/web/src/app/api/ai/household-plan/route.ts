import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createAiHouseholdPlan } from "@/lib/ai/familyflow-ai";

export const runtime = "nodejs";

const requestSchema = z.object({
  profile: z.any(),
  tasks: z.array(z.any()),
  budgetItems: z.array(z.any()),
  birthListItems: z.array(z.any()).default([])
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload IA invalide." },
      { status: 400 }
    );
  }

  const plan = await createAiHouseholdPlan(parsed.data);

  return NextResponse.json(plan);
}
