"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email()
});

type ForgotValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const form = useForm<ForgotValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "emma@familyflow.app"
    }
  });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <form className="space-y-5 p-7">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Mot de passe oublie</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            La route Supabase Auth sera branchee ici pour envoyer le lien de reinitialisation.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <Button type="button">Envoyer le lien</Button>
      </form>
    </Card>
  );
}

