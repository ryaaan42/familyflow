"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { BirthListItem } from "@familyflow/shared";
import { Baby, CheckCircle2, Gift, Plus, Share2, ShoppingBag, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const statusLabel = {
  wanted: "A offrir",
  reserved: "Reserve",
  received: "Recu"
} as const;

const categoryLabels: Record<BirthListItem["category"], string> = {
  mobilier: "Mobilier",
  repas: "Repas",
  sorties: "Sorties",
  hygiene: "Hygiene",
  vetements: "Vetements",
  eveil: "Eveil",
  soin: "Soin"
};

const priorityLabels: Record<BirthListItem["priority"], string> = {
  essentiel: "Essentiel",
  utile: "Utile",
  confort: "Confort"
};

const defaultForm = {
  title: "",
  category: "mobilier" as BirthListItem["category"],
  priority: "utile" as BirthListItem["priority"],
  estimatedPrice: "",
  quantity: "1",
  storeUrl: "",
  description: ""
};

type ProductPreview = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  price?: string;
  url: string;
};

export function BirthListView() {
  const state = useFamilyFlowStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [productPreview, setProductPreview] = useState<ProductPreview | null>(null);

  // Load items from DB on mount
  useEffect(() => {
    fetch("/api/birth-list/items")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          // Map DB fields to store format
          const mapped = data.items.map((item: Record<string, unknown>) => ({
            id: item.id,
            householdId: item.household_id,
            title: item.title,
            category: item.category,
            priority: item.priority,
            status: item.status,
            quantity: item.quantity,
            reservedQuantity: item.reserved_quantity,
            estimatedPrice: item.estimated_price ?? undefined,
            storeUrl: item.store_url ?? undefined,
            description: item.description ?? undefined,
            notes: item.notes ?? undefined
          }));
          useFamilyFlowStore.setState({ birthListItems: mapped });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const url = form.storeUrl.trim();
    if (!url) {
      setProductPreview(null);
      setPreviewError(null);
      return;
    }

    let canceled = false;
    const timeout = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const response = await fetch(`/api/url-preview?url=${encodeURIComponent(url)}`);
        const payload = await response.json();

        if (canceled) return;

        if (!response.ok || !payload.preview) {
          setProductPreview(null);
          setPreviewError(payload.error ?? "Aperçu indisponible pour ce lien.");
          return;
        }

        const preview = payload.preview as ProductPreview;
        setProductPreview(preview);

        if (!form.title.trim() && preview.title) {
          setForm((current) => ({ ...current, title: preview.title ?? current.title }));
        }

        if (!form.estimatedPrice && preview.price) {
          const normalizedPrice = preview.price.replace(/[^\d.,]/g, "").replace(",", ".");
          if (normalizedPrice) {
            setForm((current) => ({ ...current, estimatedPrice: current.estimatedPrice || normalizedPrice }));
          }
        }
      } catch {
        if (!canceled) {
          setProductPreview(null);
          setPreviewError("Aperçu indisponible pour ce lien.");
        }
      } finally {
        if (!canceled) setPreviewLoading(false);
      }
    }, 550);

    return () => {
      canceled = true;
      clearTimeout(timeout);
    };
  }, [form.storeUrl, form.title, form.estimatedPrice]);

  const stats = useMemo(() => {
    const total = state.birthListItems.length;
    const reserved = state.birthListItems.filter((item) => item.status === "reserved").length;
    const received = state.birthListItems.filter((item) => item.status === "received").length;
    const estimatedBudget = state.birthListItems.reduce(
      (sum, item) => sum + (item.estimatedPrice ?? 0),
      0
    );

    return { total, reserved, received, estimatedBudget };
  }, [state.birthListItems]);

  const sharePath = `/birth-list/${state.profile.household.birthListShareSlug ?? ""}`;
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${sharePath}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/birth-list/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category,
          priority: form.priority,
          estimatedPrice: form.estimatedPrice || undefined,
          quantity: form.quantity,
          storeUrl: form.storeUrl.trim() || undefined,
          description: form.description.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      const saved = data.item;
      const newItem: BirthListItem = {
        id: saved.id,
        householdId: saved.household_id,
        title: saved.title,
        category: saved.category,
        priority: saved.priority,
        status: saved.status,
        quantity: saved.quantity,
        reservedQuantity: saved.reserved_quantity,
        estimatedPrice: saved.estimated_price ?? undefined,
        storeUrl: saved.store_url ?? undefined,
        description: saved.description ?? undefined
      };

      state.addBirthListItem(newItem);
      setForm(defaultForm);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden hero-coral text-white hero-glow-coral premium-shell">
        <div className="grid gap-8 p-7 md:grid-cols-[1.08fr_0.92fr] md:p-8">
          <div className="space-y-4">
            <Badge variant="white">Liste de naissance</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              Une liste elegante, partageable et raccord avec le reste du foyer.
            </h2>
            <p className="max-w-3xl text-[15px] leading-7 text-white/78">
              Quand une grossesse est declaree, Planille ouvre un espace dedie pour suivre les essentiels,
              les reservations et la page partage publique.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={sharePath}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Ouvrir la page partage
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/app/assistant">
                  <Baby className="mr-2 h-4 w-4" />
                  Demander a l'IA quoi prioriser
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Articles</p>
              <p className="mt-3 text-3xl font-semibold">{stats.total}</p>
              <p className="mt-2 text-sm text-white/72">actuellement sur la liste</p>
            </div>
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Reserves / recus</p>
              <p className="mt-3 text-3xl font-semibold">{stats.reserved + stats.received}</p>
              <p className="mt-2 text-sm text-white/72">deja couverts par les proches</p>
            </div>
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Budget estime</p>
              <p className="mt-3 text-3xl font-semibold">{stats.estimatedBudget} EUR</p>
              <p className="mt-2 text-sm text-white/72">en valeur theorique totale</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Lien partageable</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Page publique dediee a envoyer aux proches.
                </p>
              </div>
            </div>
            <Badge variant="outline">{state.profile.household.birthListShareSlug}</Badge>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card-muted)] px-4 py-3 text-sm text-[var(--foreground)]">
            {shareUrl}
          </div>
        </div>
      </Card>

      {/* Add item section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Articles de la liste</h3>
        <Button
          variant={showForm ? "secondary" : "default"}
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Annuler
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un article
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <h4 className="font-semibold text-[var(--foreground)]">Nouvel article</h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bl-title">Nom de l'article *</Label>
                <Input
                  id="bl-title"
                  placeholder="Ex: Poussette, Lit bebe..."
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bl-price">Prix estimé (EUR)</Label>
                <Input
                  id="bl-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 299"
                  value={form.estimatedPrice}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedPrice: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bl-category">Categorie</Label>
                <select
                  id="bl-category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as BirthListItem["category"] }))}
                  className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  {Object.entries(categoryLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bl-priority">Priorite</Label>
                <select
                  id="bl-priority"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as BirthListItem["priority"] }))}
                  className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                >
                  {Object.entries(priorityLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bl-quantity">Quantite</Label>
                <Input
                  id="bl-quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bl-url">Lien boutique</Label>
                <Input
                  id="bl-url"
                  type="url"
                  placeholder="https://..."
                  value={form.storeUrl}
                  onChange={(e) => setForm((f) => ({ ...f, storeUrl: e.target.value }))}
                />
              </div>
            </div>

            {previewLoading ? (
              <p className="text-xs text-[var(--foreground-muted)]">Récupération de la prévisualisation du produit…</p>
            ) : null}

            {productPreview ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="flex gap-3">
                  {productPreview.image ? (
                    <img
                      src={productPreview.image}
                      alt={productPreview.title ?? "Aperçu du produit"}
                      className="h-20 w-20 rounded-xl border border-[var(--border)] object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-[10px] text-[var(--foreground-muted)]">
                      Pas d'image
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <p className="line-clamp-2 text-sm font-semibold">{productPreview.title ?? "Produit détecté"}</p>
                    {productPreview.description ? (
                      <p className="line-clamp-2 text-xs text-[var(--foreground-muted)]">{productPreview.description}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-[var(--card-muted)] px-2 py-0.5 text-[var(--foreground-muted)]">
                        {productPreview.siteName ?? new URL(productPreview.url).hostname}
                      </span>
                      {productPreview.price ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                          ~ {productPreview.price}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {previewError ? (
              <p className="text-xs text-amber-700">{previewError}</p>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="bl-desc">Description / notes</Label>
              <Textarea
                id="bl-desc"
                placeholder="Precisions, couleur, marque preferee..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            {submitError && (
              <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{submitError}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setForm(defaultForm); setSubmitError(null); }}>
                Annuler
              </Button>
              <Button type="submit" disabled={!form.title.trim() || submitting}>
                <Plus className="mr-2 h-4 w-4" />
                {submitting ? "Ajout..." : "Ajouter a la liste"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        {state.birthListItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                  {item.status === "received" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <ShoppingBag className="h-5 w-5" />
                  )}
                </div>
                <Badge
                  variant={
                    item.status === "received"
                      ? "mint"
                      : item.priority === "essentiel"
                        ? "coral"
                        : item.priority === "utile"
                          ? "default"
                          : "outline"
                  }
                >
                  {statusLabel[item.status]}
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {item.description ?? item.notes ?? "A completer sur la liste partagee."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{categoryLabels[item.category] ?? item.category}</Badge>
                <Badge variant="yellow">{item.priority}</Badge>
                {item.estimatedPrice ? <Badge variant="mint">{item.estimatedPrice} EUR</Badge> : null}
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
