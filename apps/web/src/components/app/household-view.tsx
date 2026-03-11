"use client";

import { useFamilyFlowStore } from "@familyflow/shared";
import { Baby, Dog, House, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { HouseholdOnboardingForm } from "@/components/forms/household-onboarding-form";

export function HouseholdView() {
  const state = useFamilyFlowStore();

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge>Foyer</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">{state.profile.household.name}</h2>
            <p className="text-[15px] text-[var(--foreground-muted)]">
              {state.profile.household.housingType}, {state.profile.household.surfaceSqm} m2,{" "}
              {state.profile.household.rooms} pieces, {state.profile.household.city}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-[var(--card-muted)] p-4">
              <Users2 className="mb-2 h-5 w-5 text-[var(--brand-primary)]" />
              <p className="text-sm text-[var(--foreground-muted)]">Membres</p>
              <p className="text-2xl font-semibold">{state.profile.members.length}</p>
            </div>
            <div className="rounded-3xl bg-[var(--card-muted)] p-4">
              <Baby className="mb-2 h-5 w-5 text-[var(--brand-coral)]" />
              <p className="text-sm text-[var(--foreground-muted)]">Enfants</p>
              <p className="text-2xl font-semibold">{state.profile.household.childrenCount}</p>
            </div>
            <div className="rounded-3xl bg-[var(--card-muted)] p-4">
              <Dog className="mb-2 h-5 w-5 text-[var(--brand-mint-strong)]" />
              <p className="text-sm text-[var(--foreground-muted)]">Animaux</p>
              <p className="text-2xl font-semibold">{state.profile.pets.length}</p>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <HouseholdOnboardingForm />
        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-3 text-[var(--brand-primary)]">
                <House className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Membres et preferences</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Disponibilites, categories favorites et charges courantes
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

