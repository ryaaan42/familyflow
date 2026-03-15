import Link from "next/link";
import {
  ArrowRight,
  ArrowRightLeft,
  Baby,
  BrainCircuit,
  FileSpreadsheet,
  PiggyBank,
  Trophy,
  Sparkles,
  UsersRound
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const modules = [
  {
    icon: UsersRound,
    emoji: "🏠",
    title: "Foyer vivant",
    description:
      "Membres, animaux, rôles, disponibilités, routines et garde alternée préparée. Chaque profil influence les suggestions.",
    color: "text-violet-600",
    bg: "bg-violet-100",
    gradient: "from-violet-50 to-purple-50",
    border: "border-violet-100",
    badge: "Essentiel",
    badgeVariant: "default" as const,
    href: "/app/household"
  },
  {
    icon: ArrowRightLeft,
    emoji: "⚖️",
    title: "Répartition équitable",
    description:
      "Assignation intelligente, rééquilibrage automatique, historique et score d'équité affiché en temps réel.",
    color: "text-pink-600",
    bg: "bg-pink-100",
    gradient: "from-pink-50 to-rose-50",
    border: "border-pink-100",
    badge: "IA",
    badgeVariant: "coral" as const,
    href: "/app/tasks"
  },
  {
    icon: PiggyBank,
    emoji: "💰",
    title: "Budget & projections",
    description:
      "Vue mensuelle claire, dépenses évitables identifiées et simulateurs sur 3, 6 et 12 mois.",
    color: "text-blue-600",
    bg: "bg-blue-100",
    gradient: "from-blue-50 to-sky-50",
    border: "border-blue-100",
    badge: "Clé",
    badgeVariant: "default" as const,
    href: "/app/budget"
  },
  {
    icon: Sparkles,
    emoji: "✨",
    title: "Économies intelligentes",
    description:
      "Scénarios personnalisés basés sur vos habitudes réelles. Des actions concrètes, pas des théories.",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    gradient: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
    badge: "Populaire",
    badgeVariant: "mint" as const,
    href: "/app/savings"
  },
  {
    icon: BrainCircuit,
    emoji: "🤖",
    title: "Assistant IA",
    description:
      "Génère un planning personnalisé en quelques secondes selon votre contexte de vie unique.",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    gradient: "from-indigo-50 to-violet-50",
    border: "border-indigo-100",
    badge: "IA",
    badgeVariant: "default" as const,
    href: "/app/assistant"
  },
  {
    icon: Trophy,
    emoji: "🏆",
    title: "Défis famille gamifiés",
    description:
      "Objectifs collectifs avec points, badges enfants/ados, et récompenses maison configurables.",
    color: "text-orange-600",
    bg: "bg-orange-100",
    gradient: "from-orange-50 to-amber-50",
    border: "border-orange-100",
    badge: "Fun",
    badgeVariant: "yellow" as const,
    href: "/app/goals"
  },
  {
    icon: FileSpreadsheet,
    emoji: "🖨️",
    title: "PDF premium",
    description:
      "Planning semaine, budget mensuel et check-lists imprimables. 4 thèmes pour tous les goûts.",
    color: "text-amber-600",
    bg: "bg-amber-100",
    gradient: "from-amber-50 to-orange-50",
    border: "border-amber-100",
    badge: "Premium",
    badgeVariant: "yellow" as const,
    href: "/app/exports"
  },
  {
    icon: Baby,
    emoji: "👶",
    title: "Liste de naissance",
    description:
      "Préparez l'arrivée de bébé avec une liste partageable publiquement. Essentiels, utiles, confort.",
    color: "text-rose-600",
    bg: "bg-rose-100",
    gradient: "from-rose-50 to-pink-50",
    border: "border-rose-100",
    badge: "Nouveau",
    badgeVariant: "coral" as const,
    href: "/app/birth-list"
  },
  {
    icon: UsersRound,
    emoji: "👨‍👩‍👧‍👦",
    title: "Multi-profils",
    description:
      "Parents, ados, enfants, adultes — chaque rôle a ses propres tâches adaptées à son âge et ses capacités.",
    color: "text-teal-600",
    bg: "bg-teal-100",
    gradient: "from-teal-50 to-emerald-50",
    border: "border-teal-100",
    badge: "Inclusif",
    badgeVariant: "mint" as const,
    href: "/app/household"
  }
];

export function ModulesSection() {
  return (
    <section id="modules" className="space-y-10 py-10 md:py-16">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-4">
          <Badge variant="yellow">9 modules actifs</Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Organisation du foyer et maîtrise du budget,{" "}
            <span className="text-gradient">tout en un</span>.
          </h2>
        </div>
        <p className="max-w-md text-[15px] leading-7 text-[var(--foreground-muted)]">
          La V1 couvre les besoins quotidiens, avec un freemium propre, des suggestions IA
          et des exports premium prêts à activer.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.title} href={module.href}>
              <Card
                className={`group h-full cursor-pointer border ${module.border} bg-gradient-to-br ${module.gradient} transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)]`}
              >
                <div className="flex h-full flex-col space-y-4 p-6">
                  {/* Icon + badge */}
                  <div className="flex items-center justify-between">
                    <div className={`rounded-2xl p-3 ${module.bg}`}>
                      <Icon className={`h-5 w-5 ${module.color}`} />
                    </div>
                    <Badge variant={module.badgeVariant}>{module.badge}</Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                      {module.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${module.color} opacity-0 transition-all group-hover:opacity-100`}>
                    Ouvrir <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
