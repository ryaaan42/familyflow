import { NextRequest, NextResponse } from "next/server";

export interface ReservePayload {
  slug: string;
  itemId: string;
  itemTitle: string;
  buyerName: string;
  buyerMessage?: string;
  householdName: string;
  beneficiaryEmail?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ReservePayload = await req.json();

    const { slug, itemId, itemTitle, buyerName, buyerMessage, householdName, beneficiaryEmail } = body;

    if (!slug || !itemId || !itemTitle || !buyerName) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    // --- Simulate sending an email notification to the household beneficiary ---
    // In production, replace this block with a call to Resend, SendGrid, etc.
    const emailPayload = {
      to: beneficiaryEmail ?? "famille@example.com",
      subject: `${buyerName} va offrir "${itemTitle}" pour votre liste de naissance !`,
      html: `
        <p>Bonjour,</p>
        <p><strong>${buyerName}</strong> vient de marquer qu'il/elle va acheter <strong>${itemTitle}</strong> sur la liste de naissance de <strong>${householdName}</strong>.</p>
        ${buyerMessage ? `<blockquote style="border-left:3px solid #6D5EF4;padding-left:12px;color:#555;">${buyerMessage}</blockquote>` : ""}
        <p>Merci pour votre générosité !</p>
        <p style="color:#888;font-size:12px;">— FamilyFlow</p>
      `
    };

    // Log the email payload (replace with actual email call in production)
    console.log("[birth-list/reserve] Email to send:", JSON.stringify(emailPayload, null, 2));
    console.log(`[birth-list/reserve] Slug: ${slug} | Item: ${itemId} | Buyer: ${buyerName}`);

    // --- Simulate an in-app notification (could be stored in DB notifications table) ---
    const notification = {
      type: "birth_list_purchase",
      title: `${buyerName} va offrir "${itemTitle}"`,
      body: buyerMessage ?? `Un proche a reserve cet article sur votre liste de naissance.`,
      metadata: { slug, itemId, buyerName, buyerMessage }
    };

    console.log("[birth-list/reserve] Notification:", JSON.stringify(notification, null, 2));

    return NextResponse.json({
      success: true,
      message: `Merci ${buyerName} ! La famille ${householdName} a ete notifiee.`
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
