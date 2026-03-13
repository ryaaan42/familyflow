"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import type { SiteContent } from "@familyflow/shared";

import { updateSiteContent } from "@/lib/supabase/admin-actions";
import { Card } from "@/components/ui/card";

interface Props {
  content: SiteContent[];
}

const sectionLabels: Record<string, string> = {
  hero: "Section Hero",
  valeurs: "Grille de valeurs",
  etapes: "Section Étapes",
  temoignages: "Témoignages",
  faq: "FAQ",
  general: "Général & Footer"
};

export function AdminContentView({ content: initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);

  function startEdit(item: SiteContent) {
    setEditing(item.key);
    setDraft(item.value);
  }

  function cancelEdit() {
    setEditing(null);
    setDraft("");
  }

  function saveEdit(key: string) {
    startTransition(async () => {
      await updateSiteContent(key, draft);
      setContent((prev) => prev.map((c) => (c.key === key ? { ...c, value: draft } : c)));
      setEditing(null);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    });
  }

  // Group by section
  const sections = Array.from(new Set(content.map((c) => c.section)));

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const items = content.filter((c) => c.section === section);
        return (
          <Card key={section}>
            <div className="p-6 space-y-4">
              <h2 className="font-semibold text-base">{sectionLabels[section] ?? section}</h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const isEditing = editing === item.key;
                  const wasSaved = saved === item.key;
                  return (
                    <div key={item.key} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--foreground-subtle)] mb-1.5">
                            {item.label}
                          </p>
                          {isEditing ? (
                            <textarea
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              rows={Math.max(2, draft.split("\n").length)}
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)] resize-none"
                              autoFocus
                            />
                          ) : (
                            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                              {item.value || (
                                <span className="text-[var(--foreground-subtle)] italic">— vide —</span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => saveEdit(item.key)}
                                className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Enregistrer
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-xl p-1.5 text-[var(--foreground-subtle)] hover:bg-[var(--card-muted)] transition"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className={`rounded-xl p-1.5 transition ${
                                wasSaved
                                  ? "text-emerald-600"
                                  : "text-[var(--foreground-subtle)] hover:bg-[var(--card-muted)]"
                              }`}
                            >
                              {wasSaved ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
