"use client";

import { useState } from "react";
import type { Pet } from "@familyflow/shared";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Cat, Dog, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const PET_LABELS: Record<Pet["type"], string> = {
  chat: "Chat",
  chien: "Chien",
  autre: "Autre"
};

type DialogMode = { type: "add" } | { type: "edit"; pet: Pet } | { type: "delete"; pet: Pet } | null;

function PetForm({
  pet,
  onClose
}: {
  pet?: Pet;
  onClose: () => void;
}) {
  const householdId = useFamilyFlowStore((s) => s.profile.household.id);
  const [name, setName] = useState(pet?.name ?? "");
  const [type, setType] = useState<Pet["type"]>(pet?.type ?? "chat");
  const [notes, setNotes] = useState(pet?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    setSubmitting(true);
    setError(null);

    const payload = { householdId, name, type, notes };
    const response = await fetch(pet ? `/api/pets/${pet.id}` : "/api/pets", {
      method: pet ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (!response.ok) {
      setError("Impossible d'enregistrer l'animal.");
      return;
    }

    const nextPets = (await response.json()) as Pet[];
    useFamilyFlowStore.setState((state) => ({
      profile: {
        ...state.profile,
        household: {
          ...state.profile.household,
          hasPets: nextPets.length > 0
        },
        pets: nextPets
      }
    }));
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{pet ? "Modifier l'animal" : "Ajouter un animal"}</h4>
        <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] p-1.5">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Simba"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Type</label>
          <select
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            value={type}
            onChange={(event) => setType(event.target.value as Pet["type"])}
          >
            <option value="chat">Chat</option>
            <option value="chien">Chien</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Notes (optionnel)</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </div>

      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={save} disabled={submitting || name.trim().length < 2}>
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

function DeletePetDialog({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/pets/${pet.id}`, { method: "DELETE" });
    setSubmitting(false);

    if (!response.ok) {
      setError("Suppression impossible.");
      return;
    }

    const nextPets = (await response.json()) as Pet[];
    useFamilyFlowStore.setState((state) => ({
      profile: {
        ...state.profile,
        household: {
          ...state.profile.household,
          hasPets: nextPets.length > 0
        },
        pets: nextPets
      }
    }));
    onClose();
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Supprimer {pet.name} ?</h4>
      <p className="text-sm text-[var(--foreground-muted)]">Cette action est irréversible.</p>
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={remove} disabled={submitting} className="bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600">
          {submitting ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

export function PetManager() {
  const pets = useFamilyFlowStore((s) => s.profile.pets);
  const [dialog, setDialog] = useState<DialogMode>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Animaux du foyer</h3>
          <p className="text-sm text-[var(--foreground-muted)]">Ajoutez, modifiez ou supprimez vos animaux à tout moment.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setDialog({ type: "add" })}>
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {pets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
          Aucun animal ajouté.
        </div>
      ) : (
        <div className="grid gap-3">
          {pets.map((pet) => (
            <article key={pet.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-[rgba(109,94,244,0.12)] p-2.5 text-[var(--brand-primary)]">
                    {pet.type === "chien" ? <Dog className="h-4 w-4" /> : pet.type === "chat" ? <Cat className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="font-semibold">{pet.name}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{PET_LABELS[pet.type]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDialog({ type: "edit", pet })}
                    className="rounded-xl p-2 text-[var(--foreground-muted)] hover:bg-[var(--border)] hover:text-[var(--brand-primary)]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialog({ type: "delete", pet })}
                    className="rounded-xl p-2 text-[var(--foreground-muted)] hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {pet.notes ? <p className="mt-2 text-sm text-[var(--foreground-muted)]">{pet.notes}</p> : null}
            </article>
          ))}
        </div>
      )}

      {dialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-6 shadow-2xl">
            {dialog.type === "add" ? <PetForm onClose={() => setDialog(null)} /> : null}
            {dialog.type === "edit" ? <PetForm pet={dialog.pet} onClose={() => setDialog(null)} /> : null}
            {dialog.type === "delete" ? <DeletePetDialog pet={dialog.pet} onClose={() => setDialog(null)} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
