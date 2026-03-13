import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin, display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) redirect("/app");

  return (
    <AdminShell adminName={profile.display_name as string} adminEmail={profile.email as string}>
      {children}
    </AdminShell>
  );
}
