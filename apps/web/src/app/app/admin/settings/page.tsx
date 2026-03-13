import { Settings } from "lucide-react";

import { AdminPlatformSettingsView } from "@/components/admin/admin-platform-settings-view";
import { getAdminSettings, getPromoCodes, getSubscriptionPlansConfig } from "@/lib/supabase/admin-queries";

export default async function AdminSettingsPage() {
  const [settings, promoCodes, plans] = await Promise.all([
    getAdminSettings(),
    getPromoCodes(),
    getSubscriptionPlansConfig()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
          <Settings className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuration avancée</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Pilotez OpenAI, Stripe, les plans et les promotions depuis l&apos;admin.
          </p>
        </div>
      </div>

      <AdminPlatformSettingsView settings={settings} promoCodes={promoCodes} plans={plans} />
    </div>
  );
}
