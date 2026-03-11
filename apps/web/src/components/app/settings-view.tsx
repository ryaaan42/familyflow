"use client";

import { useFamilyFlowStore } from "@familyflow/shared";
import { BellRing, Languages, MoonStar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function SettingsView() {
  const state = useFamilyFlowStore();

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <BellRing className="h-5 w-5 text-[var(--brand-primary)]" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="grid gap-3">
            <div className="rounded-3xl bg-[var(--card-muted)] p-4">
              <p className="font-medium">Digest email</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {state.notificationSettings.emailDigest ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="rounded-3xl bg-[var(--card-muted)] p-4">
              <p className="font-medium">Rappel budget</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                {state.notificationSettings.budgetReminder ? "Actif" : "Inactif"}
              </p>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-[var(--brand-coral)]" />
            <h2 className="text-xl font-semibold">Langue et devise</h2>
          </div>
          <div className="rounded-3xl bg-[var(--card-muted)] p-4">
            <p className="font-medium">Langue</p>
            <p className="text-sm text-[var(--foreground-muted)]">Francais prioritaire, i18n prete</p>
          </div>
          <div className="rounded-3xl bg-[var(--card-muted)] p-4">
            <p className="font-medium">Devise</p>
            <p className="text-sm text-[var(--foreground-muted)]">{state.user.currency}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <MoonStar className="h-5 w-5 text-[var(--brand-mint-strong)]" />
            <h2 className="text-xl font-semibold">Theme et plan</h2>
          </div>
          <Badge variant="mint" className="w-fit">
            {state.user.plan}
          </Badge>
          <p className="text-sm leading-7 text-[var(--foreground-muted)]">
            Le mode clair est livre en V1. Le dark mode et les variations branding sont prepares
            proprement pour la suite.
          </p>
        </div>
      </Card>
    </div>
  );
}

