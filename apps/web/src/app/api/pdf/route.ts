import React from "react";
import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PdfTheme } from "@familyflow/shared";

import { createPlanillePdfDocument } from "@/components/pdf/familyflow-pdf-document";
import { buildPdfDatasetForCurrentUser } from "@/lib/pdf/build-pdf-dataset";

export async function GET(request: NextRequest) {
  const theme = (request.nextUrl.searchParams.get("theme") as PdfTheme | null) ?? "premium";
  const data = await buildPdfDatasetForCurrentUser();
  const pdfBuffer = await renderToBuffer(createPlanillePdfDocument(data, theme));
  const pdfBody = new Uint8Array(pdfBuffer);

  return new Response(pdfBody, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="planille-${theme}.pdf"`
    }
  });
}
