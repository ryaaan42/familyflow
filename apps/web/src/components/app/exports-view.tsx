"use client";

import Link from "next/link";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Download, Palette } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const themes = [
  { value: "minimal", label: "Minimal" },
  { value: "familial-kawaii", label: "Familial kawaii" },
  { value: "premium", label: "Premium" },
  { value: "print", label: "Noir & blanc" }
] as const;

export function ExportsView() {
  const state = useFamilyFlowStore();

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge>PDF</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">
              Exports propres, lisibles et imprimables.
            </h2>
            <p className="max-w-3xl text-[15px] leading-7 text-[var(--foreground-muted)]">
              La route Next.js genere un PDF A4 avec tableau hebdomadaire, resume budget et
              economies. Le stockage Supabase peut etre branche pour les versions premium.
            </p>
          </div>
          <Button asChild>
            <Link href={`/api/pdf?theme=${state.pdfPreferences.theme}`}>
              <Download className="mr-2 h-4 w-4" />
              Telecharger le PDF
            </Link>
          </Button>
        </div>
      </Card>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Theme PDF</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Preference d'export de la famille</p>
              </div>
            </div>
            <div className="grid gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => state.setPdfTheme(theme.value)}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    state.pdfPreferences.theme === theme.value
                      ? "border-[var(--brand-primary)] bg-[rgba(109,94,244,0.08)]"
                      : "border-[var(--border)] bg-white"
                  }`}
                >
                  <p className="font-medium">{theme.label}</p>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    {theme.value === "premium"
                      ? "Couleurs riches, resume budget integre, rendu startup haut de gamme."
                      : theme.value === "familial-kawaii"
                        ? "Palette plus douce pour un affichage frigo motivant."
                        : theme.value === "print"
                          ? "Optimise noir et blanc."
                          : "Tres lisible et editorial."}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4 p-6">
            <h3 className="text-xl font-semibold">Exports disponibles</h3>
            <div className="grid gap-3">
              {[
                "Planning hebdomadaire",
                "Planning mensuel",
                "Repartition par membre",
                "Check-list menage",
                "Tableau special enfants",
                "Budget + economies"
              ].map((label, index) => (
                <div key={label} className="rounded-3xl bg-[var(--card-muted)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{label}</p>
                    <Badge variant={index % 2 === 0 ? "default" : "mint"}>
                      {index < 3 ? "V1" : "Pret"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

