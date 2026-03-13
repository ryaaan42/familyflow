"use client";

import { useState, useTransition } from "react";
import type { AdminSetting, PromoCode, SubscriptionPlanConfig } from "@familyflow/shared";

import {
  createPromoCode,
  togglePromoCode,
  updateAdminSetting,
  updateSubscriptionPlanConfig
} from "@/lib/supabase/admin-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
  settings: AdminSetting[];
  promoCodes: PromoCode[];
  plans: SubscriptionPlanConfig[];
}

export function AdminPlatformSettingsView({ settings, promoCodes, plans }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [promo, setPromo] = useState({ code: "", discountPercent: "", maxRedemptions: "" });

  const grouped = settings.reduce<Record<string, AdminSetting[]>>((acc, setting) => {
    acc[setting.section] = acc[setting.section] ?? [];
    acc[setting.section].push(setting);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {message ? <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p> : null}
      <Card>
        <div className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Configuration plateforme</h2>
          {Object.entries(grouped).map(([section, sectionSettings]) => (
            <div key={section} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">{section}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {sectionSettings.map((setting) => (
                  <label key={setting.key} className="space-y-1">
                    <span className="text-sm text-[var(--foreground-muted)]">{setting.label}</span>
                    <Input
                      type={setting.isSecret ? "password" : "text"}
                      defaultValue={setting.value}
                      onBlur={(e) => {
                        const next = e.currentTarget.value;
                        startTransition(async () => {
                          await updateAdminSetting(setting.key, next);
                          setMessage(`Paramètre ${setting.label} mis à jour.`);
                        });
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Plans d'abonnement Stripe</h2>
          {plans.map((plan) => (
            <div key={plan.key} className="rounded-2xl border border-[var(--border)] p-4">
              <p className="font-semibold">{plan.label}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Input
                  defaultValue={String(plan.monthlyPriceCents)}
                  onBlur={(e) => startTransition(async () => updateSubscriptionPlanConfig(plan.key, { monthlyPriceCents: Number(e.currentTarget.value || 0) }))}
                />
                <Input
                  placeholder="price_xxx"
                  defaultValue={plan.stripePriceId ?? ""}
                  onBlur={(e) => startTransition(async () => updateSubscriptionPlanConfig(plan.key, { stripePriceId: e.currentTarget.value }))}
                />
                <Button
                  variant="secondary"
                  onClick={() => startTransition(async () => updateSubscriptionPlanConfig(plan.key, { active: !plan.active }))}
                >
                  {plan.active ? "Désactiver" : "Activer"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Codes promo</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="FAMILY10" value={promo.code} onChange={(e) => setPromo((s) => ({ ...s, code: e.target.value }))} />
            <Input placeholder="Réduction %" value={promo.discountPercent} onChange={(e) => setPromo((s) => ({ ...s, discountPercent: e.target.value }))} />
            <Input placeholder="Max utilisations" value={promo.maxRedemptions} onChange={(e) => setPromo((s) => ({ ...s, maxRedemptions: e.target.value }))} />
            <Button
              disabled={pending || !promo.code}
              onClick={() =>
                startTransition(async () => {
                  await createPromoCode({
                    code: promo.code,
                    discountPercent: Number(promo.discountPercent || 0) || undefined,
                    maxRedemptions: Number(promo.maxRedemptions || 0) || undefined
                  });
                  setMessage("Code promo créé.");
                  setPromo({ code: "", discountPercent: "", maxRedemptions: "" });
                })
              }
            >
              Créer
            </Button>
          </div>
          <div className="space-y-2">
            {promoCodes.map((code) => (
              <div key={code.id} className="flex items-center justify-between rounded-xl bg-[var(--card-muted)] px-4 py-2">
                <p className="text-sm font-semibold">{code.code} · {code.discountPercent ? `${code.discountPercent}%` : `${code.discountAmount ?? 0}€`}</p>
                <Button variant="ghost" onClick={() => startTransition(async () => togglePromoCode(code.id, !code.active))}>
                  {code.active ? "Désactiver" : "Activer"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
