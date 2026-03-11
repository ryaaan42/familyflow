import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const faq = [
  {
    q: "La V1 est-elle exploitable sans tout reconstruire ?",
    a: "Oui. La structure est monorepo, la logique metier est partagee, Supabase est prepare et le mode demo accelere le branchement progressif."
  },
  {
    q: "Le PDF est-il vraiment prevu pour l'impression ?",
    a: "Oui. Le format A4, les themes et la lisibilite frigo / classeur sont integres a la route d'export."
  },
  {
    q: "Le premium est-il anticipe ?",
    a: "Oui. Les plans, les exports premium, les suggestions IA et Stripe sont prets a etre actives proprement."
  }
];

export function FaqSection() {
  return (
    <section id="faq" className="space-y-8 py-10 md:py-16">
      <div className="space-y-4">
        <Badge variant="outline">FAQ</Badge>
        <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
          Questions produit courantes.
        </h2>
      </div>
      <div className="grid gap-5">
        {faq.map((item) => (
          <Card key={item.q}>
            <div className="space-y-3 p-7">
              <h3 className="text-lg font-semibold">{item.q}</h3>
              <p className="max-w-4xl text-[15px] leading-7 text-[var(--foreground-muted)]">{item.a}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

