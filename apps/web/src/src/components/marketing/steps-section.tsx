import { ArrowRight, Home, Lightbulb, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const steps = [
  {
    index: "01",
    icon: Home,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    numberColor: "text-violet-600",
    numberBg: "bg-violet-50",
    title: "Créez votre foyer",
    description:
      "Renseignez votre logement, ajoutez vos membres (adultes, ados, enfants), vos animaux et vos habitudes. L'onboarding prend moins de 3 minutes.",
    highlight: "3 min pour démarrer",
    gradient: "from-violet-50 to-purple-50/50",
    border: "border-violet-100"
  },
  {
    index: "02",
    icon: Lightbulb,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    numberColor: "text-amber-600",
    numberBg: "bg-amber-50",
    title: "Recevez vos suggestions",
    description:
      "Le moteur IA génère des tâches adaptées à chaque profil et propose une répartition initiale équitable. Affinez en un clic selon vos préférences.",
    highlight: "50+ tâches pré-configurées",
    gradient: "from-amber-50 to-orange-50/50",
    border: "border-amber-100"
  },
  {
    index: "03",
    icon: TrendingUp,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    numberColor: "text-emerald-600",
    numberBg: "bg-emerald-50",
    title: "Pilotez budget & économies",
    description:
      "Les routines influencent directement les projections financières. Vous voyez en temps réel où agir pour économiser et comment alléger la charge mentale.",
    highlight: "Jusqu'à 340 €/mois",
    gradient: "from-emerald-50 to-teal-50/50",
    border: "border-emerald-100"
  }
];

export function StepsSection() {
  return (
    <section className="space-y-10 py-10 md:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge variant="coral">Parcours utilisateur</Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Démarrez en 3 étapes,{" "}
            <span className="text-gradient">voyez les résultats</span> dès la première semaine.
          </h2>
        </div>
      </div>

      <div className="relative grid gap-5 lg:grid-cols-3">
        {/* Connector line (desktop) */}
        <div className="absolute left-[calc(33%+1rem)] right-[calc(33%+1rem)] top-[3.5rem] hidden h-px bg-gradient-to-r from-violet-200 via-amber-200 to-emerald-200 lg:block" />

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.index}
              className={`relative border ${step.border} bg-gradient-to-br ${step.gradient} hover-lift`}
            >
              <div className="space-y-5 p-7">
                {/* Step number + icon */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg ${step.numberBg} ${step.numberColor}`}>
                    {step.index}
                  </div>
                  <div className={`rounded-2xl p-2.5 ${step.iconBg}`}>
                    <Icon className={`h-5 w-5 ${step.iconColor}`} />
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="ml-auto hidden h-4 w-4 text-[var(--foreground-subtle)] lg:block" />
                  )}
                  {index === steps.length - 1 && (
                    <Sparkles className="ml-auto hidden h-4 w-4 text-[var(--brand-mint-strong)] lg:block" />
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-[15px] leading-7 text-[var(--foreground-muted)]">
                    {step.description}
                  </p>
                </div>

                {/* Highlight pill */}
                <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${step.numberBg} ${step.numberColor}`}>
                  ✓ {step.highlight}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
