import { Mail } from "lucide-react";

import { AdminNewsletterView } from "@/components/admin/admin-newsletter-view";
import { getEmailTemplates, getNewsletterCampaigns } from "@/lib/supabase/admin-queries";

export default async function AdminNewsletterPage() {
  const [templates, campaigns] = await Promise.all([getEmailTemplates(), getNewsletterCampaigns()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-100">
          <Mail className="h-5 w-5 text-fuchsia-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emails & Newsletter</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Personnalisez les emails transactionnels et envoyez vos campagnes depuis l&apos;admin.
          </p>
        </div>
      </div>
      <AdminNewsletterView templates={templates} campaigns={campaigns} />
    </div>
  );
}
