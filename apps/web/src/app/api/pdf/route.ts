import React from "react";
import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createDemoDataset, PdfTheme } from "@familyflow/shared";

import { createFamilyFlowPdfDocument } from "@/components/pdf/familyflow-pdf-document";

export async function GET(request: NextRequest) {
  const theme = (request.nextUrl.searchParams.get("theme") as PdfTheme | null) ?? "premium";
  const data = createDemoDataset();
  const pdfBuffer = await renderToBuffer(createFamilyFlowPdfDocument(data, theme));
  const pdfBody = new Uint8Array(pdfBuffer);

  return new Response(pdfBody, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="familyflow-${theme}.pdf"`
    }
  });
}
