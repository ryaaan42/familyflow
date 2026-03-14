import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PdfTheme } from "@familyflow/shared";

import { createPlanillePdfDocument } from "@/components/pdf/familyflow-pdf-document";
import { buildPdfDatasetForCurrentUser } from "@/lib/pdf/build-pdf-dataset";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold, getUserProfile } from "@/lib/supabase/household-queries";

const getCurrentMonthPeriod = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
};

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [profile, household] = await Promise.all([getUserProfile(), getUserHousehold()]);
  if (!profile || !household) return NextResponse.json({ error: "Aucun foyer trouvé" }, { status: 404 });

  const theme = (request.nextUrl.searchParams.get("theme") as PdfTheme | null) ?? "premium";

  const { start, end } = getCurrentMonthPeriod();
  const { data: usageCounter } = await supabase
    .from("usage_counters")
    .select("id, usage_count")
    .eq("user_id", user.id)
    .eq("metric", "pdf_exports")
    .eq("period_start", start)
    .maybeSingle();

  const currentUsage = Number(usageCounter?.usage_count ?? 0);
  if (profile.plan === "free" && currentUsage >= 3) {
    return NextResponse.json({ error: "Limite du plan gratuit atteinte (3 exports PDF/mois). Passez au premium." }, { status: 402 });
  }

  const data = await buildPdfDatasetForCurrentUser();
  if (!data) {
    return NextResponse.json({ error: "Aucun foyer trouvé" }, { status: 404 });
  }

  const pdfBuffer = await renderToBuffer(createPlanillePdfDocument(data, theme));

  const nextUsageCount = currentUsage + 1;
  if (usageCounter?.id) {
    await supabase.from("usage_counters").update({ usage_count: nextUsageCount }).eq("id", usageCounter.id);
  } else {
    await supabase.from("usage_counters").insert({
      user_id: user.id,
      household_id: household.household.id,
      metric: "pdf_exports",
      period_start: start,
      period_end: end,
      usage_count: 1
    });
  }

  await supabase.from("pdf_exports").insert({
    household_id: household.household.id,
    created_by: user.id,
    export_type: "weekly_planner",
    theme,
    metadata: { usageCount: nextUsageCount }
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="planille-${theme}.pdf"`
    }
  });
}
