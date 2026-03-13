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

interface Props {
  item: BirthListItem;
  slug: string;
  householdName: string;
}

type FormState = "idle" | "open" | "loading" | "success" | "error";

export function BirthListItemCard({ item, slug, householdName }: Props) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [buyerName, setBuyerName] = useState("");
  const [buyerMessage, setBuyerMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isReserved = item.status === "reserved" || item.status === "received";

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
          itemId: item.id,
          itemTitle: item.title,
          buyerName: buyerName.trim(),
          buyerMessage: buyerMessage.trim() || undefined,
          householdName
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur inconnue");
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
            {item.status === "received" ? (
              <PackageCheck className="h-5 w-5" />
            ) : (
              <Gift className="h-5 w-5" />
            )}
          </div>
          <Badge
            variant={
              item.status === "received"
                ? "mint"
                : item.status === "reserved"
                  ? "default"
                  : item.priority === "essentiel"
                    ? "coral"
                    : "outline"
            }
          >
            {item.status === "received" ? "Recu" : item.status === "reserved" ? "Reserve" : item.priority}
          </Badge>
        </div>

        <div>
          <h2 className="text-lg font-semibold">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            {item.description ?? item.notes ?? "Article ajoute sur la liste partagee."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{item.category}</Badge>
          {item.estimatedPrice ? <Badge variant="mint">{item.estimatedPrice} EUR</Badge> : null}
          {item.storeUrl && (
            <a
              href={item.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[var(--brand-primary)] underline underline-offset-2"
            >
              Voir en boutique
            </a>
          )}
        </div>

        {/* Reservation section */}
        {isReserved ? (
          <div className="flex items-center gap-2 rounded-[16px] bg-[rgba(52,199,89,0.10)] px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700">Cet article est deja reserve ou recu.</p>
          </div>
        ) : formState === "success" ? (
          <div className="flex items-center gap-2 rounded-[16px] bg-[rgba(109,94,244,0.10)] px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" />
            <p className="text-sm font-medium text-[var(--brand-primary)]">
              Merci ! La famille {householdName} a ete notifiee par email.
            </p>
          </div>
        ) : formState === "open" || formState === "loading" || formState === "error" ? (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-[18px] border border-[var(--border)] bg-[var(--card-muted)] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Je vais offrir cet article</p>

            <div className="space-y-1.5">
              <Label htmlFor={`buyer-name-${item.id}`}>Votre prenom *</Label>
              <Input
                id={`buyer-name-${item.id}`}
                placeholder="Ex: Sophie"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                disabled={formState === "loading"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`buyer-msg-${item.id}`}>Message pour la famille (optionnel)</Label>
              <Textarea
                id={`buyer-msg-${item.id}`}
                placeholder="Avec tout notre amour..."
                value={buyerMessage}
                onChange={(e) => setBuyerMessage(e.target.value)}
                rows={2}
                disabled={formState === "loading"}
              />
            </div>

            {formState === "error" && (
              <p className="text-xs text-red-500">{errorMsg}</p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => { setFormState("idle"); setBuyerName(""); setBuyerMessage(""); }}
                disabled={formState === "loading"}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!buyerName.trim() || formState === "loading"}
              >
                {formState === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => setFormState("open")}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Je l'achete
          </Button>
        )}
      </div>
    </Card>
  );
}
