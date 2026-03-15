import { Card } from "@/components/ui/card";
import { getPromoCodes, getSubscriptionPlansConfig } from "@/lib/supabase/admin-queries";
import { CheckoutButton } from "@/components/app/checkout-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/household-queries";

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default async function SubscriptionPage() {
  const supabase = await createSupabaseServerClient();
  const [plans, promos, user] = await Promise.all([getSubscriptionPlansConfig(), getPromoCodes(), getUserProfile()]);

  const { data: subscription } = user
    ? await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Abonnement FamilyFlow</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Plan actuel: <strong>{user?.plan ?? "free"}</strong>
          {subscription?.status ? ` · statut Stripe: ${subscription.status}` : ""}
          {subscription?.current_period_end ? ` · fin période: ${new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}` : ""}
        </p>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Synchronisation abonnement: {process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET ? "active (Checkout + webhook)" : "incomplète — configurez STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET"}.
        </p>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {plans
          .filter((p) => p.active)
          .map((plan) => (
            <Card key={plan.key} className="p-5">
              <p className="font-semibold">{plan.label}</p>
              <p className="mt-1 text-2xl font-bold">{euro.format(plan.monthlyPriceCents / 100)}/mois</p>
              <ul className="mt-3 space-y-1 text-sm text-[var(--foreground-muted)]">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              {plan.monthlyPriceCents > 0 ? (
                <CheckoutButton priceId={plan.stripePriceId} />
              ) : (
                <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Plan gratuit actif par défaut.</p>
              )}
            </Card>
          ))}
      </div>
      <Card className="p-5">
        <p className="font-semibold">Codes promos actifs</p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          {promos
            .filter((p) => p.active)
            .map((promo) => (
              <span key={promo.id} className="rounded-full bg-[var(--card-muted)] px-3 py-1 font-medium">
                {promo.code} {promo.discountPercent ? `(-${promo.discountPercent}%)` : ""}
              </span>
            ))}
        </div>
      </Card>
    </div>
  );
}
