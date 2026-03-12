"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { HouseholdMember } from "@familyflow/shared";

import { addHouseholdMember, updateHouseholdMember, deleteHouseholdMember } from "@/lib/supabase/household-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const ROLE_LABELS: Record<string, string> = {
  parent: "Parent",
  adulte: "Adulte",
  ado: "Adolescent",
  enfant: "Enfant",
  autre: "Autre"
};

const memberSchema = z.object({
  displayName: z.string().min(2, "Minimum 2 caractères"),
  age: z.coerce.number().min(0).max(120),
  role: z.enum(["parent", "adulte", "ado", "enfant", "autre"]),
  avatarColor: z.string()
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberFormProps {
  householdId: string;
  member?: HouseholdMember;
  onClose: () => void;
}

function MemberForm({ householdId, member, onClose }: MemberFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addMember = useFamilyFlowStore((s) => s.addMember);
  const updateMember = useFamilyFlowStore((s) => s.updateMember);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      displayName: member?.name ?? "",
      age: member?.age ?? 25,
      role: member?.role ?? "adulte",
      avatarColor: member?.avatarColor ?? AVATAR_COLORS[0]
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);

    if (member) {
      const { error: err } = await updateHouseholdMember(member.id, {
        displayName: values.displayName,
        age: values.age,
        role: values.role,
        avatarColor: values.avatarColor
      });
      if (err) {
        setError(err);
        setSubmitting(false);
        return;
      }
      updateMember(member.id, {
        name: values.displayName,
        age: values.age,
        role: values.role,
        avatarColor: values.avatarColor
      });
    } else {
      const { memberId, error: err } = await addHouseholdMember(householdId, {
        displayName: values.displayName,
        age: values.age,
        role: values.role,
        avatarColor: values.avatarColor
      });
      if (err || !memberId) {
        setError(err ?? "Erreur inconnue");
        setSubmitting(false);
        return;
      }
      addMember({
        id: memberId,
        householdId,
        name: values.displayName,
        age: values.age,
        role: values.role,
        avatarColor: values.avatarColor,
        availabilityHoursPerWeek: 10,
        favoriteCategories: [],
        blockedCategories: []
      });
    }

    setSubmitting(false);
    onClose();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {member ? "Modifier le membre" : "Ajouter un membre"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--border)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <Label>Prénom *</Label>
        <Input {...form.register("displayName")} placeholder="Prénom" />
        {form.formState.errors.displayName && (
          <p className="text-xs text-rose-600">{form.formState.errors.displayName.message}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Âge *</Label>
          <Input type="number" min={0} max={120} {...form.register("age")} />
        </div>
        <div className="space-y-1.5">
          <Label>Rôle *</Label>
          <select
            className="flex h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm"
            {...form.register("role")}
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Couleur d'avatar</Label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => form.setValue("avatarColor", color)}
              className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: form.watch("avatarColor") === color ? "#111" : "transparent"
              }}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? "Enregistrement..." : member ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}

interface DeleteConfirmProps {
  member: HouseholdMember;
  onClose: () => void;
}

function DeleteConfirm({ member, onClose }: DeleteConfirmProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const removeMember = useFamilyFlowStore((s) => s.removeMember);

  const handleDelete = async () => {
    setSubmitting(true);
    const { error: err } = await deleteHouseholdMember(member.id);
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }
    removeMember(member.id);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Supprimer le membre</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--border)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm text-[var(--foreground-muted)]">
        Êtes-vous sûr de vouloir supprimer <strong>{member.name}</strong> du foyer ?
        Cette action est irréversible.
      </p>
      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Annuler
        </Button>
        <Button
          onClick={handleDelete}
          disabled={submitting}
          className="flex-1 bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
        >
          {submitting ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

type DialogMode = { type: "add" } | { type: "edit"; member: HouseholdMember } | { type: "delete"; member: HouseholdMember } | null;

interface MemberManagerProps {
  householdId: string;
}

export function MemberManager({ householdId }: MemberManagerProps) {
  const members = useFamilyFlowStore((s) => s.profile.members);
  const [dialog, setDialog] = useState<DialogMode>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Membres du foyer</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            {members.length} {members.length === 1 ? "membre" : "membres"}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setDialog({ type: "add" })}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border)] py-10 text-center">
          <p className="text-[var(--foreground-muted)] text-sm">Aucun membre pour l'instant.</p>
          <button
            type="button"
            onClick={() => setDialog({ type: "add" })}
            className="mt-3 text-sm font-semibold text-[#6D5EF4] hover:underline"
          >
            Ajouter le premier membre
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {members.map((member) => (
            <div key={member.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: member.avatarColor }}
                  />
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {ROLE_LABELS[member.role] ?? member.role}, {member.age} ans
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDialog({ type: "edit", member })}
                    className="rounded-xl p-2 text-[var(--foreground-muted)] hover:bg-[var(--border)] hover:text-[#6D5EF4]"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialog({ type: "delete", member })}
                    className="rounded-xl p-2 text-[var(--foreground-muted)] hover:bg-rose-50 hover:text-rose-600"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog overlay */}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDialog(null);
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-6 shadow-2xl">
            {dialog.type === "add" && (
              <MemberForm
                householdId={householdId}
                onClose={() => setDialog(null)}
              />
            )}
            {dialog.type === "edit" && (
              <MemberForm
                householdId={householdId}
                member={dialog.member}
                onClose={() => setDialog(null)}
              />
            )}
            {dialog.type === "delete" && (
              <DeleteConfirm
                member={dialog.member}
                onClose={() => setDialog(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
