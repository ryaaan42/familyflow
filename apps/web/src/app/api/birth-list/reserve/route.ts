import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

export interface ReservePayload {
  slug: string;
  itemId: string;
  itemTitle: string;
  buyerName: string;
  buyerMessage?: string;
  householdName: string;
}

// Public endpoint — no user session required.
// Uses an anon Supabase client to call the SECURITY DEFINER RPC
// which handles slug validation + atomic DB update.
function createAnonSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function reserveWithServiceDirect({
  slug,
  itemId,
  buyerName,
  buyerMessage
}: {
  slug: string;
  itemId: string;
  buyerName: string;
  buyerMessage?: string;
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Configuration serveur incomplète." };
  }
  const serviceClient = createSupabaseServiceClient();

  const { data: household, error: householdError } = await serviceClient
    .from("households")
    .select("id")
    .eq("birth_list_share_slug", slug)
    .maybeSingle();

  if (householdError || !household) {
    return { success: false, error: "Liste introuvable" };
  }

  const { data: item, error: itemError } = await serviceClient
    .from("birth_list_items")
    .select("id, status, quantity, reserved_quantity")
    .eq("id", itemId)
    .eq("household_id", household.id)
    .maybeSingle();

  if (itemError || !item) {
    return { success: false, error: "Article introuvable" };
  }

  if (item.status === "received") {
    return { success: false, error: "Article deja recu" };
  }

  const currentReserved = item.reserved_quantity ?? 0;
  const totalQuantity = item.quantity ?? 1;

  if (currentReserved >= totalQuantity) {
    return { success: false, error: "Article deja entierement reserve" };
  }

  const nextReserved = currentReserved + 1;
  const nextStatus = nextReserved >= totalQuantity ? "reserved" : item.status;

  const { error: updateError } = await serviceClient
    .from("birth_list_items")
    .update({
      reserved_quantity: nextReserved,
      status: nextStatus
    })
    .eq("id", item.id)
    .eq("reserved_quantity", currentReserved);

  if (updateError) {
    return { success: false, error: "Erreur lors de la reservation." };
  }

  const { error: reservationError } = await serviceClient
    .from("birth_list_reservations")
    .insert({
      item_id: item.id,
      buyer_name: buyerName.trim(),
      buyer_message: buyerMessage?.trim() || null
    });

  if (reservationError) {
    return { success: false, error: "Erreur lors de la reservation." };
  }

  return { success: true };
}

async function reserveWithFallback({
  slug,
  itemId,
  buyerName,
  buyerMessage
}: {
  slug: string;
  itemId: string;
  buyerName: string;
  buyerMessage?: string;
}) {
  const rpcPayload = {
    p_slug: slug,
    p_item_id: itemId,
    p_buyer_name: buyerName.trim(),
    p_buyer_message: buyerMessage?.trim() ?? null
  };

  const anonClient = createAnonSupabaseClient();
  const anonResult = await anonClient.rpc("reserve_birth_list_item", rpcPayload);

  if (!anonResult.error) {
    return { data: anonResult.data, error: null };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { data: null, error: anonResult.error };
  }

  const serviceClient = createSupabaseServiceClient();
  const serviceResult = await serviceClient.rpc("reserve_birth_list_item", rpcPayload);

  if (!serviceResult.error) {
    console.warn("[birth-list/reserve] anon rpc failed, service fallback succeeded:", anonResult.error);
    return { data: serviceResult.data, error: null };
  }

  console.warn("[birth-list/reserve] rpc failed with both anon and service clients, trying direct fallback", {
    anonError: anonResult.error,
    serviceError: serviceResult.error
  });

  const directResult = await reserveWithServiceDirect({ slug, itemId, buyerName, buyerMessage });
  return {
    data: directResult,
    error: directResult.success ? null : serviceResult.error ?? anonResult.error
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: ReservePayload = await req.json();
    const { slug, itemId, itemTitle, buyerName, buyerMessage, householdName } = body;

    if (!slug || !itemId || !itemTitle || !buyerName) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const { data, error } = await reserveWithFallback({
      slug,
      itemId,
      buyerName,
      buyerMessage
    });

    if (error) {
      console.error("[birth-list/reserve] rpc error:", error);
      return NextResponse.json({ error: "Erreur lors de la reservation." }, { status: 500 });
    }

    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    const result = (parsed ?? {}) as { success?: boolean; error?: string };

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Reservation impossible." }, { status: 409 });
    }

    // Simulate sending an email notification to the beneficiary.
    // Replace with Resend / SendGrid / etc. in production.
    const emailPayload = {
      subject: `${buyerName} va offrir "${itemTitle}" pour votre liste de naissance !`,
      html: `
        <p>Bonjour,</p>
        <p><strong>${buyerName}</strong> vient de marquer qu'il/elle va acheter
           <strong>${itemTitle}</strong> sur la liste de naissance de
           <strong>${householdName}</strong>.</p>
        ${buyerMessage
          ? `<blockquote style="border-left:3px solid #6D5EF4;padding-left:12px;color:#555;">${buyerMessage}</blockquote>`
          : ""}
        <p>Merci pour votre générosité !</p>
        <p style="color:#888;font-size:12px;">— Planille</p>
      `
    };
    console.log("[birth-list/reserve] Email to send:", JSON.stringify(emailPayload, null, 2));

    return NextResponse.json({
      success: true,
      message: `Merci ${buyerName} ! La famille ${householdName} a ete notifiee.`
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
