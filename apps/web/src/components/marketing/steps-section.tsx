import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const steps = [
  {
    index: "01",
    title: "Creer le foyer",
    description: "Onboarding simple: logement, membres, animaux et habitudes de vie."
  },
  {
    index: "02",
    title: "Recevoir les suggestions",
    description: "Le moteur genere des taches adaptees et propose une repartition initiale."
  },
  {
    index: "03",
    title: "Piloter budget & economies",
    description: "Les routines influencent les projections pour montrer ou agir en priorite."
  }
];

export function StepsSection() {
  return (
    <section className="space-y-8 py-10 md:py-16">
      <div className="space-y-4">
        <Badge variant="coral">Parcours</Badge>
        <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
          Une UX claire, familiale et motivee par des gains visibles.
        </h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.index}>
            <div className="space-y-6 p-7">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--foreground-subtle)]">
                {step.index}
              </span>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">{step.title}</h3>
                <p className="text-[15px] leading-7 text-[var(--foreground-muted)]">
                  {step.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

