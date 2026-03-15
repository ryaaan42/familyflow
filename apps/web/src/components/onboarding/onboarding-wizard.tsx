"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, Home, Users, Target, Plus, Trash2 } from "lucide-react";

import { createHouseholdWithMembers } from "@/lib/supabase/household-actions";
import { getMemberCategoryFromAge } from "@/lib/household-member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const AVATAR_COLORS = [
  "#6D5EF4",
  "#FF7E6B",
  "#56C7A1",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#10B981",
  "#8B5CF6"
];

const householdStep = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  housingType: z.enum(["appartement", "maison"]),
  city: z.string().optional(),
  surfaceSqm: z.coerce.number().min(15, "Minimum 15 m²").max(700),
  rooms: z.coerce.number().min(1, "Minimum 1 pièce").max(20),
  childrenCount: z.coerce.number().min(0).max(12),
  hasPets: z.boolean(),
  isExpectingBaby: z.boolean(),
  pregnancyDueDate: z.string().optional(),
  lifestyleRhythm: z.string().optional(),
  mealPreferences: z.string().optional(),
  organizationGoals: z.string().optional(),
  weeklyBudget: z.coerce.number().min(0).max(5000).optional(),
  monthlyBudget: z.coerce.number().min(0).max(20000).optional()
});

const membersStep = z.object({
  members: z
    .array(
      z.object({
        displayName: z.string().min(2, "Minimum 2 caractères"),
        age: z.coerce.number().min(0).max(120),
        role: z.enum(["adulte", "ado", "enfant", "bebe"]),
        avatarColor: z.string(),
        isPregnant: z.boolean()
      })
    )
    .min(1, "Ajoutez au moins un membre")
});

type HouseholdValues = z.infer<typeof householdStep>;
type MembersValues = z.infer<typeof membersStep>;

const STEPS = [
  { id: 1, label: "Votre foyer", icon: Home },
  { id: 2, label: "Les membres", icon: Users },
  { id: 3, label: "Objectif", icon: Target }
];

const OBJECTIVES = [
  { value: "tasks", label: "Mieux organiser les tâches" },
  { value: "budget", label: "Mieux gérer le budget" },
  { value: "load", label: "Mieux répartir la charge" },
  { value: "routines", label: "Mieux suivre les routines" }
];

const ROLE_LABELS: Record<string, string> = {
  adulte: "Adulte",
  ado: "Ado",
  enfant: "Enfant",
  bebe: "Bébé"
};

const PREGNANT_ROLES = new Set(["adulte"]);


const LIFESTYLE_OPTIONS = [
  "Horaires classiques (9h-18h)",
  "Horaires décalés / travail en soirée",
  "Travail de nuit",
  "Planning variable chaque semaine",
  "Télétravail majoritaire"
] as const;

const MEAL_OPTIONS = [
  "Repas maison rapides",
  "Batch cooking le week-end",
  "Mélange maison + livraison",
  "Végétarien / flexitarien",
  "Sans contrainte particulière"
] as const;

const ORGANIZATION_OPTIONS = [
  "Mieux répartir les tâches quotidiennes",
  "Créer des routines matin/soir",
  "Mieux anticiper les courses et repas",
  "Réduire la charge mentale",
  "Préparer l'arrivée de bébé"
] as const;

const WEEKLY_BUDGET_OPTIONS = [80, 120, 160, 220, 300] as const;
const MONTHLY_BUDGET_OPTIONS = [500, 800, 1200, 1800, 2500] as const;

