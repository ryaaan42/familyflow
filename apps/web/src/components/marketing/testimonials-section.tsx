import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Claire, 2 enfants",
    quote:
      "On a enfin une repartition qui ne repose plus sur la charge mentale d'une seule personne."
  },
  {
    name: "Nadia, famille avec chien",
    quote:
      "Le module economies a rendu concret ce qu'on depensait a cause des repas improvises."
  },
  {
    name: "Julien, parent separe",
    quote:
      "La structure se prete bien a la garde alternee. On visualise mieux qui fait quoi et quand."
  }
];

export function TestimonialsSection() {
  return (
    <section id="temoignages" className="space-y-8 py-10 md:py-16">
      <div className="space-y-4">
        <Badge variant="mint">Temoignages</Badge>
        <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
          Une app qui rassure autant qu’elle structure.
        </h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name} className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,245,255,0.92))]">
            <div className="space-y-5 p-7">
              <p className="text-lg leading-8">“{testimonial.quote}”</p>
              <p className="text-sm font-semibold text-[var(--foreground-muted)]">{testimonial.name}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

