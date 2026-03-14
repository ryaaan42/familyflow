import { Settings } from "lucide-react";

import { Card } from "@/components/ui/card";
import { AdminSettingsView } from "@/components/admin/admin-settings-view";
import { getSiteContent, getFeatureFlags } from "@/lib/supabase/admin-queries";

export default async function AdminSettingsPage() {
  const [content, flags] = await Promise.all([getSiteContent(), getFeatureFlags()]);

  const maintenanceFlag = flags.find((f) => f.key === "maintenance");
  const generalContent = content.filter((c) => c.section === "general");

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

      <AdminSettingsView
        generalContent={generalContent}
        maintenanceEnabled={maintenanceFlag?.enabled ?? false}
      />

      {/* Plan info — informational only */}
      <Card>
        <div className="p-6 space-y-4">
          <h2 className="font-semibold">Plans tarifaires</h2>
          <div className="space-y-3">
            {[
              { plan: "free", label: "Gratuit", price: "0 €/mois", features: "1 foyer, 15 tâches, sans IA", color: "bg-gray-100 text-gray-700" },
              { plan: "plus", label: "Plus", price: "4,99 €/mois", features: "Foyer illimité, PDF, assistant IA", color: "bg-blue-100 text-blue-700" },
              { plan: "family-pro", label: "Family Pro", price: "9,99 €/mois", features: "Tout Plus + alertes, export avancé", color: "bg-violet-100 text-violet-700" }
            ].map((plan) => (
              <div key={plan.plan} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${plan.color}`}>
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
    </div>
  );
}