export function OnboardingWizard({ displayName }: { displayName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [householdData, setHouseholdData] = useState<HouseholdValues | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<string>("tasks");
  const [finalizingMessage, setFinalizingMessage] = useState<string | null>(null);

  const householdForm = useForm<HouseholdValues>({
    resolver: zodResolver(householdStep),
    defaultValues: {
      name: displayName ? `Famille ${displayName.split(" ")[0]}` : "",
      housingType: "appartement",
      city: "",
      surfaceSqm: 60,
      rooms: 3,
      childrenCount: 0,
      hasPets: false,
      isExpectingBaby: false,
      pregnancyDueDate: "",
      lifestyleRhythm: "",
      mealPreferences: "",
      organizationGoals: "",
      weeklyBudget: undefined,
      monthlyBudget: undefined
    }
  });

  const isExpectingBaby = householdForm.watch("isExpectingBaby");

  const membersForm = useForm<MembersValues>({
    resolver: zodResolver(membersStep),
    defaultValues: {
      members: [
        {
          displayName: displayName || "",
          age: 30,
          role: "adulte",
          avatarColor: AVATAR_COLORS[0],
          isPregnant: false
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: membersForm.control,
    name: "members"
  });

  const handleHouseholdNext = householdForm.handleSubmit((values) => {
    setHouseholdData(values);
    setStep(2);
  });

  const handleMembersNext = membersForm.handleSubmit(() => {
    setStep(3);
  });

  const handleFinish = async () => {
    const membersValues = membersForm.getValues();
    const isValid = await membersForm.trigger();
    if (!isValid || !householdData) return;

    setSubmitting(true);
    setServerError(null);

    const { error } = await createHouseholdWithMembers(
      {
        name: householdData.name,
        housingType: householdData.housingType,
        surfaceSqm: householdData.surfaceSqm,
        rooms: householdData.rooms,
        childrenCount: householdData.childrenCount,
        hasPets: householdData.hasPets,
        city: householdData.city,
        isExpectingBaby: householdData.isExpectingBaby,
        pregnancyDueDate: householdData.pregnancyDueDate || undefined,
        objective: selectedObjective,
        aiContext: {
          lifestyleRhythm: householdData.lifestyleRhythm,
          mealPreferences: householdData.mealPreferences,
          organizationGoals: householdData.organizationGoals,
          weeklyBudget: householdData.weeklyBudget,
          monthlyBudget: householdData.monthlyBudget
        }
      },
      membersValues.members.map((m, i) => {
        const category = getMemberCategoryFromAge(m.age);
        return {
          displayName: m.displayName,
          age: m.age,
          role: category === "bebe" ? "autre" : category,
          avatarColor: m.avatarColor,
          isAdmin: i === 0,
          isPregnant: m.isPregnant
        };
      })
    );

    setSubmitting(false);

    if (error) {
      setServerError(error);
      return;
    }

    setFinalizingMessage("Création de votre espace... génération IA en arrière-plan.");
    fetch("/api/onboarding/finalize", { method: "POST", keepalive: true }).catch(() => undefined);
    router.push("/app/tasks");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Indicateurs d'étapes */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  done
                    ? "bg-emerald-400 text-white"
                    : active
                      ? "bg-white text-[#6D5EF4] shadow-lg"
                      : "bg-white/20 text-white/50"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  active ? "text-white" : done ? "text-emerald-300" : "text-white/40"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-white/30" />
              )}
            </div>
          );
        })}
      </div>

      {finalizingMessage ? (<p className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700">{finalizingMessage}</p>) : null}

      {/* Étape 1 — Foyer */}
      {step === 1 && (
        <Card className="overflow-hidden">
          <form className="space-y-5 p-7" onSubmit={handleHouseholdNext}>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Votre foyer</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Dites-nous comment s'appelle votre foyer et quelques infos de base.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom du foyer *</Label>
              <Input id="name" placeholder="ex: Famille Dupont" {...householdForm.register("name")} />
              {householdForm.formState.errors.name && (
                <p className="text-sm text-rose-600">{householdForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="housingType">Type de logement *</Label>
                <select
                  id="housingType"
                  className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm"
                  {...householdForm.register("housingType")}
                >
                  <option value="appartement">Appartement</option>
                  <option value="maison">Maison</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" placeholder="ex: Paris" {...householdForm.register("city")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="surfaceSqm">Surface (m²) *</Label>
                <Input
                  id="surfaceSqm"
                  type="number"
                  min={15}
                  {...householdForm.register("surfaceSqm")}
                />
                {householdForm.formState.errors.surfaceSqm && (
                  <p className="text-sm text-rose-600">{householdForm.formState.errors.surfaceSqm.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rooms">Nombre de pièces *</Label>
                <Input
                  id="rooms"
                  type="number"
                  min={1}
                  {...householdForm.register("rooms")}
                />
                {householdForm.formState.errors.rooms && (
                  <p className="text-sm text-rose-600">{householdForm.formState.errors.rooms.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="childrenCount">Nombre d'enfants</Label>
                <Input
                  id="childrenCount"
                  type="number"
                  min={0}
                  {...householdForm.register("childrenCount")}
                />
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm w-full">
                  <input type="checkbox" {...householdForm.register("hasPets")} />
                  Nous avons des animaux
                </label>
              </div>
            </div>

            {/* Question grossesse au niveau du foyer */}
            <div className="space-y-3 rounded-2xl border border-[rgba(255,126,107,0.3)] bg-[rgba(255,126,107,0.04)] p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                <input type="checkbox" {...householdForm.register("isExpectingBaby")} />
                Un des parents est enceinte
              </label>
              {isExpectingBaby && (
                <div className="space-y-1.5 pl-7">
                  <Label htmlFor="pregnancyDueDate" className="text-sm">
                    Date de terme estimée
                  </Label>
                  <Input
                    id="pregnancyDueDate"
                    type="date"
                    className="max-w-[220px]"
                    {...householdForm.register("pregnancyDueDate")}
                  />
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lifestyleRhythm">Rythme de vie</Label>
                <select
                  id="lifestyleRhythm"
                  className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm"
                  {...householdForm.register("lifestyleRhythm")}
                >
                  <option value="">Choisir une proposition</option>
                  {LIFESTYLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mealPreferences">Préférences repas</Label>
                <select
                  id="mealPreferences"
                  className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm"
                  {...householdForm.register("mealPreferences")}
                >
                  <option value="">Choisir une proposition</option>
                  {MEAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weeklyBudget">Budget hebdo estimé (€)</Label>
                <select
                  id="weeklyBudget"
                  className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm"
                  {...householdForm.register("weeklyBudget", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value))
                  })}
                >
                  <option value="">Choisir un budget</option>
                  {WEEKLY_BUDGET_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option} €</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyBudget">Budget mensuel (€)</Label>
                <select
                  id="monthlyBudget"
                  className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm"
                  {...householdForm.register("monthlyBudget", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value))
                  })}
                >
                  <option value="">Choisir un budget</option>
                  {MONTHLY_BUDGET_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option} €</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationGoals">Objectifs d'organisation</Label>
              <select
                id="organizationGoals"
                className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm"
                {...householdForm.register("organizationGoals")}
              >
                <option value="">Choisir une proposition</option>
                {ORGANIZATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full">
              Continuer
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}

      {/* Étape 2 — Membres */}
      {step === 2 && (
        <Card className="overflow-hidden">
          <form className="space-y-5 p-7" onSubmit={handleMembersNext}>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Les membres</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Ajoutez les personnes qui vivent dans votre foyer.
              </p>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const role = membersForm.watch(`members.${index}.role`);
                const canBePregnant = PREGNANT_ROLES.has(role);

                return (
                  <div
                    key={field.id}
                    className="rounded-2xl border border-[var(--border)] bg-[rgba(109,94,244,0.04)] p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--foreground-muted)]">
                        {index === 0 ? "Vous (admin)" : `Membre ${index + 1}`}
                      </p>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="rounded-xl p-1.5 text-rose-400 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Prénom *</Label>
                        <Input
                          placeholder="Prénom"
                          {...membersForm.register(`members.${index}.displayName`)}
                        />
                        {membersForm.formState.errors.members?.[index]?.displayName && (
                          <p className="text-xs text-rose-600">
                            {membersForm.formState.errors.members[index]?.displayName?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Âge *</Label>
                        <Input
                          type="number"
                          min={0}
                          max={120}
                          {...membersForm.register(`members.${index}.age`)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Catégorie</Label>
                      <div className="h-11 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm flex items-center">
                        {ROLE_LABELS[getMemberCategoryFromAge(Number(membersForm.watch(`members.${index}.age`) || 0))]}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Couleur d'avatar</Label>
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              membersForm.setValue(`members.${index}.avatarColor`, color)
                            }
                            className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                            style={{
                              backgroundColor: color,
                              borderColor:
                                membersForm.watch(`members.${index}.avatarColor`) === color
                                  ? "#111"
                                  : "transparent"
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Grossesse — visible uniquement pour parent / adulte */}
                    {canBePregnant && (
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[rgba(255,126,107,0.3)] bg-[rgba(255,126,107,0.04)] px-4 py-3 text-sm">
                        <input
                          type="checkbox"
                          {...membersForm.register(`members.${index}.isPregnant`)}
                        />
                        Ce membre est enceinte
                      </label>
                    )}
                  </div>
                );
              })}

              {membersForm.formState.errors.members?.root && (
                <p className="text-sm text-rose-600">
                  {membersForm.formState.errors.members.root.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                append({
                  displayName: "",
                  age: 25,
                  role: "adulte",
                  avatarColor: AVATAR_COLORS[fields.length % AVATAR_COLORS.length],
                  isPregnant: false
                })
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] py-3 text-sm text-[var(--foreground-muted)] transition hover:border-[#6D5EF4] hover:text-[#6D5EF4]"
            >
              <Plus className="h-4 w-4" />
              Ajouter un membre
            </button>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button type="submit" className="flex-1">
                Continuer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Étape 3 — Objectif */}
      {step === 3 && (
        <Card className="overflow-hidden">
          <div className="space-y-5 p-7">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Votre objectif principal</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Qu'est-ce qui vous a amené sur Planille ?
              </p>
            </div>

            <div className="grid gap-3">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.value}
                  type="button"
                  onClick={() => setSelectedObjective(obj.value)}
                  className={`rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all ${
                    selectedObjective === obj.value
                      ? "border-[#6D5EF4] bg-[rgba(109,94,244,0.08)] text-[#6D5EF4]"
                      : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[#6D5EF4]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {obj.label}
                    {selectedObjective === obj.value && (
                      <Check className="h-4 w-4 text-[#6D5EF4]" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {serverError && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {serverError}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setStep(2)}
                disabled={submitting}
              >
                Retour
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleFinish}
                disabled={submitting}
              >
                {submitting ? "Création en cours..." : "Lancer Planille"}
                {!submitting && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
