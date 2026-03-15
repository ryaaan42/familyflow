"use client";

import Link from "next/link";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Download, FileSpreadsheet, Palette, Printer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const themes = [
  { value: "minimal", label: "Minimal" },
  { value: "familial-kawaii", label: "Familial kawaii" },
  { value: "premium", label: "Premium" },
  { value: "print", label: "Noir & blanc" },
  { value: "aurora", label: "Aurora" },
  { value: "terracotta", label: "Terracotta" }
] as const;

const previewDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function ExportsView() {
  const state = useFamilyFlowStore();

  return (
    <div className="space-y-5">
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(14,15,40,0.95),rgba(64,69,180,0.9),rgba(73,140,225,0.84),rgba(255,126,107,0.76))] text-white hero-glow">
        <div className="grid gap-8 p-7 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/14 text-white shadow-none">PDF premium</Badge>
            <h2 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
              Un tableau hebdomadaire a imprimer, accrocher et vraiment utiliser.
            </h2>
            <p className="max-w-3xl text-[15px] leading-7 text-white/78">
              L'export est pense comme une feuille frigo premium: routines quotidiennes, colonnes par jour,
              budget/economies en deuxieme page et themes de rendu selon le contexte.
            </p>
            <Button asChild>
              <Link href={`/api/pdf?theme=${state.pdfPreferences.theme}`}>
                <Download className="mr-2 h-4 w-4" />
                Ouvrir le PDF de la semaine
              </Link>
            </Button>
          </div>

          <div className="rounded-[34px] border border-white/16 bg-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/66">Apercu frigo</p>
                <p className="mt-1 text-xl font-semibold">Planning semaine</p>
              </div>
              <Printer className="h-5 w-5 text-white/88" />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {previewDays.map((day, index) => (
                <div key={day} className="rounded-[18px] border border-white/14 bg-white/12 p-2">
                  <p className="text-xs font-semibold text-white/84">{day}</p>
                  <div className="mt-2 space-y-1">
                    <div className={`h-2 rounded-full ${index % 2 === 0 ? "bg-white/70" : "bg-cyan-200/80"}`} />
                    <div className="h-2 rounded-full bg-white/34" />
                    {index >= 4 ? <div className="h-2 rounded-full bg-orange-200/70" /> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Theme PDF</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Choix du rendu pour impression, partage ou support premium.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => state.setPdfTheme(theme.value)}
                  className={`rounded-[28px] border px-4 py-4 text-left transition ${
                    state.pdfPreferences.theme === theme.value
                      ? "border-[var(--brand-primary)] bg-[linear-gradient(135deg,rgba(109,94,244,0.14),rgba(74,142,255,0.08),rgba(255,255,255,0.92))] shadow-[0_18px_36px_rgba(79,90,214,0.12)]"
                      : "border-white/70 bg-white/88"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{theme.label}</p>
                    <Badge variant={theme.value === "premium" ? "default" : theme.value === "print" ? "outline" : "mint"}>
                      {theme.value === "premium" ? "Le plus beau" : theme.value === "print" ? "Impression" : theme.value === "aurora" || theme.value === "terracotta" ? "Nouveau" : "Ambiance"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {theme.value === "premium"
                      ? "Rendu riche, editorial, colore et plus proche d'un produit fintech premium."
                      : theme.value === "aurora"
                        ? "Dégradés modernes bleu/vert pour un PDF très digital et contemporain."
                        : theme.value === "terracotta"
                          ? "Palette chaude et élégante, idéale pour une impression conviviale."
                      : theme.value === "familial-kawaii"
                        ? "Palette plus douce pour une feuille familiale chaleureuse."
                        : theme.value === "print"
                          ? "Noir et blanc propre, lisible et econome en encre."
                          : "Tres lisible avec beaucoup d'air et un rendu editorial."}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(58,176,255,0.12)] p-3 text-[var(--brand-primary)]">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Exports disponibles</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Une V1 plus utile tout de suite, avec un vrai use case frigo.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {[
                {
                  label: "Planning hebdomadaire frigo",
                  tone: "default" as const,
                  copy: "Colonnes par jour, routines quotidiennes et cases a cocher."
                },
                {
                  label: "Repartition par membre",
                  tone: "mint" as const,
                  copy: "Charge attribuee, taches cles et logique d'equilibrage."
                },
                {
                  label: "Budget + economies",
                  tone: "coral" as const,
                  copy: "Objectif d'epargne, cout actuel, cible et projections."
                },
                {
                  label: "Check-list menage",
                  tone: "outline" as const,
                  copy: "Base prete pour une variante plus simple a imprimer ensuite."
                }
              ].map((item) => (
                <div key={item.label} className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,255,0.92))] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.label}</p>
                    <Badge variant={item.tone}>{item.label === "Check-list menage" ? "Base prete" : "Actif"}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
