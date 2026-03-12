import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Claire M.",
    role: "Mère de 2 enfants",
    quote:
      "On a enfin une répartition qui ne repose plus sur la charge mentale d'une seule personne. Mon mari et moi gagnons 2h par semaine.",
    stars: 5,
    avatar: "CM",
    avatarGradient: "from-violet-500 to-purple-600",
    highlight: "2h gagnées/semaine",
    cardGradient: "from-violet-50/80 to-white",
    border: "border-violet-100"
  },
  {
    name: "Nadia K.",
    role: "Famille avec chien",
    quote:
      "Le module économies a rendu concret ce qu'on dépensait à cause des repas improvisés. On économise 280 € par mois depuis 2 mois.",
    stars: 5,
    avatar: "NK",
    avatarGradient: "from-pink-500 to-rose-600",
    highlight: "280 €/mois économisés",
    cardGradient: "from-rose-50/80 to-white",
    border: "border-rose-100"
  },
  {
    name: "Julien D.",
    role: "Parent en garde alternée",
    quote:
      "La structure se prête parfaitement à la garde alternée. On visualise qui fait quoi et quand, même sur deux foyers distincts.",
    stars: 5,
    avatar: "JD",
    avatarGradient: "from-blue-500 to-indigo-600",
    highlight: "2 foyers synchronisés",
    cardGradient: "from-blue-50/80 to-white",
    border: "border-blue-100"
  },
  {
    name: "Sarah & Tom",
    role: "Jeunes parents",
    quote:
      "On attendait bébé et la liste de naissance partageable a été un vrai plus. La famille a pu contribuer facilement depuis leur téléphone.",
    stars: 5,
    avatar: "ST",
    avatarGradient: "from-emerald-500 to-teal-600",
    highlight: "Liste naissance partagée",
    cardGradient: "from-emerald-50/80 to-white",
    border: "border-emerald-100"
  },
  {
    name: "Marc B.",
    role: "Père de 3 enfants",
    quote:
      "Le planning frigo PDF est utilisé chaque semaine. Les enfants adorent cocher leurs tâches — ça a tout changé dans notre routine.",
    stars: 5,
    avatar: "MB",
    avatarGradient: "from-amber-500 to-orange-600",
    highlight: "PDF utilisé chaque semaine",
    cardGradient: "from-amber-50/80 to-white",
    border: "border-amber-100"
  },
  {
    name: "Léa R.",
    role: "Famille recomposée",
    quote:
      "L'assistant IA nous a proposé un planning en 30 secondes qui prenait en compte nos contraintes d'emploi du temps. Bluffant.",
    stars: 5,
    avatar: "LR",
    avatarGradient: "from-indigo-500 to-violet-600",
    highlight: "Planning IA en 30 secondes",
    cardGradient: "from-indigo-50/80 to-white",
    border: "border-indigo-100"
  }
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="temoignages" className="space-y-10 py-10 md:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge variant="mint">Témoignages</Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Des familles qui ont{" "}
            <span className="text-gradient">repris la main</span>.
          </h2>
        </div>
        {/* Overall rating */}
        <div className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/80 px-5 py-3">
          <div>
            <p className="text-2xl font-black">4.8</p>
            <StarRating count={5} />
          </div>
          <div className="h-10 w-px bg-[var(--border)]" />
          <p className="text-sm text-[var(--foreground-muted)]">
            Note moyenne<br />sur 2 400+ familles
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((t) => (
          <Card
            key={t.name}
            className={`border ${t.border} bg-gradient-to-br ${t.cardGradient} hover-lift`}
          >
            <div className="space-y-4 p-6">
              {/* Stars */}
              <StarRating count={t.stars} />

              {/* Quote */}
              <p className="text-[15px] leading-7 text-[var(--foreground)]">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Highlight pill */}
              <div className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[var(--foreground-muted)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                ✓ {t.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-white/60 pt-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarGradient} text-xs font-bold text-white`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{t.role}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
