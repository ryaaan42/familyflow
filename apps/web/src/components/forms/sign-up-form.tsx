"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoaderCircle } from "lucide-react";

import { buildAuthCallbackUrl, getSafeNextPath } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  newsletterOptIn: z.boolean()
});

type SignUpValues = z.infer<typeof schema>;

type SignUpFormProps = {
  nextPath?: string;
};

export function SignUpForm({ nextPath }: SignUpFormProps) {
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", email: "", password: "", newsletterOptIn: true }
  });
  const safeNextPath = getSafeNextPath(nextPath, "/onboarding");

  const onSubmit = form.handleSubmit(async (values) => {
    setAuthError(null);
    setSuccessMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: buildAuthCallbackUrl(safeNextPath),
        data: {
          display_name: values.displayName,
          newsletter_opt_in: values.newsletterOptIn
        }
      }
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data.session) {
      window.location.href = safeNextPath;
      return;
    }

    setSuccessMessage("Compte cree. Verifie ton email pour confirmer l'inscription.");
    form.reset({
      displayName: values.displayName,
      email: values.email,
      password: "",
      newsletterOptIn: values.newsletterOptIn
    });
  });

  const handleOAuthSignUp = async (provider: "google" | "apple") => {
    setAuthError(null);
    setSuccessMessage(null);
    setOauthLoading(provider);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: buildAuthCallbackUrl(safeNextPath)
        }
      });

      if (error) {
        setAuthError(error.message);
        setOauthLoading(null);
      }
    } catch {
      setOauthLoading(null);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <form className="space-y-5 p-7" onSubmit={onSubmit}>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Creer un compte</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Onboarding familial simple avec email, Google ou Apple.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Nom affiche</Label>
          <Input id="displayName" {...form.register("displayName")} />
          {form.formState.errors.displayName ? (
            <p className="text-sm text-rose-600">{form.formState.errors.displayName.message}</p>
          ) : null}
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
        <label className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2 text-sm">
          <input type="checkbox" className="mt-0.5" {...form.register("newsletterOptIn")} />
          <span>
            Je souhaite recevoir les astuces, nouveautés et newsletters PLANILLE.
          </span>
        </label>
        {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
        <div className="grid gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting || oauthLoading !== null}>
            {form.formState.isSubmitting ? (
              <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Création...</>
            ) : "Créer mon foyer"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={form.formState.isSubmitting || oauthLoading !== null}
            onClick={() => handleOAuthSignUp("google")}
          >
            {oauthLoading === "google" ? (
              <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Redirection...</>
            ) : "S'inscrire avec Google"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting || oauthLoading !== null}
            onClick={() => handleOAuthSignUp("apple")}
          >
            {oauthLoading === "apple" ? (
              <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Redirection...</>
            ) : "S'inscrire avec Apple"}
          </Button>
        </div>
        <div className="text-sm text-[var(--foreground-muted)]">
          Deja inscrit ? <Link href="/auth/sign-in">Se connecter</Link>
        </div>
      </form>
    </Card>
  );
}
