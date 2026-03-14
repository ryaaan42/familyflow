import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeSecretKey, getStripeWebhookSecret, verifyStripeWebhookSignature } from "@/lib/stripe";

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

const resolvePlanFromPriceId = (priceId: string) => {
  const normalized = priceId.toLowerCase();
  if (normalized.includes("family") || normalized.includes("pro")) return "family-pro";
  return "plus";
};

export async function POST(request: Request) {
  if (!getStripeSecretKey() || !getStripeWebhookSecret()) {
    return NextResponse.json({ error: "Stripe webhook non configuré" }, { status: 503 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyStripeWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Signature Stripe invalide" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as StripeEvent;
  const supabase = await createSupabaseServerClient();

  const { data: existingEvent } = await supabase
    .from("billing_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existingEvent?.id) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await supabase.from("billing_events").insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event,
    processed_at: new Date().toISOString()
  });

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const sub = event.data.object;
    const customerId = String(sub.customer ?? "");
    const subscriptionId = String(sub.id ?? "");
    const priceId = String((sub.items as { data?: Array<{ price?: { id?: string } }> })?.data?.[0]?.price?.id ?? "");

    const periodStartUnix = Number(sub.current_period_start ?? 0);
    const periodEndUnix = Number(sub.current_period_end ?? 0);

    const { data: billingCustomer } = await supabase
      .from("billing_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (billingCustomer?.user_id) {
      const plan = resolvePlanFromPriceId(priceId);
      await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: billingCustomer.user_id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            status: String(sub.status ?? "active"),
            plan,
            current_period_start: periodStartUnix ? new Date(periodStartUnix * 1000).toISOString() : null,
            current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
            cancel_at_period_end: Boolean(sub.cancel_at_period_end),
            metadata: sub
          },
          { onConflict: "stripe_subscription_id" }
        );

      await supabase.from("users").update({ plan }).eq("id", billingCustomer.user_id);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const subscriptionId = String(sub.id ?? "");
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    await supabase.from("subscriptions").update({ status: "canceled", plan: "free" }).eq("stripe_subscription_id", subscriptionId);
    if (existingSub?.user_id) {
      await supabase.from("users").update({ plan: "free" }).eq("id", existingSub.user_id);
    }
  }

  return NextResponse.json({ received: true });
}
