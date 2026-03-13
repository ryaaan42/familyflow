import Link from "next/link";
import { notFound } from "next/navigation";
import { createDemoDataset } from "@familyflow/shared";
import { Heart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BirthListItemCard } from "@/components/birth-list/birth-list-item-card";

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

  const householdName = dataset.profile.household.name;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(36,25,64,0.96),rgba(135,76,176,0.88),rgba(255,126,107,0.78),rgba(255,191,90,0.72))] text-white hero-glow">
        <div className="grid gap-6 p-7 md:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Liste de naissance partagee</Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              La famille {householdName} prepare l'arrivee de son bebe.
            </h1>
            <p className="max-w-3xl text-[15px] leading-7 text-white/78">
              Merci de participer. Cliquez sur un article pour indiquer que vous l'achetez — la famille sera notifiee par email.
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
          <BirthListItemCard
            key={item.id}
            item={item}
            slug={slug}
            householdName={householdName}
          />
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-[var(--brand-coral)]" />
            <p className="text-sm text-[var(--foreground-muted)]">
              En cliquant sur "Je l'achete", une notification et un email sont envoyes a la famille.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-[var(--brand-primary)]">
            Retour a Planille
          </Link>
        </div>
      </Card>
    </main>
  );
}
