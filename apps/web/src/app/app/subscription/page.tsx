import { Card } from "@/components/ui/card";
import { getPromoCodes, getSubscriptionPlansConfig } from "@/lib/supabase/admin-queries";

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default async function SubscriptionPage() {
  const [plans, promos] = await Promise.all([getSubscriptionPlansConfig(), getPromoCodes()]);

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Abonnement FamilyFlow</h1>
        <p className="text-sm text-[var(--foreground-muted)]">Les prix et Price IDs Stripe sont configurés depuis l&apos;admin. Branchez vos clés pour activer le checkout.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.filter((p) => p.active).map((plan) => (
          <Card key={plan.key} className="p-5">
            <p className="font-semibold">{plan.label}</p>
            <p className="mt-1 text-2xl font-bold">{euro.format(plan.monthlyPriceCents / 100)}/mois</p>
            <ul className="mt-3 space-y-1 text-sm text-[var(--foreground-muted)]">
              {plan.features.map((feature) => <li key={feature}>• {feature}</li>)}
            </ul>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <p className="font-semibold">Codes promos actifs</p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          {promos.filter((p) => p.active).map((promo) => (
            <span key={promo.id} className="rounded-full bg-[var(--card-muted)] px-3 py-1 font-medium">
              {promo.code} {promo.discountPercent ? `(-${promo.discountPercent}%)` : ""}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
