import Link from "next/link";
import { notFound } from "next/navigation";
import { createDemoDataset } from "@familyflow/shared";
import { Gift, Heart, PackageCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function SharedBirthListPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dataset = createDemoDataset();

  if (slug !== dataset.profile.household.birthListShareSlug) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(36,25,64,0.96),rgba(135,76,176,0.88),rgba(255,126,107,0.78),rgba(255,191,90,0.72))] text-white hero-glow">
        <div className="grid gap-6 p-7 md:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Liste de naissance partagee</Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              La famille {dataset.profile.household.name} prepare l'arrivee de son bebe.
            </h1>
            <p className="max-w-3xl text-[15px] leading-7 text-white/78">
              Merci de participer. Voici les besoins prioritaires et les articles deja reserves.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Articles</p>
              <p className="mt-3 text-3xl font-semibold">{dataset.birthListItems.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Reserves</p>
              <p className="mt-3 text-3xl font-semibold">
                {dataset.birthListItems.filter((item) => item.status === "reserved").length}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/18 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/64">Recus</p>
              <p className="mt-3 text-3xl font-semibold">
                {dataset.birthListItems.filter((item) => item.status === "received").length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 md:grid-cols-3">
        {dataset.birthListItems.map((item) => (
          <Card key={item.id}>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                  {item.status === "received" ? <PackageCheck className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
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
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-[var(--brand-coral)]" />
            <p className="text-sm text-[var(--foreground-muted)]">
              Page publique de demonstration. Le branchement base + reservations en temps reel pourra se connecter ensuite.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-[var(--brand-primary)]">
            Retour a FamilyFlow
          </Link>
        </div>
      </Card>
    </main>
  );
}
