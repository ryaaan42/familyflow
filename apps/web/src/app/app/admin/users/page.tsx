import { Users2 } from "lucide-react";

import { AdminUsersView } from "@/components/admin/admin-users-view";
import { getAllUsers } from "@/lib/supabase/admin-queries";

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
          <Users2 className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-[var(--foreground-muted)]">{users.length} comptes enregistrés</p>
        </div>
      </div>
      <AdminUsersView users={users} />
    </div>
  );
}
