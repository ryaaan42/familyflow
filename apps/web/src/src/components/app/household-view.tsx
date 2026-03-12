"use client";

import Link from "next/link";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Baby, BrainCircuit, Dog, Gift, House, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { HouseholdOnboardingForm } from "@/components/forms/household-onboarding-form";

export function HouseholdView() {
  const state = useFamilyFlowStore();
  const expectingParent = state.profile.members.find((member) => member.isPregnant);

  return (
    <div className="space-y-5">
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(19,18,49,0.96),rgba(104,74,188,0.9),rgba(86,199,161,0.78),rgba(255,126,107,0.72))] text-white hero-glow">
        <div className="flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Foyer</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">{state.profile.household.name}</h2>
            <p className="max-w-3xl text-[15px] text-white/78">
              {state.profile.household.housingType}, {state.profile.household.surfaceSqm} m2,{" "}
              {state.profile.household.rooms} pieces, {state.profile.household.city}
            </p>
            {state.profile.household.isExpectingBaby ? (
              <div className="rounded-[24px] border border-white/16 bg-white/10 px-4 py-3 text-sm text-white/82 backdrop-blur-md">
                Naissance en preparation pour {expectingParent?.name ?? "le foyer"}.
                Terme estime le {state.profile.household.pregnancyDueDate ?? "a definir"}.
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-md">
              <Users2 className="mb-2 h-5 w-5 text-white" />
              <p className="text-sm text-white/72">Membres</p>
              <p className="text-2xl font-semibold">{state.profile.members.length}</p>
            </div>
            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-md">
              <Baby className="mb-2 h-5 w-5 text-white" />
              <p className="text-sm text-white/72">Enfants</p>
              <p className="text-2xl font-semibold">{state.profile.household.childrenCount}</p>
            </div>
            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-md">
              <Dog className="mb-2 h-5 w-5 text-white" />
              <p className="text-sm text-white/72">Animaux</p>
              <p className="text-2xl font-semibold">{state.profile.pets.length}</p>
            </div>
            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-md">
              <Gift className="mb-2 h-5 w-5 text-white" />
              <p className="text-sm text-white/72">Liste bebe</p>
              <p className="text-2xl font-semibold">
                {state.profile.household.isExpectingBaby ? state.birthListItems.length : 0}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <HouseholdOnboardingForm />
        <div className="grid gap-5">
          <Card>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                  <House className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Membres et preferences</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Disponibilites, categories favorites et charge compatible avec le contexte du foyer.
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {state.profile.members.map((member) => (
                  <div key={member.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-10 w-10 rounded-full"
                          style={{ backgroundColor: member.avatarColor }}
                        />
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {member.role}, {member.age} ans
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {member.availabilityHoursPerWeek} h / semaine
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {member.favoriteCategories.map((category) => (
                        <Badge key={category} variant="mint">
                          {category}
                        </Badge>
                      ))}
                      {member.isPregnant ? <Badge variant="coral">Grossesse</Badge> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {state.profile.household.isExpectingBaby ? (
            <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,241,237,0.92))]">
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[rgba(255,126,107,0.14)] p-3 text-[var(--brand-coral)]">
                    <Baby className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Grossesse et naissance</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Espace dedie pour preparer l'arrivee du bebe et partager la liste de naissance.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button asChild>
                    <Link href="/app/assistant">
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Faire mon planning personnalise
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/app/birth-list">
                      <Gift className="mr-2 h-4 w-4" />
                      Ouvrir la liste de naissance
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
