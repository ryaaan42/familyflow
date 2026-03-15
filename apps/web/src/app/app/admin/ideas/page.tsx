import { Lightbulb, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const ideas = [
  { title: "Mode semaine automatique", value: "Générer chaque dimanche un plan tâches + repas + courses, puis envoyer un résumé en push/mail." },
  { title: "Défis famille gamifiés", value: "Objectifs collectifs avec points, badges enfants/ados, et récompenses maison configurables." },
  { title: "Plan anti-charge mentale", value: "Détecter les membres surchargés et proposer une redistribution automatique hebdomadaire." },
  { title: "Assistant achats intelligent", value: "Comparer automatiquement les paniers par enseigne, suggérer alternatives moins chères et promos locales." },
  { title: "Timeline grossesse & bébé", value: "Checklist proactive par trimestre + rappels médicaux + préparation naissance/liste intégrée." },
  { title: "Centre de rituels familiaux", value: "Créer des routines du matin/soir/thèmes (école, sport, week-end) avec activation en un clic." },
  { title: "Tableau de bord énergie maison", value: "Suivi eau/électricité/chauffage et mini-objectifs écologie connectés aux tâches." },
  { title: "Coffre souvenirs de famille", value: "Associer une photo/voice note à une tâche ou objectif pour garder un historique positif." }
];

export default function AdminIdeasPage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#312e81_0%,#5b21b6_45%,#9333ea_100%)] text-white">
        <div className="p-6 md:p-8">
          <Badge variant="white">Admin seulement</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Backlog d'idées produit</h1>
          <p className="mt-2 text-sm text-white/80">Propositions stratégiques alignées avec la promesse FamilyFlow.</p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {ideas.map((idea) => (
          <Card key={idea.title}>
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-violet-100 p-2 text-violet-700"><Lightbulb className="h-4 w-4" /></div>
                <p className="font-semibold">{idea.title}</p>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">{idea.value}</p>
              <div className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700"><Sparkles className="h-3.5 w-3.5" /> potentiel élevé</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
