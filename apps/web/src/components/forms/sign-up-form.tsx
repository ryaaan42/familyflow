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
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

type SignUpValues = z.infer<typeof schema>;

export function SignUpForm() {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "Emma Martin",
      email: "emma@familyflow.app",
      password: "password123"
    }
  });

  return (
    <Card className="mx-auto w-full max-w-lg">
      <form className="space-y-5 p-7">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Creer un compte</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Onboarding familial simple avec email, Google ou Apple.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Nom affiche</Label>
          <Input id="displayName" {...form.register("displayName")} />
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
          <Button type="button">Creer mon foyer</Button>
          <Button type="button" variant="secondary">
            S'inscrire avec Google
          </Button>
          <Button type="button" variant="outline">
            S'inscrire avec Apple
          </Button>
        </div>
        <div className="text-sm text-[var(--foreground-muted)]">
          Deja inscrit ? <Link href="/auth/sign-in">Se connecter</Link>
        </div>
      </form>
    </Card>
  );
}

