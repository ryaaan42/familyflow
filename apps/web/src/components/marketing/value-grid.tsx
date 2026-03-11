import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const features = [
  {
    category: "Taches",
    title: "Moteur de suggestions par age, role et logement",
    description:
      "Chaque foyer demarre avec une base de taches pertinente, modulable, equitable et evolutive."
  },
  {
    category: "Budget",
    title: "Vue mensuelle claire pour suivre les revenus et les ecarts",
    description:
      "Revenus, charges fixes, depenses variables et objectifs d'economies restent lisibles en un coup d'oeil."
  },
  {
    category: "Economies",
    title: "Projection concrete des habitudes qui coutent cher",
    description:
      "Livraisons repas, sorties, courses mal planifiees ou linge mal gere se traduisent en euros et en actions."
  },
  {
    category: "PDF",
    title: "Exports esthetiques pensés pour le frigo, le classeur ou le partage",
    description:
      "Themes minimal, premium, kawaii et noir & blanc avec A4 imprimable."
  }
];

export function ValueGrid() {
  return (
    <section id="fonctionnalites" className="space-y-8 py-10 md:py-16">
      <div className="max-w-2xl space-y-4">
        <Badge>Une V1 utile, pas un simple concept</Badge>
        <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
          Une base SaaS credible pour les familles qui veulent reprendre la main.
        </h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            className={index % 2 === 0 ? "bg-[rgba(255,255,255,0.94)]" : "bg-[rgba(255,249,244,0.94)]"}
          >
            <div className="space-y-4 p-7">
              <Badge variant={index % 2 === 0 ? "default" : "coral"}>{feature.category}</Badge>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-[-0.02em]">{feature.title}</h3>
                <p className="max-w-xl text-[15px] leading-7 text-[var(--foreground-muted)]">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

