import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { getStripeSecretKey, getStripeWebhookSecret, verifyStripeWebhookSignature, stripeGet } from "@/lib/stripe";

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

type StripeSubscription = {
  id: string;
  customer?: string;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_start?: number;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items?: { data?: Array<{ price?: { id?: string } }> };
};

const asString = (v: unknown) => (typeof v === "string" ? v : "");
const asNumber = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));

async function resolvePlanFromPriceId(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | ReturnType<typeof createSupabaseServiceClient>, priceId: string, fallback?: string) {
  if (!priceId) return (fallback as "free" | "plus" | "family-pro" | undefined) ?? "plus";
  const { data } = await supabase.from("subscription_plans").select("key").eq("stripe_price_id", priceId).maybeSingle();
  const key = asString(data?.key);
  if (key === "free" || key === "plus" || key === "family-pro") return key;
  if (fallback === "free" || fallback === "plus" || fallback === "family-pro") return fallback;
  return "plus";
}

async function syncSubscriptionRecord(args: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | ReturnType<typeof createSupabaseServiceClient>;
  subscription: StripeSubscription;
  explicitUserId?: string;
  fallbackPlan?: string;
}) {
  const { supabase, subscription, explicitUserId, fallbackPlan } = args;
  const customerId = asString(subscription.customer);
  const subscriptionId = asString(subscription.id);
  const priceId = asString(subscription.items?.data?.[0]?.price?.id);

  if (!customerId || !subscriptionId) return;

  let userId = explicitUserId ?? "";
  if (!userId) {
    const { data: billingCustomer } = await supabase
      .from("billing_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = asString(billingCustomer?.user_id);
  }

  if (!userId) {
    userId = asString(subscription.metadata?.userId);
  }

  if (!userId) return;

  const plan = await resolvePlanFromPriceId(supabase, priceId, fallbackPlan ?? asString(subscription.metadata?.planKey));

  await supabase.from("billing_customers").upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: "stripe_customer_id" });

  await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId || null,
        status: asString(subscription.status || "active"),
        plan,
        current_period_start: asNumber(subscription.current_period_start) ? new Date(asNumber(subscription.current_period_start) * 1000).toISOString() : null,
        current_period_end: asNumber(subscription.current_period_end) ? new Date(asNumber(subscription.current_period_end) * 1000).toISOString() : null,
        cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
        metadata: subscription
      },
      { onConflict: "stripe_subscription_id" }
    );

  await supabase.from("users").update({ plan }).eq("id", userId);
}

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
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createSupabaseServiceClient() : await createSupabaseServerClient();

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const subscriptionId = asString(session.subscription);
    const userId = asString((session.metadata as Record<string, unknown> | undefined)?.userId);
    const fallbackPlan = asString((session.metadata as Record<string, unknown> | undefined)?.planKey);

    if (subscriptionId) {
      const stripeSub = await stripeGet<StripeSubscription>(`subscriptions/${subscriptionId}`);
      await syncSubscriptionRecord({ supabase, subscription: stripeSub, explicitUserId: userId, fallbackPlan });
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const sub = event.data.object as unknown as StripeSubscription;
    await syncSubscriptionRecord({ supabase, subscription: sub });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as unknown as StripeSubscription;
    const subscriptionId = asString(sub.id);
    if (subscriptionId) {
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
  }

  return NextResponse.json({ received: true });
}
