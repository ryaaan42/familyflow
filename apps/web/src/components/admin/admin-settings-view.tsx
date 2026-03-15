"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Globe, Loader2, MessageSquare, Settings } from "lucide-react";
import type { SiteContent } from "@familyflow/shared";

import { updateSiteContent, toggleFeatureFlag, exportAllDataGdpr } from "@/lib/supabase/admin-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 ${
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

const contentLabels: Record<string, string> = {
  welcome_message: "Message de bienvenue (app)",
  app_tagline: "Tagline application",
  footer_legal: "Texte légal footer",
  maintenance_banner: "Bannière maintenance"
};

interface Props {
  generalContent: SiteContent[];
  maintenanceEnabled: boolean;
}

export function AdminSettingsView({ generalContent, maintenanceEnabled: initialMaintenance }: Props) {
  const [isPending, startTransition] = useTransition();
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [content, setContent] = useState<SiteContent[]>(generalContent);
  const [gdprLoading, setGdprLoading] = useState(false);

  function handleMaintenanceToggle(enabled: boolean) {
    startTransition(async () => {
      await toggleFeatureFlag("maintenance", enabled);
      setMaintenance(enabled);
    });
  }

  function startEdit(item: SiteContent) {
    setEditingKey(item.key);
    setEditValue(item.value);
  }

  function handleSave(key: string) {
    startTransition(async () => {
      await updateSiteContent(key, editValue);
      setContent((prev) => prev.map((c) => (c.key === key ? { ...c, value: editValue } : c)));
      setEditingKey(null);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    });
  }

  async function handleGdprExport() {
    setGdprLoading(true);
    try {
      const json = await exportAllDataGdpr();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planille-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGdprLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Textes éditables (site_content - section general) */}
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-pink-100 p-2.5 text-pink-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Textes et messages</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Contenu éditable en production</p>
            </div>
          </div>
          <div className="space-y-3">
            {content.map((item) => (
              <div key={item.key} className="rounded-2xl bg-[var(--card-muted)] px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-[var(--foreground-subtle)]">
                    {contentLabels[item.key] ?? item.label}
                  </p>
                  {savedKey === item.key ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sauvegardé
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="text-xs text-[var(--brand-primary)] hover:underline"
                    >
                      Modifier
                    </button>
                  )}
                </div>
                {editingKey === item.key ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleSave(item.key)}
                      >
                        {isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                        Sauvegarder
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingKey(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-medium">
                    {item.value || <span className="text-[var(--foreground-subtle)] italic">—</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Paramètres globaux — informatif */}
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Paramètres globaux</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Branding, langue, région</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Nom de l'application", value: "PLANILLE" },
              { label: "URL publique", value: "planille.app" },
              { label: "Langue par défaut", value: "Français (fr)" },
              { label: "Devise par défaut", value: "EUR €" },
              { label: "Fuseau horaire", value: "Europe/Paris" }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-[var(--card-muted)] px-4 py-3">
                <span className="text-sm text-[var(--foreground-muted)]">{item.label}</span>
                <span className="text-sm font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Actions système */}
      <Card className="lg:col-span-2">
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-2.5 text-red-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Actions système</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Opérations critiques</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Maintenance toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-4">
              <div>
                <p className="font-semibold">Mode maintenance</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Affiche une bannière à tous les utilisateurs
                </p>
              </div>
              <Toggle enabled={maintenance} onChange={handleMaintenanceToggle} disabled={isPending} />
            </div>

            {/* GDPR export */}
            <button
              type="button"
              onClick={handleGdprExport}
              disabled={gdprLoading}
              className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-left hover:bg-[var(--card-muted)] transition disabled:opacity-60"
            >
              {gdprLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--brand-primary)] shrink-0" />
              ) : (
                <span className="text-xl">📦</span>
              )}
              <div>
                <p className="font-semibold">Export RGPD global</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Télécharger toutes les données utilisateurs (JSON)
                </p>
              </div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
