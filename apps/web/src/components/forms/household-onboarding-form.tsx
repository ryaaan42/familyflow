"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { householdSchema } from "@familyflow/shared";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HouseholdFormValues = z.infer<typeof householdSchema>;

export function HouseholdOnboardingForm() {
  const form = useForm<HouseholdFormValues>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      name: "Famille Martin",
      housingType: "maison",
      surfaceSqm: 118,
      rooms: 6,
      childrenCount: 2,
      city: "Lyon"
    }
  });

  return (
    <Card>
      <form className="grid gap-4 p-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nom du foyer</Label>
          <Input id="name" {...form.register("name")} />
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
          <Label htmlFor="surface">Surface approx. (m2)</Label>
          <Input id="surface" type="number" {...form.register("surfaceSqm")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rooms">Nombre de pieces</Label>
          <Input id="rooms" type="number" {...form.register("rooms")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="children">Nombre d'enfants</Label>
          <Input id="children" type="number" {...form.register("childrenCount")} />
        </div>
        <div className="md:col-span-2">
          <Button type="button">Enregistrer le foyer</Button>
        </div>
      </form>
    </Card>
  );
}
