"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { buildAuthCallbackUrl } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email()
});

type ForgotValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<ForgotValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: buildAuthCallbackUrl("/auth/update-password")
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Email envoye. Verifie ta boite de reception.");
  });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <form className="space-y-5 p-7" onSubmit={onSubmit}>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Mot de passe oublie</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Nous allons t&apos;envoyer un lien de reinitialisation securise.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Envoi..." : "Envoyer le lien"}
        </Button>
      </form>
    </Card>
  );
}
