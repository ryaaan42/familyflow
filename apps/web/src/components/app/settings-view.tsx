"use client";

import { useState } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import {
  Bell,
  BellRing,
  Check,
  Globe,
  Languages,
  Mail,
  MoonStar,
  Smartphone,
  Star,
  User,
  Wallet
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
        enabled ? "bg-[var(--brand-primary)]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const planDetails: Record<string, { label: string; color: string; bg: string; features: string[] }> = {
  free: {
    label: "Gratuit",
    color: "text-gray-600",
    bg: "bg-gray-100",
    features: ["1 foyer", "15 tâches max", "Export PDF basique"]
  },
  plus: {
    label: "Plus",
    color: "text-blue-700",
    bg: "bg-blue-100",
    features: ["Foyer illimité", "PDF multi-thèmes", "Assistant IA", "Historique 6 mois"]
  },
  "family-pro": {
    label: "Family Pro",
    color: "text-violet-700",
    bg: "bg-violet-100",
    features: ["Tout Plus", "Alertes budget", "Export avancé", "Support prioritaire"]
  }
};

export function SettingsView() {
  const state = useFamilyFlowStore();
  const plan = planDetails[state.user.plan] ?? planDetails.free;

  const [emailDigest, setEmailDigest] = useState(state.notificationSettings.emailDigest);
  const [budgetReminder, setBudgetReminder] = useState(state.notificationSettings.budgetReminder);
  const [taskReminders, setTaskReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [pushMobile, setPushMobile] = useState(false);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Paramètres</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            {state.user.displayName} · {state.user.email}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── Notifications ── */}
        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[rgba(53,89,230,0.12)] p-2.5 text-[var(--brand-primary)]">
                <BellRing className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Digest email hebdo",
                  description: "Résumé de la semaine tous les lundis",
                  icon: Mail,
                  value: emailDigest,
                  onChange: setEmailDigest
                },
                {
                  label: "Rappel budget",
                  description: "Alerte si un poste dépasse le seuil",
                  icon: Wallet,
                  value: budgetReminder,
                  onChange: setBudgetReminder
                },
                {
                  label: "Rappels tâches",
                  description: "Notification avant échéance",
                  icon: Bell,
                  value: taskReminders,
                  onChange: setTaskReminders
                },
                {
                  label: "Rapport hebdo",
                  description: "Bilan famille chaque dimanche soir",
                  icon: Star,
                  value: weeklyReport,
                  onChange: setWeeklyReport
                },
                {
                  label: "Push mobile",
                  description: "Notifications sur l'app iOS / Android",
                  icon: Smartphone,
                  value: pushMobile,
                  onChange: setPushMobile
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-[var(--card-muted)] px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[var(--foreground-subtle)]" />
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-[var(--foreground-subtle)]">{item.description}</p>
                      </div>
                    </div>
                    <Toggle enabled={item.value} onChange={item.onChange} />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ── Langue & devise ── */}
        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[rgba(255,126,107,0.14)] p-2.5 text-[var(--brand-coral)]">
                <Languages className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">Langue et devise</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
                  Langue de l'interface
                </p>
                <div className="grid gap-2">
                  {[
                    { code: "fr", label: "Français", flag: "🇫🇷", active: true },
                    { code: "en", label: "English", flag: "🇬🇧", active: false },
                    { code: "es", label: "Español", flag: "🇪🇸", active: false }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                        lang.active
                          ? "border-[var(--brand-primary)] bg-[rgba(53,89,230,0.08)] font-semibold text-[var(--brand-primary)]"
                          : "border-[var(--border)] bg-white/60 text-[var(--foreground-muted)] hover:bg-white"
                      }`}
                    >
                      <span>
                        {lang.flag} {lang.label}
                      </span>
                      {lang.active && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
                  Devise
                </p>
                <div className="grid gap-2">
                  {[
                    { code: "EUR", label: "Euro €", active: state.user.currency === "EUR" },
                    { code: "USD", label: "Dollar $", active: state.user.currency === "USD" },
                    { code: "GBP", label: "Livre £", active: state.user.currency === "GBP" }
                  ].map((currency) => (
                    <button
                      key={currency.code}
                      type="button"
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                        currency.active
                          ? "border-[var(--brand-primary)] bg-[rgba(53,89,230,0.08)] font-semibold text-[var(--brand-primary)]"
                          : "border-[var(--border)] bg-white/60 text-[var(--foreground-muted)] hover:bg-white"
                      }`}
                    >
                      {currency.label}
                      {currency.active && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Plan et compte ── */}
        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[rgba(46,197,161,0.16)] p-2.5 text-[var(--brand-mint-strong)]">
                <MoonStar className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">Plan et compte</h2>
            </div>

            <div className="rounded-[22px] bg-[linear-gradient(135deg,rgba(109,94,244,0.12),rgba(0,169,255,0.06),rgba(255,255,255,0.96))] p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">Plan actuel</p>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${plan.bg} ${plan.color}`}>
                  {plan.label}
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    {feature}
                  </div>
                ))}
              </div>
              {state.user.plan !== "family-pro" && (
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-[linear-gradient(135deg,#3559e6,#00a9ff,#2ec5a1)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(53,89,230,0.28)] transition hover:-translate-y-0.5"
                >
                  Passer au plan supérieur
                </button>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
                Mon compte
              </p>
              <div className="rounded-2xl bg-[var(--card-muted)] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D5EF4,#00a9ff)] font-bold text-white">
                    {state.user.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{state.user.displayName}</p>
                    <p className="text-xs text-[var(--foreground-subtle)]">{state.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[var(--foreground-subtle)]" />
                <span className="text-sm text-[var(--foreground-muted)]">Mode : </span>
                <Badge variant="outline">Clair (défaut)</Badge>
              </div>
              <p className="text-xs leading-5 text-[var(--foreground-subtle)]">
                Le mode sombre est préparé pour une prochaine mise à jour.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
