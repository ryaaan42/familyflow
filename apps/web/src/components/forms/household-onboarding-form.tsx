"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { householdSchema } from "@familyflow/shared";
import { useFamilyFlowStore } from "@familyflow/shared";
import { z } from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { buildBirthListSlug } from "@/lib/slug";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HouseholdFormValues = z.input<typeof householdSchema>;

export function HouseholdOnboardingForm() {
  const profile = useFamilyFlowStore((s) => s.profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<HouseholdFormValues>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      name: profile.household.name,
      housingType: profile.household.housingType,
      surfaceSqm: profile.household.surfaceSqm,
      rooms: profile.household.rooms,
      childrenCount: profile.household.childrenCount,
      city: profile.household.city ?? "",
      isExpectingBaby: profile.household.isExpectingBaby ?? false,
      pregnancyDueDate: profile.household.pregnancyDueDate ?? "",
      birthListShareSlug: profile.household.birthListShareSlug ?? "",
      aiContext: {
        housingDetails: profile.household.aiContext?.housingDetails ?? "",
        petsDetails: profile.household.aiContext?.petsDetails ?? "",
        childrenAges: profile.household.aiContext?.childrenAges ?? "",
        lifestyleRhythm: profile.household.aiContext?.lifestyleRhythm ?? "",
        preferredTaskDays: profile.household.aiContext?.preferredTaskDays ?? "",
        mealPreferences: profile.household.aiContext?.mealPreferences ?? "",
        foodConstraints: profile.household.aiContext?.foodConstraints ?? "",
        organizationGoals: profile.household.aiContext?.organizationGoals ?? "",
        scheduleConstraints: profile.household.aiContext?.scheduleConstraints ?? "",
        routinesWanted: profile.household.aiContext?.routinesWanted ?? "",
        weeklyBudget: profile.household.aiContext?.weeklyBudget ?? undefined,
        monthlyBudget: profile.household.aiContext?.monthlyBudget ?? undefined
      }
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createSupabaseBrowserClient();
    const resolvedSlug = values.isExpectingBaby
      ? (values.birthListShareSlug?.trim() || buildBirthListSlug(values.name, profile.household.id.slice(0, 6)))
      : null;

    const householdPayload = {
      name: values.name,
      housing_type: values.housingType,
      surface_sqm: values.surfaceSqm,
      rooms: values.rooms,
      children_count: values.childrenCount,
      city: values.city ?? null,
      is_expecting_baby: values.isExpectingBaby,
      pregnancy_due_date: values.pregnancyDueDate || null,
      birth_list_share_slug: resolvedSlug,
      ai_context: values.aiContext ?? {}
    };

    let { error: dbError } = await supabase
      .from("households")
      .update(householdPayload)
      .eq("id", profile.household.id);

    const missingAiContextColumn =
      dbError &&
      (dbError.code === "PGRST204" || dbError.message.includes("ai_context"));

    if (missingAiContextColumn) {
      const { ai_context: _ignored, ...legacyPayload } = householdPayload;
      ({ error: dbError } = await supabase
        .from("households")
        .update(legacyPayload)
        .eq("id", profile.household.id));
    }

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    useFamilyFlowStore.setState((state) => ({
      profile: {
        ...state.profile,
        household: {
          ...state.profile.household,
          name: values.name,
          housingType: values.housingType,
          surfaceSqm: values.surfaceSqm,
          rooms: values.rooms,
          childrenCount: values.childrenCount,
          city: values.city,
          isExpectingBaby: values.isExpectingBaby,
          pregnancyDueDate: values.pregnancyDueDate || undefined,
          birthListShareSlug: resolvedSlug ?? undefined,
          aiContext: values.aiContext ?? undefined
        }
      }
    }));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  });

  return (
    <Card>
      <form className="grid gap-4 p-6 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="space-y-2 md:col-span-2">
          <h3 className="text-xl font-semibold">Informations du foyer</h3>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nom du foyer</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-sm text-rose-600">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="housingType">Type de logement</Label>
          <select
            id="housingType"
            className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm"
            {...form.register("housingType")}
          >
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" {...form.register("city")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surface">Surface approx. (m²)</Label>
          <Input id="surface" type="number" min={15} {...form.register("surfaceSqm")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rooms">Nombre de pièces</Label>
          <Input id="rooms" type="number" min={1} {...form.register("rooms")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="children">Nombre d'enfants</Label>
          <Input id="children" type="number" min={0} {...form.register("childrenCount")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm cursor-pointer">
            <input type="checkbox" {...form.register("isExpectingBaby")} />
            Une maman du foyer est actuellement enceinte
          </label>
        </div>
        {form.watch("isExpectingBaby") ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Terme estimé</Label>
              <Input id="dueDate" type="date" {...form.register("pregnancyDueDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareSlug">Slug partage liste de naissance</Label>
              <Input id="shareSlug" {...form.register("birthListShareSlug")} />
            </div>
          </>
        ) : null}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="lifestyleRhythm">Rythme de vie & contraintes horaires</Label>
          <textarea id="lifestyleRhythm" className="min-h-[88px] w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm" {...form.register("aiContext.lifestyleRhythm")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="mealPreferences">Préférences repas / contraintes</Label>
          <textarea id="mealPreferences" className="min-h-[88px] w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm" {...form.register("aiContext.mealPreferences")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weeklyBudget">Budget hebdo estimé (€)</Label>
          <Input id="weeklyBudget" type="number" min={0} {...form.register("aiContext.weeklyBudget")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyBudget">Budget mensuel (€)</Label>
          <Input id="monthlyBudget" type="number" min={0} {...form.register("aiContext.monthlyBudget")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="organizationGoals">Objectifs d’organisation & routines souhaitées</Label>
          <textarea id="organizationGoals" className="min-h-[88px] w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm" {...form.register("aiContext.organizationGoals")} />
        </div>
        {error ? (
          <div className="md:col-span-2">
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
          </div>
        ) : null}
        <div className="md:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : saved ? "Enregistré !" : "Enregistrer le foyer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
