import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FinalCta() {
  return (
    <section className="py-10 md:py-16">
      <Card className="overflow-hidden bg-[linear-gradient(135deg,#6D5EF4,#4A8EFF_50%,#56C7A1)] text-white">
        <div className="space-y-6 p-8 md:p-12">
          <Badge className="w-fit bg-white/20 text-white">Code name: FamilyFlow</Badge>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                Une base moderne, scalable et prete a etre mise en ligne.
              </h2>
              <p className="text-white/82">
                Web sur Vercel, mobile via Expo/EAS, backend sur Supabase. La V1 pose une vraie
                fondation produit.
              </p>
            </div>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/app">Ouvrir l'application</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}

