"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const faq = [
  {
    q: "Planille est-il vraiment gratuit ?",
    a: "Oui, vous pouvez démarrer gratuitement sans carte bleue. Le plan gratuit couvre les tâches, le planning et la répartition équitable pour toute la famille. Les fonctionnalités premium (exports PDF, projections 12 mois, suggestions IA avancées) sont disponibles en upgrade à tout moment.",
    category: "Tarifs"
  },
  {
    q: "Combien de membres peut-on ajouter dans un foyer ?",
    a: "Autant que vous voulez — parents, ados, enfants, grands-parents, colocataires, animaux. Chaque profil a son âge, son rôle et ses capacités. L'IA adapte automatiquement les suggestions et la répartition à chaque membre.",
    category: "Foyer"
  },
  {
    q: "Planille fonctionne-t-il pour les gardes alternées ?",
    a: "Oui, c'est l'un de nos cas d'usage les plus populaires. Vous pouvez gérer deux foyers distincts, synchroniser les calendriers et visualiser qui fait quoi et quand sur chaque période de garde.",
    category: "Organisation"
  },
  {
    q: "Comment les économies sont-elles calculées ?",
    a: "Planille analyse vos habitudes réelles (courses, repas livrés, sorties non planifiées) et les traduit en euros avec des projections sur 3, 6 et 12 mois. Chaque scénario est concret et actionnable — pas des estimations génériques.",
    category: "Budget"
  },
  {
    q: "Les exports PDF sont-ils vraiment imprimables ?",
    a: "Absolument. Le format A4 est optimisé pour l'impression avec 4 thèmes au choix : Minimal, Premium, Kawaii et Noir & Blanc. Planning semaine, budget mensuel et check-lists enfants sont pensés pour tenir sur le frigo ou dans un classeur.",
    category: "PDF"
  },
  {
    q: "Mes données sont-elles privées et sécurisées ?",
    a: "Vos données restent privées et ne sont jamais partagées ou revendues. Planille est 100 % conforme RGPD. Les données de votre foyer ne sont visibles que par les membres que vous invitez explicitement.",
    category: "Confidentialité"
  },
  {
    q: "Puis-je utiliser Planille sur téléphone ?",
    a: "Oui. L'application web est entièrement responsive et optimisée mobile. Une application native iOS / Android (via Expo) est également en cours de développement et sera disponible prochainement.",
    category: "Mobile"
  },
  {
    q: "L'assistant IA comprend-il mon contexte familial ?",
    a: "Oui. L'IA prend en compte votre configuration spécifique : nombre de membres, âges, animaux, type de logement, contraintes d'emploi du temps et habitudes existantes. Le planning généré est adapté à votre foyer, pas un modèle générique.",
    category: "IA"
  }
];

const categoryColors: Record<string, string> = {
  "Tarifs": "text-violet-600 bg-violet-50",
  "Foyer": "text-blue-600 bg-blue-50",
  "Organisation": "text-pink-600 bg-pink-50",
  "Budget": "text-emerald-600 bg-emerald-50",
  "PDF": "text-amber-600 bg-amber-50",
  "Confidentialité": "text-indigo-600 bg-indigo-50",
  "Mobile": "text-teal-600 bg-teal-50",
  "IA": "text-rose-600 bg-rose-50"
};

function FaqItem({ item, isOpen, onToggle }: {
  item: typeof faq[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const colorClass = categoryColors[item.category] ?? "text-gray-600 bg-gray-50";

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
        isOpen
          ? "border-[var(--brand-primary)]/20 bg-white shadow-[0_8px_24px_rgba(109,94,244,0.08)]"
          : "border-[var(--border)] bg-white/60 hover:border-[var(--brand-primary)]/20 hover:bg-white"
      }`}
    >
      <button
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${colorClass}`}>
            {item.category}
          </span>
          <span className="text-[15px] font-semibold">{item.q}</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--foreground-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-200 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-[15px] leading-7 text-[var(--foreground-muted)]">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="space-y-10 py-10 md:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge variant="outline">Questions fréquentes</Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
            Tout ce que vous voulez savoir{" "}
            <span className="text-gradient">avant de commencer</span>.
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-7 text-[var(--foreground-muted)]">
          Une question qui n&apos;est pas listée ?{" "}
          <a href="mailto:hello@planille.app" className="font-semibold text-[var(--brand-primary)] underline-offset-2 hover:underline">
            Écrivez-nous
          </a>
        </p>
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2">
        {faq.map((item, index) => (
          <FaqItem
            key={item.q}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}
