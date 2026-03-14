import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PdfTheme } from "@familyflow/shared";

import { createPlanillePdfDocument } from "@/components/pdf/familyflow-pdf-document";
import { buildPdfDatasetForCurrentUser } from "@/lib/pdf/build-pdf-dataset";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const theme = (request.nextUrl.searchParams.get("theme") as PdfTheme | null) ?? "premium";
  const data = await buildPdfDatasetForCurrentUser();

  if (!data) {
    return NextResponse.json({ error: "Aucun foyer trouvé" }, { status: 404 });
  }

  const pdfBuffer = await renderToBuffer(createPlanillePdfDocument(data, theme));

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="planille-${theme}.pdf"`
    }
  });
}
