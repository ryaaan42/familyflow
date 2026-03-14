import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeSecretKey } from "@/lib/stripe";

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

export async function POST(request: Request) {
  if (!getStripeSecretKey() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook non configuré" }, { status: 503 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  const event = (await request.json()) as StripeEvent;
  const supabase = await createSupabaseServerClient();

  await supabase.from("billing_events").upsert({
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

    const { data: billingCustomer } = await supabase
      .from("billing_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (billingCustomer?.user_id) {
      const plan = priceId.includes("pro") ? "family-pro" : "plus";
      await supabase.from("subscriptions").upsert({
        user_id: billingCustomer.user_id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        status: String(sub.status ?? "active"),
        plan,
        cancel_at_period_end: Boolean(sub.cancel_at_period_end)
      }, { onConflict: "stripe_subscription_id" });

      await supabase.from("users").update({ plan }).eq("id", billingCustomer.user_id);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const subscriptionId = String(sub.id ?? "");
    const { data: existingSub } = await supabase.from("subscriptions").select("user_id").eq("stripe_subscription_id", subscriptionId).maybeSingle();

    await supabase.from("subscriptions").update({ status: "canceled", plan: "free" }).eq("stripe_subscription_id", subscriptionId);
    if (existingSub?.user_id) {
      await supabase.from("users").update({ plan: "free" }).eq("id", existingSub.user_id);
    }
  }

  return NextResponse.json({ received: true });
}
