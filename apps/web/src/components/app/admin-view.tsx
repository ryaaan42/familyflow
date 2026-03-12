"use client";

import { AlertTriangle, CreditCard, ShieldCheck, Users2, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const modules = [
  {
    icon: Users2,
    title: "Utilisateurs",
    description: "Rechercher un compte, changer son statut, lancer une réinitialisation et consulter l'historique.",
    actions: ["Voir tous les utilisateurs", "Suspendre un compte", "Réinitialiser mot de passe"]
  },
  {
    icon: CreditCard,
    title: "Paiements",
    description: "Suivre les abonnements, les échecs de paiement, les remboursements et la MRR.",
    actions: ["Lister les abonnements", "Traiter un remboursement", "Exporter la facturation"]
  },
  {
    icon: Wrench,
    title: "Configuration app",
    description: "Activer/désactiver des modules, piloter les flags et gérer les paramètres globaux.",
    actions: ["Modifier les feature flags", "Éditer les textes globaux", "Mettre en maintenance"]
  }
];

export function AdminView() {
  return (
    <div className="space-y-5">
      <Card>
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--brand-primary)]" />
                <h1 className="text-2xl font-semibold tracking-tight">Panel Admin</h1>
              </div>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                Console centralisée pour administrer FamilyFlow: utilisateurs, paiements, sécurité et configuration produit.
              </p>
            </div>
            <Badge variant="coral">Accès restreint</Badge>
          </div>
          <div className="rounded-2xl border border-[#ffe0c7] bg-[#fff6ee] p-4 text-sm text-[#9a4b00]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>
                V1 UI prête: les actions sont câblées en interface. Les mutations backend (RBAC, audit log, billing provider)
                doivent être reliées pour la production.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <Card key={module.title}>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-[#edf3ff] p-2 text-[var(--brand-primary)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-semibold">{module.title}</h2>
                </div>
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">{module.description}</p>
                <ul className="space-y-2 text-sm">
                  {module.actions.map((action) => (
                    <li key={action} className="rounded-xl bg-[var(--card-muted)] px-3 py-2">
                      {action}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full">
                  Ouvrir {module.title}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
