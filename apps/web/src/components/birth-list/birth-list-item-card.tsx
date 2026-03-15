"use client";

import { useState } from "react";
import type { BirthListItem } from "@familyflow/shared";
import { CheckCircle2, Gift, Loader2, PackageCheck, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props { item: BirthListItem; slug: string; householdName: string; }
type FormState = "idle" | "open" | "loading" | "success" | "error";

type PublicAction = "intent" | "reserved" | "purchased";

export function BirthListItemCard({ item, slug, householdName }: Props) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [buyerName, setBuyerName] = useState("");
  const [buyerMessage, setBuyerMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [action, setAction] = useState<PublicAction>("reserved");
  const [localItem, setLocalItem] = useState(item);

  const isReserved = localItem.status === "reserved" || localItem.status === "received";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!buyerName.trim()) return;

    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/birth-list/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          itemId: localItem.id,
          itemTitle: localItem.title,
          buyerName: buyerName.trim(),
          buyerMessage: buyerMessage.trim() || undefined,
          householdName,
          action
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue");

      if (data.item) {
        setLocalItem((prev) => ({ ...prev, status: data.item.status, reservedQuantity: data.item.reservedQuantity }));
      }
      setFormState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue.");
      setFormState("error");
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
            {localItem.status === "received" ? <PackageCheck className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
          </div>
          <Badge variant={localItem.status === "received" ? "mint" : localItem.status === "reserved" ? "default" : localItem.priority === "essentiel" ? "coral" : "outline"}>
            {localItem.status === "received" ? "Reçu" : localItem.status === "reserved" ? "Réservé" : localItem.priority}
          </Badge>
        </div>

        {localItem.imageUrl ? <img src={localItem.imageUrl} alt={localItem.title} className="h-44 w-full rounded-2xl border border-[var(--border)] object-cover" /> : null}

        <div>
          <h2 className="text-lg font-semibold">{localItem.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{localItem.description ?? localItem.notes ?? "Article ajouté sur la liste partagée."}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{localItem.category}</Badge>
          {localItem.estimatedPrice ? <Badge variant="mint">{localItem.estimatedPrice} EUR</Badge> : null}
        </div>

        {isReserved ? (
          <div className="flex items-center gap-2 rounded-[16px] bg-[rgba(52,199,89,0.10)] px-4 py-3"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /><p className="text-sm font-medium text-emerald-700">Cet article est déjà réservé/acheté.</p></div>
        ) : formState === "success" ? (
          <div className="flex items-center gap-2 rounded-[16px] bg-[rgba(109,94,244,0.10)] px-4 py-3"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" /><p className="text-sm font-medium text-[var(--brand-primary)]">Merci ! La famille {householdName} a été notifiée.</p></div>
        ) : formState === "open" || formState === "loading" || formState === "error" ? (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-[18px] border border-[var(--border)] bg-[var(--card-muted)] p-4">
            <div className="space-y-1.5">
              <Label htmlFor={`buyer-name-${localItem.id}`}>Votre prénom *</Label>
              <Input id={`buyer-name-${localItem.id}`} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required disabled={formState === "loading"} />
            </div>
            <div className="space-y-1.5">
              <Label>Action</Label>
              <select className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm" value={action} onChange={(e) => setAction(e.target.value as PublicAction)}>
                <option value="intent">Je suis intéressé(e)</option>
                <option value="reserved">Je réserve</option>
                <option value="purchased">Je l'ai acheté</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`buyer-msg-${localItem.id}`}>Message (optionnel)</Label>
              <Textarea id={`buyer-msg-${localItem.id}`} value={buyerMessage} onChange={(e) => setBuyerMessage(e.target.value)} rows={2} disabled={formState === "loading"} />
            </div>
            {formState === "error" && <p className="text-xs text-red-500">{errorMsg}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setFormState("idle")} disabled={formState === "loading"}>Annuler</Button>
              <Button type="submit" size="sm" disabled={!buyerName.trim() || formState === "loading"}>{formState === "loading" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</> : "Confirmer"}</Button>
            </div>
          </form>
        ) : (
          <Button variant="secondary" size="sm" className="w-full" onClick={() => setFormState("open")}><ShoppingCart className="mr-2 h-4 w-4" />Participer</Button>
        )}
      </div>
    </Card>
  );
}
