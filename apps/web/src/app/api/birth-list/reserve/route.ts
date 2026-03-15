import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

type ReservePayload = {
  slug?: string;
  itemId?: string;
  itemTitle?: string;
  buyerName?: string;
  buyerMessage?: string;
  householdName?: string;
  action?: "intent" | "reserved" | "purchased";
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 500 });
    }

    const body: ReservePayload = await req.json();
    const { slug, itemId, itemTitle, buyerName, buyerMessage, householdName, action = "reserved" } = body;

    if (!slug || !itemId || !itemTitle || !buyerName) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const service = createSupabaseServiceClient();

    const { data: household } = await service.from("households").select("id").eq("birth_list_share_slug", slug).maybeSingle();
    if (!household) return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });

    const { data: item } = await service
      .from("birth_list_items")
      .select("id, status, quantity, reserved_quantity")
      .eq("id", itemId)
      .eq("household_id", household.id)
      .maybeSingle();

    if (!item) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    if (item.status === "received" && action !== "intent") {
      return NextResponse.json({ error: "Article déjà reçu" }, { status: 409 });
    }

    const currentReserved = Number(item.reserved_quantity ?? 0);
    const maxQty = Number(item.quantity ?? 1);

    let nextReserved = currentReserved;
    let nextStatus = item.status;

    if (action === "reserved") {
      if (currentReserved >= maxQty) return NextResponse.json({ error: "Article déjà réservé" }, { status: 409 });
      nextReserved = currentReserved + 1;
      nextStatus = nextReserved >= maxQty ? "reserved" : item.status;
    }

    if (action === "purchased") {
      nextReserved = Math.max(currentReserved, 1);
      nextStatus = "received";
    }

    const { error: updateError } = await service
      .from("birth_list_items")
      .update({ reserved_quantity: nextReserved, status: nextStatus })
      .eq("id", item.id)
      .eq("reserved_quantity", currentReserved);

    if (updateError) return NextResponse.json({ error: "Conflit de réservation, réessayez." }, { status: 409 });

    await service.from("birth_list_reservations").insert({
      item_id: item.id,
      buyer_name: buyerName.trim(),
      buyer_message: buyerMessage?.trim() || null,
      action
    });

    return NextResponse.json({
      success: true,
      item: { id: item.id, status: nextStatus, reservedQuantity: nextReserved },
      message: `Merci ${buyerName} ! La famille ${householdName ?? ""} a été notifiée.`
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
