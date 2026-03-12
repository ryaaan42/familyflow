import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold, getUserProfile } from "@/lib/supabase/household-queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const [userProfile, householdProfile] = await Promise.all([
    getUserProfile(),
    getUserHousehold()
  ]);

  if (!householdProfile) {
    redirect("/onboarding");
  }

  return (
    <AppShell userProfile={userProfile} householdProfile={householdProfile}>
      {children}
    </AppShell>
  );
}
