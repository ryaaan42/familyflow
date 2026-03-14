import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const context = String(body.context ?? "").toLowerCase();

  const base = ["Lait", "Oeufs", "Fruits de saison", "Légumes", "Pâtes", "Riz", "Poulet", "Yaourts", "Pain complet"];
  const extras: string[] = [];

  if (context.includes("bébé") || context.includes("enceinte")) {
    extras.push("Compotes sans sucre", "Céréales enrichies", "Eau minérale");
  }
  if (context.includes("veggie") || context.includes("végét")) {
    extras.push("Tofu", "Pois chiches", "Lentilles");
  }
  if (context.includes("enfant")) {
    extras.push("Fromage râpé", "Purée de pommes", "Galettes de maïs");
  }

  return NextResponse.json({ items: [...base, ...extras] });
}
