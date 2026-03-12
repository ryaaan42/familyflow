import {
  ArrowRight,
  CalendarRange,
  Coins,
  FileSpreadsheet,
  Sparkles
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const features = [
  {
    category: "Tâches",
    categoryVariant: "default" as const,
    icon: CalendarRange,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    stat: "50+ tâches",
    statLabel: "pré-configurées",
    title: "Moteur de suggestions par âge, rôle et logement",
    description:
      "Chaque foyer démarre avec une base de tâches pertinente, modulable, équitable et évolutive. L'IA affine les attributions selon le profil de chaque membre.",
    gradient: "from-violet-50/80 to-white",
    border: "border-violet-100"
  },
  {
    category: "Budget",
    categoryVariant: "coral" as const,
    icon: Coins,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    stat: "Vue mensuelle",
    statLabel: "claire et complète",
    title: "Vision claire pour suivre revenus et dépenses",
    description:
      "Revenus, charges fixes, dépenses variables et objectifs d'épargne restent lisibles en un coup d'œil. Identifiez les postes à optimiser en temps réel.",
    gradient: "from-blue-50/80 to-white",
    border: "border-blue-100"
  },
  {
    category: "Économies",
    categoryVariant: "mint" as const,
    icon: Sparkles,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    stat: "3/6/12 mois",
    statLabel: "de projection",
    title: "Projection concrète des habitudes qui coûtent cher",
    description:
      "Livraisons repas, sorties, courses mal planifiées ou linge mal géré se traduisent en euros et en actions. Chaque scenario est actionnable immédiatement.",
    gradient: "from-emerald-50/80 to-white",
    border: "border-emerald-100"
  },
  {
    category: "PDF",
    categoryVariant: "yellow" as const,
    icon: FileSpreadsheet,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    stat: "4 thèmes",
    statLabel: "d'impression",
    title: "Exports pensés pour le frigo, le classeur ou le partage",
    description:
      "Thèmes Minimal, Premium, Kawaii et Noir & blanc avec format A4 imprimable. Planning semaine, budget mensuel et check-lists enfants en un clic.",
    gradient: "from-amber-50/80 to-white",
    border: "border-amber-100"
  }
];

export function ValueGrid() {
  return (
    <section id="fonctionnalites" className="space-y-10 py-10 md:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge>Une V1 utile, pas un simple concept</Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Une base solide pour les familles qui veulent{" "}
            <span className="text-gradient">reprendre la main</span>.
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-7 text-[var(--foreground-muted)]">
          Chaque module est pensé pour apporter une valeur immédiate et tangible au quotidien.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className={`group overflow-hidden border ${feature.border} bg-gradient-to-br ${feature.gradient} hover-lift`}
            >
              <div className="space-y-5 p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl p-3 ${feature.iconBg}`}>
                      <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <Badge variant={feature.categoryVariant}>{feature.category}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--foreground)]">{feature.stat}</p>
                    <p className="text-xs text-[var(--foreground-subtle)]">{feature.statLabel}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="max-w-xl text-[15px] leading-7 text-[var(--foreground-muted)]">
                    {feature.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground-muted)] transition group-hover:text-[var(--brand-primary)]">
                  En savoir plus <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
