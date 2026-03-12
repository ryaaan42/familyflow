"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { buildAuthCallbackUrl, getSafeNextPath } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type SignInValues = z.infer<typeof schema>;

type SignInFormProps = {
  nextPath?: string;
  authErrorCode?: string | null;
};

export function SignInForm({ nextPath, authErrorCode }: SignInFormProps) {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(
    authErrorCode === "auth_callback_failed"
      ? "La connexion n'a pas pu etre finalisee. Reessaie."
      : null
  );
  const form = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const safeNextPath = getSafeNextPath(nextPath, "/app");

  const onSubmit = form.handleSubmit(async (values) => {
    setAuthError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.push(safeNextPath);
    router.refresh();
  });

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setAuthError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildAuthCallbackUrl(safeNextPath)
      }
    });

    if (error) {
      setAuthError(error.message);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <form className="space-y-5 p-7" onSubmit={onSubmit}>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Connexion</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Email, mot de passe ou connexion sociale via Supabase Auth.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-sm text-rose-600">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}
        <div className="grid gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOAuthSignIn("google")}
          >
            Continuer avec Google
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOAuthSignIn("apple")}>
            Continuer avec Apple
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
          <Link href="/auth/forgot-password">Mot de passe oublie</Link>
          <Link href="/auth/sign-up">Creer un compte</Link>
        </div>
      </form>
    </Card>
  );
}
