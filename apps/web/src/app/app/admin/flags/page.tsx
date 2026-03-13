import { Flag } from "lucide-react";

import { AdminFlagsView } from "@/components/admin/admin-flags-view";
import { getFeatureFlags } from "@/lib/supabase/admin-queries";

export default async function AdminFlagsPage() {
  const flags = await getFeatureFlags();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100">
          <Flag className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature flags</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Activez ou désactivez des modules sans redéploiement
          </p>
        </div>
      </div>
      <AdminFlagsView flags={flags} />
    </div>
  );
}
