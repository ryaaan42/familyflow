import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

export async function POST(req: NextRequest) {
  try {
    const body: ReservePayload = await req.json();
    const { slug, itemId, itemTitle, buyerName, buyerMessage, householdName } = body;

    if (!slug || !itemId || !itemTitle || !buyerName) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const supabase = createAnonSupabaseClient();

    const { data, error } = await supabase.rpc("reserve_birth_list_item", {
      p_slug: slug,
      p_item_id: itemId,
      p_buyer_name: buyerName.trim(),
      p_buyer_message: buyerMessage?.trim() ?? null
    });

    if (error) {
      console.error("[birth-list/reserve] rpc error:", error);
      return NextResponse.json({ error: "Erreur lors de la reservation." }, { status: 500 });
    }

    const result = data as { success: boolean; error?: string };

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
