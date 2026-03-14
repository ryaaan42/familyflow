"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryLabels, useFamilyFlowStore } from "@familyflow/shared";
import type { Task } from "@familyflow/shared";

const weekDays = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" }
] as const;

const categoryValues = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

const baseTemplates = [
  { title: "Passer l'aspirateur", category: "menage" },
  { title: "Préparer le repas", category: "cuisine" },
  { title: "Faire la vaisselle", category: "cuisine" },
  { title: "Lancer une lessive", category: "routine" },
  { title: "Faire les courses", category: "courses" },
  { title: "Ranger les chambres", category: "enfants" },
  { title: "Routine bébé", category: "enfants" },
  { title: "Nourrir les animaux", category: "animaux" },
  { title: "Administratif famille", category: "administratif" },
  { title: "Vérifier le budget", category: "budget" },
  { title: "Routine matin", category: "routine" },
  { title: "Routine soir", category: "routine" }
] as const;

type Draft = {
  title: string;
  category: Task["category"];
  assignedMemberId: string | null;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  status: Task["status"];
  description: string;
};

const weekdayFromDate = (dateLike: string) => {
  const date = new Date(dateLike);
  const day = date.getDay();
  return (day === 0 ? 7 : day) as Draft["dayOfWeek"];
};

export function TasksWeeklyBoard() {
  const state = useFamilyFlowStore();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        state.tasks.map((task) => [
          task.id,
          {
            title: task.title,
            category: task.category,
            assignedMemberId: task.assignedMemberId ?? null,
            dayOfWeek: (task.dayOfWeek ?? weekdayFromDate(task.dueDate)) as Draft["dayOfWeek"],
            status: task.status,
            description: task.description ?? ""
          }
        ])
      )
    );
  }, [state.tasks]);

  const hasPendingChanges = useMemo(
    () =>
      state.tasks.some((task) => {
        const draft = drafts[task.id];
        if (!draft) return false;
        return (
          draft.title !== task.title ||
          draft.category !== task.category ||
          draft.assignedMemberId !== (task.assignedMemberId ?? null) ||
          draft.dayOfWeek !== (task.dayOfWeek ?? weekdayFromDate(task.dueDate)) ||
          draft.status !== task.status ||
          draft.description !== (task.description ?? "")
        );
      }),
    [drafts, state.tasks]
  );

  const refreshFrom = async (response: Response) => {
    const payload = await response.json();
    if (Array.isArray(payload.tasks)) {
      useFamilyFlowStore.setState({ tasks: payload.tasks });
    } else if (Array.isArray(payload)) {
      useFamilyFlowStore.setState({ tasks: payload });
    }
  };

  const patchDraft = (taskId: string, patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [taskId]: { ...prev[taskId], ...patch } }));
    setSaveMessage(null);
    setSaveError(null);
  };

  const addTask = async (dayOfWeek: Draft["dayOfWeek"], template?: (typeof baseTemplates)[number]) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: template?.title ?? "Nouvelle tâche",
        category: template?.category ?? "routine",
        frequency: "hebdomadaire",
        estimatedMinutes: 20,
        dayOfWeek
      })
    });
    if (!response.ok) {
      setSaveError("Impossible d'ajouter la tâche.");
      return;
    }
    await refreshFrom(response);
  };

  const deleteTask = async (taskId: string) => {
    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!response.ok) {
      setSaveError("Impossible de supprimer la tâche.");
      return;
    }
    await refreshFrom(response);
  };

  const savePlanning = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);
    const response = await fetch("/api/tasks/bulk-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: Object.entries(drafts).map(([taskId, draft]) => ({ taskId, ...draft }))
      })
    });
    setSaving(false);
    if (!response.ok) {
      setSaveError("Erreur lors de l'enregistrement.");
      return;
    }
    await refreshFrom(response);
    setSaveMessage("Planning enregistré.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-[#d9e6ff] bg-white px-4 py-2">
        <p className="text-sm text-[var(--foreground-muted)]">Planning hebdomadaire par jour</p>
        <button type="button" onClick={savePlanning} disabled={!hasPendingChanges || saving} className="rounded-xl bg-[var(--brand-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
      {saveMessage ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveMessage}</p> : null}
      {saveError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {weekDays.map((day) => {
          const dayTasks = state.tasks.filter((task) => (drafts[task.id]?.dayOfWeek ?? weekdayFromDate(task.dueDate)) === day.value);
          return (
            <div key={day.value} className="rounded-2xl border border-[#d9e6ff] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">{day.label}</h3>
                <div className="flex gap-2">
                  <select className="rounded-lg border px-2 py-1 text-xs" onChange={(e) => {
                    const selected = baseTemplates.find((t) => t.title === e.target.value);
                    if (selected) void addTask(day.value, selected);
                    e.currentTarget.selectedIndex = 0;
                  }}>
                    <option>+ Tâche de base</option>
                    {baseTemplates.map((template) => <option key={`${day.value}-${template.title}`} value={template.title}>{template.title}</option>)}
                  </select>
                  <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => addTask(day.value)}>+ Ajouter</button>
                </div>
              </div>

              <div className="space-y-2">
                {dayTasks.length === 0 ? <p className="text-sm text-[var(--foreground-muted)]">Aucune tâche.</p> : null}
                {dayTasks.map((task) => {
                  const draft = drafts[task.id];
                  if (!draft) return null;
                  return (
                    <div key={task.id} className="rounded-xl border p-3">
                      <div className="grid gap-2 md:grid-cols-2">
                        <input className="rounded-lg border px-2 py-1 text-sm" value={draft.title} onChange={(e) => patchDraft(task.id, { title: e.target.value })} />
                        <select className="rounded-lg border px-2 py-1 text-sm" value={draft.category} onChange={(e) => patchDraft(task.id, { category: e.target.value as Task["category"] })}>
                          {categoryValues.map((cat) => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
                        </select>
                        <select className="rounded-lg border px-2 py-1 text-sm" value={draft.assignedMemberId ?? ""} onChange={(e) => patchDraft(task.id, { assignedMemberId: e.target.value || null })}>
                          <option value="">Non assigné</option>
                          {state.profile.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                        </select>
                        <select className="rounded-lg border px-2 py-1 text-sm" value={draft.dayOfWeek} onChange={(e) => patchDraft(task.id, { dayOfWeek: Number(e.target.value) as Draft["dayOfWeek"] })}>
                          {weekDays.map((d) => <option key={`${task.id}-${d.value}`} value={d.value}>{d.label}</option>)}
                        </select>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.status === "done"} onChange={(e) => patchDraft(task.id, { status: e.target.checked ? "done" : "todo" })} /> Terminé</label>
                        <button className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700" onClick={() => deleteTask(task.id)}>Supprimer</button>
                        <input className="rounded-lg border px-2 py-1 text-sm md:col-span-2" placeholder="Note / moment de la journée" value={draft.description} onChange={(e) => patchDraft(task.id, { description: e.target.value })} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
