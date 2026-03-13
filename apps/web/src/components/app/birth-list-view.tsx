"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

export function BirthListView() {
  const state = useFamilyFlowStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const newItem: BirthListItem = {
      id: crypto.randomUUID(),
      householdId: state.profile.household.id,
      title: form.title.trim(),
      category: form.category,
      priority: form.priority,
      status: "wanted",
      quantity: Math.max(1, parseInt(form.quantity) || 1),
      reservedQuantity: 0,
      estimatedPrice: form.estimatedPrice ? parseFloat(form.estimatedPrice) : undefined,
      storeUrl: form.storeUrl.trim() || undefined,
      description: form.description.trim() || undefined
    };

    state.addBirthListItem(newItem);
    setForm(defaultForm);
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(36,25,64,0.96),rgba(135,76,176,0.88),rgba(255,126,107,0.78),rgba(255,191,90,0.72))] text-white hero-glow">
        <div className="grid gap-8 p-7 md:grid-cols-[1.08fr_0.92fr] md:p-8">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Liste de naissance</Badge>
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

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setForm(defaultForm); }}>
                Annuler
              </Button>
              <Button type="submit" disabled={!form.title.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter a la liste
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
