"use client";

import { useMemo, useState, useTransition } from "react";
import type { EmailTemplate, NewsletterCampaign } from "@familyflow/shared";
import { Check, Loader2, MailCheck, Pencil, Send } from "lucide-react";

import { saveNewsletterCampaign, sendNewsletterCampaign, updateEmailTemplate } from "@/lib/supabase/admin-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  templates: EmailTemplate[];
  campaigns: NewsletterCampaign[];
};

export function AdminNewsletterView({ templates: initialTemplates, campaigns: initialCampaigns }: Props) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [templateKey, setTemplateKey] = useState(initialTemplates[0]?.key ?? "");
  const [subject, setSubject] = useState(initialTemplates[0]?.subject ?? "");
  const [previewText, setPreviewText] = useState(initialTemplates[0]?.previewText ?? "");
  const [htmlContent, setHtmlContent] = useState(initialTemplates[0]?.htmlContent ?? "");
  const [newsletter, setNewsletter] = useState({ title: "", subject: "", preheader: "", htmlContent: "" });
  const [pending, startTransition] = useTransition();
  const [savedTemplate, setSavedTemplate] = useState<string | null>(null);

  const selectedTemplate = useMemo(() => templates.find((t) => t.key === templateKey), [templates, templateKey]);

  function selectTemplate(key: string) {
    const template = templates.find((t) => t.key === key);
    if (!template) return;
    setTemplateKey(key);
    setSubject(template.subject);
    setPreviewText(template.previewText);
    setHtmlContent(template.htmlContent);
  }

  function saveTemplate() {
    startTransition(async () => {
      await updateEmailTemplate({ key: templateKey, subject, previewText, htmlContent });
      setTemplates((prev) => prev.map((t) => (t.key === templateKey ? { ...t, subject, previewText, htmlContent } : t)));
      setSavedTemplate(templateKey);
      setTimeout(() => setSavedTemplate(null), 1800);
    });
  }

  function createCampaign() {
    if (!newsletter.title || !newsletter.subject || !newsletter.htmlContent) return;
    startTransition(async () => {
      await saveNewsletterCampaign(newsletter);
      setCampaigns((prev) => [
        {
          id: `draft-${Date.now()}`,
          title: newsletter.title,
          subject: newsletter.subject,
          preheader: newsletter.preheader,
          htmlContent: newsletter.htmlContent,
          status: "draft",
          recipientCount: 0,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
      setNewsletter({ title: "", subject: "", preheader: "", htmlContent: "" });
    });
  }

  function sendCampaign(id: string) {
    startTransition(async () => {
      const result = await sendNewsletterCampaign(id);
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "sent",
                recipientCount: result.recipientCount,
                sentAt: new Date().toISOString()
              }
            : c
        )
      );
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Templates email</h2>
                <p className="text-sm text-[var(--foreground-muted)]">Inscription, confirmation, mot de passe…</p>
              </div>
              {savedTemplate ? <span className="text-xs font-semibold text-emerald-600">Sauvegardé</span> : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs font-semibold text-[var(--foreground-subtle)]">
                Template
                <select
                  value={templateKey}
                  onChange={(e) => selectTemplate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
                >
                  {templates.map((template) => (
                    <option key={template.key} value={template.key}>{template.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-[var(--foreground-subtle)]">
                Sujet
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm" />
              </label>
            </div>

            <label className="block text-xs font-semibold text-[var(--foreground-subtle)]">
              Préheader
              <input value={previewText} onChange={(e) => setPreviewText(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm" />
            </label>

            <label className="block text-xs font-semibold text-[var(--foreground-subtle)]">
              HTML (placeholders: {"{{display_name}}"}, {"{{action_url}}"}, {"{{dashboard_url}}"})
              <textarea value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} rows={13} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-xs" />
            </label>

            <Button disabled={pending || !selectedTemplate} onClick={saveTemplate}>
              {pending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Pencil className="mr-1 h-4 w-4" />} Enregistrer le template
            </Button>
          </div>
        </Card>

        <Card>
          <div className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">Nouvelle campagne</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Créez une newsletter depuis l&apos;admin.</p>
            </div>
            <input placeholder="Titre interne" value={newsletter.title} onChange={(e) => setNewsletter((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm" />
            <input placeholder="Sujet visible" value={newsletter.subject} onChange={(e) => setNewsletter((prev) => ({ ...prev, subject: e.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm" />
            <input placeholder="Préheader" value={newsletter.preheader} onChange={(e) => setNewsletter((prev) => ({ ...prev, preheader: e.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm" />
            <textarea placeholder="Contenu HTML" rows={8} value={newsletter.htmlContent} onChange={(e) => setNewsletter((prev) => ({ ...prev, htmlContent: e.target.value }))} className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm" />
            <Button disabled={pending} onClick={createCampaign}><MailCheck className="mr-1 h-4 w-4" />Enregistrer en brouillon</Button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="space-y-3 p-5">
          <h2 className="text-lg font-semibold">Campagnes</h2>
          {campaigns.length === 0 ? <p className="text-sm text-[var(--foreground-muted)]">Aucune campagne.</p> : null}
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{campaign.title}</p>
                <p className="truncate text-xs text-[var(--foreground-muted)]">{campaign.subject}</p>
                <p className="text-xs text-[var(--foreground-subtle)]">
                  {campaign.status === "sent" ? `Envoyé · ${campaign.recipientCount} destinataires` : "Brouillon"}
                </p>
              </div>
              {campaign.status === "sent" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><Check className="h-3.5 w-3.5" />Envoyé</span>
              ) : (
                <Button size="sm" disabled={pending || campaign.id.startsWith("draft-")} onClick={() => sendCampaign(campaign.id)}>
                  <Send className="mr-1 h-3.5 w-3.5" />Envoyer
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
