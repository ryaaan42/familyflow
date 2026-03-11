import { ArrowRightLeft, PiggyBank, Printer, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const modules = [
  {
    icon: UsersRound,
    title: "Foyer vivant",
    description: "Membres, animaux, roles, disponibilites, routines et garde alternee preparee."
  },
  {
    icon: ArrowRightLeft,
    title: "Repartition equitable",
    description: "Assignation, reequilibrage automatique, historique et score d'equite."
  },
  {
    icon: PiggyBank,
    title: "Budget & projections",
    description: "Vue mensuelle, depenses evitables et simulateurs 3 / 6 / 12 mois."
  },
  {
    icon: Printer,
    title: "PDF premium",
    description: "Planning semaine, mois, check-lists enfants et budget imprimable."
  }
];

export function ModulesSection() {
  return (
    <section id="modules" className="space-y-8 py-10 md:py-16">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-4">
          <Badge variant="yellow">Modules V1</Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            L’organisation du foyer et la maitrise du budget dans une seule experience.
          </h2>
        </div>
        <p className="max-w-md text-[15px] leading-7 text-[var(--foreground-muted)]">
          La V1 couvre les besoins quotidiens, tout en laissant de la place pour un freemium
          propre, des suggestions IA plus fines et des rappels premium.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module, index) => {
          const Icon = module.icon;

          return (
            <Card key={module.title} className={index === 1 ? "bg-[rgba(248,245,255,0.94)]" : ""}>
              <div className="space-y-5 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(109,94,244,0.1)] text-[var(--brand-primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{module.title}</h3>
                  <p className="text-sm leading-7 text-[var(--foreground-muted)]">{module.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

