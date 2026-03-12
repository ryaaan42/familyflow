"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Baby, CheckCircle2, Gift, Share2, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const statusLabel = {
  wanted: "A offrir",
  reserved: "Reserve",
  received: "Recu"
} as const;

export function BirthListView() {
  const state = useFamilyFlowStore();

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
              Quand une grossesse est declaree, FamilyFlow ouvre un espace dedie pour suivre les essentiels,
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
                <Badge variant="outline">{item.category}</Badge>
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
