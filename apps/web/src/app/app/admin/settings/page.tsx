import { Settings } from "lucide-react";

import { Card } from "@/components/ui/card";

const globalSettings = [
  { label: "Nom de l'application", value: "FamilyFlow" },
  { label: "URL publique", value: "familyflow.app" },
  { label: "Langue par défaut", value: "Français (fr-FR)" },
  { label: "Devise par défaut", value: "EUR €" },
  { label: "Fuseau horaire", value: "Europe/Paris" }
];

const planConfig = [
  { plan: "free", label: "Gratuit", price: "0 €/mois", features: "1 foyer, 15 tâches, sans IA" },
  { plan: "plus", label: "Plus", price: "4,99 €/mois", features: "Foyer illimité, PDF, assistant IA" },
  { plan: "family-pro", label: "Family Pro", price: "9,99 €/mois", features: "Tout Plus + alertes, export avancé" }
];

const planColors: Record<string, string> = {
  "family-pro": "bg-violet-100 text-violet-700",
  plus: "bg-blue-100 text-blue-700",
  free: "bg-gray-100 text-gray-600"
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
          <Settings className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuration</h1>
          <p className="text-sm text-[var(--foreground-muted)]">Paramètres globaux de l&apos;application</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Global settings */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="font-semibold">Paramètres globaux</h2>
            <div className="space-y-2">
              {globalSettings.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl bg-[var(--card-muted)] px-4 py-3"
                >
                  <span className="text-sm text-[var(--foreground-muted)]">{item.label}</span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Plan config */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="font-semibold">Plans tarifaires</h2>
            <div className="space-y-3">
              {planConfig.map((plan) => (
                <div key={plan.plan} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${planColors[plan.plan]}`}>
                      {plan.label}
                    </span>
                    <span className="font-semibold text-sm">{plan.price}</span>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">{plan.features}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* System actions */}
        <Card>
          <div className="p-6 space-y-4">
            <h2 className="font-semibold">Actions système</h2>
            <p className="text-sm text-amber-700 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              Ces actions seront disponibles une fois les intégrations backend (Redis, Stripe, RGPD) connectées.
            </p>
            <div className="space-y-2 opacity-50 pointer-events-none">
              {[
                "🔄 Vider le cache",
                "📦 Export RGPD global",
                "⚠️ Passer en mode maintenance",
                "📊 Voir analytics PostHog"
              ].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-left text-sm font-semibold"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
