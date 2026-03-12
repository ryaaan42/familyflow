"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirme ton mot de passe.")
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas."
  });

type UpdatePasswordValues = z.infer<typeof schema>;

export function UpdatePasswordForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Mot de passe mis a jour. Redirection en cours...");
    router.push("/app");
    router.refresh();
  });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <form className="space-y-5 p-7" onSubmit={onSubmit}>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">
            Choisir un nouveau mot de passe
          </h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Definis un nouveau mot de passe pour reprendre l&apos;acces a ton espace.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-sm text-rose-600">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-rose-600">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Mise a jour..." : "Mettre a jour"}
        </Button>
      </form>
    </Card>
  );
}
