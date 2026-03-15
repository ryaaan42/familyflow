import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { getStripeSecretKey, stripeApi } from "@/lib/stripe";

type StripeCustomer = { id: string };
type StripeSession = { url?: string };

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const writer = process.env.SUPABASE_SERVICE_ROLE_KEY ? createSupabaseServiceClient() : supabase;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    if (!getStripeSecretKey()) return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });

    const { priceId } = (await request.json()) as { priceId?: string };
    if (!priceId) return NextResponse.json({ error: "priceId requis" }, { status: 400 });

    const { data: selectedPlan } = await supabase
      .from("subscription_plans")
      .select("key, stripe_price_id, active")
      .eq("stripe_price_id", priceId)
      .eq("active", true)
      .maybeSingle();

    if (!selectedPlan?.stripe_price_id) {
      return NextResponse.json({ error: "Plan Stripe invalide ou inactif." }, { status: 400 });
    }

    const { data: existingCustomer } = await writer
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existingCustomer?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripeApi<StripeCustomer>("customers", {
        email: user.email ?? "",
        "metadata[userId]": user.id
      });
      customerId = customer.id;
      await writer.from("billing_customers").upsert({ user_id: user.id, stripe_customer_id: customerId });
    }

    const origin = request.nextUrl.origin;
    const session = await stripeApi<StripeSession>("checkout/sessions", {
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/app/subscription?checkout=success`,
      cancel_url: `${origin}/app/subscription?checkout=cancelled`,
      "metadata[userId]": user.id,
      "metadata[planKey]": String(selectedPlan.key),
      "subscription_data[metadata][userId]": user.id,
      "subscription_data[metadata][planKey]": String(selectedPlan.key),
      allow_promotion_codes: "true"
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur Checkout Stripe" }, { status: 500 });
  }
}
