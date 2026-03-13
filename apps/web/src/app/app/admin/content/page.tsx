import { FileText } from "lucide-react";

import { AdminContentView } from "@/components/admin/admin-content-view";
import { getSiteContent } from "@/lib/supabase/admin-queries";

export default async function AdminContentPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contenu du site</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Éditez les textes marketing et les messages de l&apos;application en temps réel
          </p>
        </div>
      </div>
      <AdminContentView content={content} />
    </div>
  );
}
