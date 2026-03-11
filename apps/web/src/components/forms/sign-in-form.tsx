"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type SignInValues = z.infer<typeof schema>;

export function SignInForm() {
  const form = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "emma@familyflow.app",
      password: "password123"
    }
  });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <form className="space-y-5 p-7">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Connexion</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Email, mot de passe ou connexion sociale via Supabase Auth.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" {...form.register("password")} />
        </div>
        <div className="grid gap-3">
          <Button type="button">Se connecter</Button>
          <Button type="button" variant="secondary">
            Continuer avec Google
          </Button>
          <Button type="button" variant="outline">
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

