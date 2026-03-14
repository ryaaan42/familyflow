"use client";

import { useState } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Globe,
  Languages,
  LoaderCircle,
  Mail,
  Settings,
  Smartphone,
  Star,
  Wallet
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        enabled
          ? "bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
          : "bg-gray-200"
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

const planDetails: Record<string, { label: string; variant: "default" | "violet" | "mint"; features: string[]; gradient: string }> = {
  free: {
    label: "Gratuit",
    variant: "dark",
    gradient: "from-gray-800 to-gray-900",
    features: ["1 foyer", "15 tâches max", "Export PDF basique"]
  },
  plus: {
    label: "Plus",
    variant: "blue",
    gradient: "from-blue-600 to-indigo-700",
    features: ["Foyer illimité", "PDF multi-thèmes", "Assistant IA", "Historique 6 mois"]
  },
  "family-pro": {
    label: "Family Pro",
    variant: "violet",
    gradient: "from-violet-600 to-purple-700",
    features: ["Tout Plus", "Alertes budget", "Export avancé", "Support prioritaire"]
  }
} as const;

export function SettingsView() {
  const state = useFamilyFlowStore();
  const plan = planDetails[state.user.plan] ?? planDetails.free;

  const [emailDigest,    setEmailDigest]    = useState(state.notificationSettings.emailDigest);
  const [budgetReminder, setBudgetReminder] = useState(state.notificationSettings.budgetReminder);
  const [taskReminders,  setTaskReminders]  = useState(true);
  const [weeklyReport,   setWeeklyReport]   = useState(true);
  const [pushMobile,     setPushMobile]     = useState(false);

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const saveNotifications = async () => {
    setSaving(true);
    setSaved(false);
    setSaveErr(null);
    try {
      await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailDigest, budgetReminder, taskReminders, weeklyReport, pushMobile })
      });
      useFamilyFlowStore.setState((s) => ({
        notificationSettings: { ...s.notificationSettings, emailDigest, budgetReminder }
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveErr("Impossible de sauvegarder. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const notifItems = [
    { label: "Résumé email hebdo",   description: "Résumé de la semaine tous les lundis",  icon: Mail,        value: emailDigest,    onChange: setEmailDigest },
    { label: "Rappel budget",        description: "Alerte si un poste dépasse le seuil",   icon: Wallet,      value: budgetReminder, onChange: setBudgetReminder },
    { label: "Rappels tâches",       description: "Notification avant échéance",            icon: Bell,        value: taskReminders,  onChange: setTaskReminders },
    { label: "Rapport hebdomadaire", description: "Bilan famille chaque dimanche soir",     icon: Star,        value: weeklyReport,   onChange: setWeeklyReport },
    { label: "Push mobile",          description: "Notifications sur l'app iOS / Android",  icon: Smartphone,  value: pushMobile,     onChange: setPushMobile },
  ];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="overflow-hidden premium-shell bg-[linear-gradient(135deg,#0f0e1a_0%,#1e1b4b_30%,#4f46e5_70%,#0ea5e9_100%)] text-white hero-glow">
        <div className="flex items-center gap-4 p-6 md:p-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/15 backdrop-blur-sm">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <Badge variant="white">Paramètres</Badge>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Votre compte & préférences
            </h1>
            <p className="mt-0.5 text-sm text-white/70">
              {state.user.displayName} · {state.user.email}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Notifications */}
        <Card>
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-[12px] bg-indigo-100 p-2.5 text-indigo-600">
                <BellRing className="h-4 w-4" />
              </div>
              <h2 className="font-semibold">Notifications</h2>
            </div>

            <div className="space-y-2">
              {notifItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[14px] bg-[#f8f7ff] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[#9ca3af]" />
                      <div>
                        <p className="text-sm font-medium text-[#1f2937]">{item.label}</p>
                        <p className="text-xs text-[#9ca3af]">{item.description}</p>
                      </div>
                    </div>
                    <Toggle enabled={item.value} onChange={item.onChange} />
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-1">
              {saveErr && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{saveErr}</p>
              )}
              <Button
                className="w-full"
                onClick={() => void saveNotifications()}
                disabled={saving}
              >
                {saving ? (
                  <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Sauvegarde…</>
                ) : saved ? (
                  <><CheckCircle2 className="mr-2 h-4 w-4" />Sauvegardé !</>
                ) : (
                  "Sauvegarder les notifications"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Language & currency */}
        <Card>
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-[12px] bg-orange-100 p-2.5 text-orange-600">
                <Languages className="h-4 w-4" />
              </div>
              <h2 className="font-semibold">Langue et devise</h2>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                Interface
              </p>
              <div className="space-y-1.5">
                {[
                  { code: "fr", label: "Français", flag: "🇫🇷", active: true },
                  { code: "en", label: "English",  flag: "🇬🇧", active: false },
                  { code: "es", label: "Español",  flag: "🇪🇸", active: false },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-sm transition ${
                      lang.active
                        ? "border-indigo-200 bg-indigo-50 font-semibold text-indigo-700"
                        : "border-[#f3f4f6] bg-white text-[#6b7280] hover:bg-gray-50"
                    }`}
                  >
                    <span>{lang.flag} {lang.label}</span>
                    {lang.active && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                Devise
              </p>
              <div className="space-y-1.5">
                {[
                  { code: "EUR", label: "Euro €",   active: state.user.currency === "EUR" },
                  { code: "USD", label: "Dollar $",  active: state.user.currency === "USD" },
                  { code: "GBP", label: "Livre £",   active: state.user.currency === "GBP" },
                ].map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-sm transition ${
                      currency.active
                        ? "border-indigo-200 bg-indigo-50 font-semibold text-indigo-700"
                        : "border-[#f3f4f6] bg-white text-[#6b7280] hover:bg-gray-50"
                    }`}
                  >
                    {currency.label}
                    {currency.active && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Plan & account */}
        <Card>
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-[12px] bg-violet-100 p-2.5 text-violet-600">
                <Globe className="h-4 w-4" />
              </div>
              <h2 className="font-semibold">Plan et compte</h2>
            </div>

            {/* Plan card */}
            <div className={`overflow-hidden rounded-[18px] bg-gradient-to-br ${plan.gradient} p-5 text-white`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">Plan actuel</p>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                  {plan.label}
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white/60" />
                    {feature}
                  </div>
                ))}
              </div>
              {state.user.plan !== "family-pro" && (
                <button
                  type="button"
                  className="mt-4 w-full rounded-[14px] bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  Passer au plan supérieur →
                </button>
              )}
            </div>

            {/* Account */}
            <div className="rounded-[16px] bg-[#f8f7ff] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
                  {state.user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1f2937]">{state.user.displayName}</p>
                  <p className="truncate text-xs text-[#9ca3af]">{state.user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-[14px] border border-[#f3f4f6] bg-white px-3.5 py-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <span className="text-sm text-[#6b7280]">Thème clair actif</span>
              <Badge variant="dark" className="ml-auto text-[10px]">Sombre bientôt</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
