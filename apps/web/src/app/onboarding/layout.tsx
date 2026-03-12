import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserHousehold } from "@/lib/supabase/household-queries";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const household = await getUserHousehold();
  if (household) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,rgba(18,18,48,0.97),rgba(68,60,167,0.92),rgba(67,139,230,0.84),rgba(86,199,161,0.76))]">
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">FamilyFlow</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-white md:text-5xl">
            Bienvenue !
          </h1>
          <p className="mt-3 text-[15px] text-white/70">
            Configurons votre foyer en quelques étapes simples.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
