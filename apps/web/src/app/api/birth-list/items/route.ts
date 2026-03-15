import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

const createSchema = z.object({
  title: z.string().min(1).max(250),
  category: z.enum(["mobilier", "repas", "sorties", "hygiene", "vetements", "eveil", "soin"]),
  priority: z.enum(["essentiel", "utile", "confort"]),
  estimatedPrice: z.coerce.number().nonnegative().optional().nullable(),
  quantity: z.coerce.number().int().min(1).optional(),
  storeUrl: z.string().max(2000).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().max(2000).optional().nullable()
});

const isRlsError = (error: { code?: string; message?: string } | null) =>
  Boolean(error && (error.code === "42501" || String(error.message ?? "").toLowerCase().includes("row-level security")));

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable." }, { status: 404 });

  const { data: items, error } = await supabase
    .from("birth_list_items")
    .select()
    .eq("household_id", household.household.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[birth-list/items] fetch error:", error);
    return NextResponse.json({ error: "Erreur lors du chargement." }, { status: 500 });
  }

  return NextResponse.json({ items: items ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ? createSupabaseServiceClient() : null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise." }, { status: 401 });

  const household = await getUserHousehold();
  if (!household) return NextResponse.json({ error: "Foyer introuvable." }, { status: 404 });

  const body = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const payload = {
    household_id: household.household.id,
    title: body.data.title.trim(),
    category: body.data.category,
    priority: body.data.priority,
    status: "wanted",
    quantity: body.data.quantity ?? 1,
    reserved_quantity: 0,
    estimated_price:
      body.data.estimatedPrice === undefined || body.data.estimatedPrice === null
        ? null
        : Number(body.data.estimatedPrice),
    store_url:
      body.data.storeUrl === undefined || body.data.storeUrl === null
        ? null
        : body.data.storeUrl.trim() || null,
    description:
      body.data.description === undefined || body.data.description === null
        ? null
        : body.data.description.trim() || null,
    image_url:
      body.data.imageUrl === undefined || body.data.imageUrl === null
        ? null
        : body.data.imageUrl.trim() || null
  };

  let { data: item, error } = await supabase.from("birth_list_items").insert(payload).select().single();

  if (isRlsError(error) && service) {
    const retry = await service.from("birth_list_items").insert(payload).select().single();
    item = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error("[birth-list/items] insert error:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajout." }, { status: 500 });
  }

  return NextResponse.json({ success: true, item }, { status: 201 });
}
