"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="mt-4 w-full justify-center"
      disabled={isPending}
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Deconnexion..." : "Se deconnecter"}
    </Button>
  );
}
