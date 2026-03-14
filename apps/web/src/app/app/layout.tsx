import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold, getUserProfile } from "@/lib/supabase/household-queries";
import { getAppDatasetForCurrentUser } from "@/lib/supabase/app-data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const [userProfile, householdProfile, dataset] = await Promise.all([
    getUserProfile(),
    getUserHousehold(),
    getAppDatasetForCurrentUser()
  ]);

  if (!householdProfile) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      userProfile={userProfile}
      householdProfile={householdProfile}
      initialTasks={dataset?.tasks ?? []}
      initialCompletions={dataset?.completions ?? []}
      initialBudgetItems={dataset?.budgetItems ?? []}
      initialSavingsScenarios={dataset?.savingsScenarios ?? []}
      initialBirthListItems={dataset?.birthListItems ?? []}
    >
      {children}
    </AppShell>
  );
}
