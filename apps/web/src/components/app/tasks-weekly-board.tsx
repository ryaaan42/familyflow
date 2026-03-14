"use client";

import { useMemo, useState } from "react";
import { categoryLabels, useFamilyFlowStore } from "@familyflow/shared";
import type { Task } from "@familyflow/shared";
import {
  Baby,
  CheckCircle2,
  Circle,
  FileText,
  Home,
  Pencil,
  Plus,
  ShoppingCart,
  ShowerHead,
  Sparkles,
  Trash2,
  Utensils,
  Wallet,
  Wrench,
  X,
  type LucideIcon
} from "lucide-react";

import { getTaskTemplatesForPets } from "@/lib/task-library";

const categoryValues = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

const statusColumns: Array<{ value: Task["status"]; label: string; description: string }> = [
  { value: "todo", label: "À faire", description: "Tâches à démarrer" },
  { value: "in_progress", label: "En cours", description: "Tâches en traitement" },
  { value: "done", label: "Terminé", description: "Tâches validées" },
  { value: "late", label: "En retard", description: "À rattraper" }
];

const weekdays = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" }
];

type TaskEditorMode = { type: "create" } | { type: "edit"; task: Task } | null;

type TaskFormState = {
  title: string;
  category: Task["category"];
  assignedMemberId: string | null;
  dayOfWeek: number;
  status: Task["status"];
  description: string;
  templateTitle: string;
};

const weekdayFromDate = (dateLike: string) => {
  const date = new Date(dateLike);
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

const currentDayOfWeek = () => ((new Date().getDay() + 6) % 7) + 1;

const createDefaultForm = (): TaskFormState => ({
  title: "",
  category: "routine",
  assignedMemberId: null,
  dayOfWeek: currentDayOfWeek(),
  status: "todo",
  description: "",
  templateTitle: ""
});

const titleIncludes = (title: string, values: string[]) => {
  const normalized = title.toLowerCase();
  return values.some((value) => normalized.includes(value));
};

const resolveTaskIcon = (task: Task): LucideIcon => {
  if (titleIncludes(task.title, ["aspir", "vacuum", "ménage"])) return Sparkles;
  if (titleIncludes(task.title, ["course", "courses", "shopping"])) return ShoppingCart;
  if (titleIncludes(task.title, ["repas", "cuisine", "vaisselle", "déjeuner", "dîner"])) return Utensils;
  if (titleIncludes(task.title, ["douche", "toilette", "hygiène", "lessive"])) return ShowerHead;
  if (titleIncludes(task.title, ["papier", "admin", "facture", "document"])) return FileText;
  if (titleIncludes(task.title, ["bricol", "répar", "jardin", "entretien"])) return Wrench;
  if (titleIncludes(task.title, ["bébé", "enfant", "devoir", "école"])) return Baby;

  switch (task.category) {
    case "courses":
      return ShoppingCart;
    case "cuisine":
      return Utensils;
    case "hygiene":
      return ShowerHead;
    case "administratif":
      return FileText;
    case "budget":
      return Wallet;
    case "entretien":
      return Wrench;
    case "enfants":
      return Baby;
    case "menage":
      return Sparkles;
    default:
      return Home;
  }
};

export function TasksWeeklyBoard() {
  const state = useFamilyFlowStore();
  const [editor, setEditor] = useState<TaskEditorMode>(null);
  const [form, setForm] = useState<TaskFormState>(createDefaultForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyTaskIds, setBusyTaskIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const quickTemplates = useMemo(() => getTaskTemplatesForPets(state.profile.pets), [state.profile.pets]);

  const openCreateModal = () => {
    setFeedback(null);
    setForm(createDefaultForm());
    setEditor({ type: "create" });
  };

  const openEditModal = (task: Task) => {
    setFeedback(null);
    setForm({
      title: task.title,
      category: task.category,
      assignedMemberId: task.assignedMemberId ?? null,
      dayOfWeek: task.dayOfWeek ?? weekdayFromDate(task.dueDate),
      status: task.status,
      description: task.description ?? "",
      templateTitle: ""
    });
    setEditor({ type: "edit", task });
  };

  const refreshFrom = async (response: Response) => {
    const payload = await response.json();
    if (Array.isArray(payload.tasks)) {
      useFamilyFlowStore.setState({ tasks: payload.tasks });
    } else if (Array.isArray(payload)) {
      useFamilyFlowStore.setState({ tasks: payload });
    }
  };

  const withBusyTask = async (taskId: string, action: () => Promise<void>) => {
    setBusyTaskIds((prev) => [...prev, taskId]);
    try {
      await action();
    } finally {
      setBusyTaskIds((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const persistTask = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      title: form.title.trim() || "Nouvelle tâche",
      description: form.description.trim() || undefined,
      category: form.category,
      frequency: "hebdomadaire",
      estimatedMinutes: 20,
      assignedMemberId: form.assignedMemberId ?? undefined,
      dayOfWeek: form.dayOfWeek,
      status: form.status
    };

    const response =
      editor?.type === "edit"
        ? await fetch(`/api/tasks/${editor.task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
        : await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

    setIsSubmitting(false);

    if (!response.ok) {
      setFeedback({ type: "error", message: "Impossible d'enregistrer la tâche." });
      return;
    }

    await refreshFrom(response);
    setEditor(null);
    setFeedback({ type: "success", message: editor?.type === "edit" ? "Tâche modifiée." : "Tâche ajoutée." });
  };

  const deleteTask = async (taskId: string) => {
    await withBusyTask(taskId, async () => {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!response.ok) {
        setFeedback({ type: "error", message: "Suppression impossible." });
        return;
      }
      await refreshFrom(response);
      setFeedback({ type: "success", message: "Tâche supprimée." });
    });
  };

  const toggleStatus = async (task: Task) => {
    await withBusyTask(task.id, async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: task.status === "done" ? "todo" : "done",
          dayOfWeek: task.dayOfWeek ?? weekdayFromDate(task.dueDate),
          assignedMemberId: task.assignedMemberId ?? null
        })
      });

      if (!response.ok) {
        setFeedback({ type: "error", message: "Mise à jour du statut impossible." });
        return;
      }
      await refreshFrom(response);
    });
  };

  const moveTaskToDay = async (task: Task, dayOfWeek: number) => {
    if ((task.dayOfWeek ?? weekdayFromDate(task.dueDate)) === dayOfWeek) return;
    await withBusyTask(task.id, async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: task.status,
          dayOfWeek,
          assignedMemberId: task.assignedMemberId ?? null
        })
      });

      if (!response.ok) {
        setFeedback({ type: "error", message: "Déplacement impossible." });
        return;
      }
      await refreshFrom(response);
      setFeedback({ type: "success", message: "Tâche déplacée." });
    });
  };

  const changeAssignee = async (task: Task, memberId: string) => {
    await withBusyTask(task.id, async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedMemberId: memberId || null,
          dayOfWeek: task.dayOfWeek ?? weekdayFromDate(task.dueDate),
          status: task.status
        })
      });

      if (!response.ok) {
        setFeedback({ type: "error", message: "Assignation impossible." });
        return;
      }
      await refreshFrom(response);
    });
  };

  return (
    <div className="space-y-4">
      {feedback ? (
        <p
          className={`rounded-xl px-3 py-2 text-sm ${
            feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-xl bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-white"
          onClick={openCreateModal}
        >
          <Plus className="h-3.5 w-3.5" /> Ajouter une tâche
        </button>
      </div>

      <div className="space-y-3">
        {weekdays.map((day) => {
          const dayTasks = state.tasks.filter((task) => (task.dayOfWeek ?? weekdayFromDate(task.dueDate)) === day.value);

          return (
            <section
              key={day.value}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/task-id");
                const task = state.tasks.find((t) => t.id === taskId);
                if (task) void moveTaskToDay(task, day.value);
                setDraggingTaskId(null);
              }}
              className="w-full rounded-3xl border border-[#d8e5ff] bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4 shadow-[0_10px_24px_rgba(31,66,135,0.08)]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">{day.label}</h3>
                <p className="text-xs text-[var(--foreground-muted)]">{dayTasks.length} tâche(s)</p>
              </div>

              <div className="space-y-2">
                {dayTasks.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-[#d5def2] px-3 py-5 text-center text-sm text-[var(--foreground-muted)]">
                    Glissez une tâche ici pour {day.label.toLowerCase()}.
                  </p>
                ) : null}

                {dayTasks.map((task) => {
                  const memberName =
                    state.profile.members.find((member) => member.id === task.assignedMemberId)?.name ?? "Non assigné";
                  const isBusy = busyTaskIds.includes(task.id);
                  const Icon = resolveTaskIcon(task);

                  return (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/task-id", task.id);
                        setDraggingTaskId(task.id);
                      }}
                      onDragEnd={() => setDraggingTaskId(null)}
                      className={`rounded-2xl border border-[#e5ecfa] bg-white px-3 py-2.5 ${
                        draggingTaskId === task.id ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" />
                        <button
                          type="button"
                          className="rounded-full p-1 text-[var(--brand-primary)]"
                          onClick={() => toggleStatus(task)}
                          disabled={isBusy}
                          title="Terminé / non terminé"
                        >
                          {task.status === "done" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4 text-[var(--foreground-muted)]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium ${
                              task.status === "done" ? "text-[var(--foreground-muted)] line-through" : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--foreground-muted)]">
                            <span className="rounded-full bg-[#edf3ff] px-2 py-0.5">{categoryLabels[task.category]}</span>
                            <span className="rounded-full bg-[#f2f4f8] px-2 py-0.5">
                              {statusColumns.find((column) => column.value === task.status)?.label}
                            </span>
                            <span>{memberName}</span>
                          </div>
                        </div>

                        <select
                          className="rounded-lg border border-[#d8e5ff] bg-white px-2 py-1 text-[11px]"
                          value={task.assignedMemberId ?? ""}
                          onChange={(event) => changeAssignee(task, event.target.value)}
                          disabled={isBusy}
                        >
                          <option value="">Non assigné</option>
                          {state.profile.members.map((member) => (
                            <option key={`${task.id}-${member.id}`} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="rounded-lg border border-[#d8e5ff] p-1.5 text-[var(--foreground-muted)] hover:text-[var(--brand-primary)]"
                          onClick={() => openEditModal(task)}
                          title="Modifier"
                          disabled={isBusy}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-rose-200 p-1.5 text-rose-600"
                          onClick={() => deleteTask(task.id)}
                          title="Supprimer"
                          disabled={isBusy}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {editor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 pb-3 pt-10 backdrop-blur-sm md:items-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setEditor(null);
          }}
        >
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold">
                  {editor.type === "edit" ? "Modifier la tâche" : "Ajouter une tâche"}
                </h4>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Vue en cartes glissables avec icônes automatiques selon la tâche.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="rounded-lg border border-[#d8e5ff] p-1.5 text-[var(--foreground-muted)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {editor.type === "create" ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tâche suggérée (optionnel)</label>
                  <select
                    className="w-full rounded-xl border border-[#d8e5ff] px-3 py-2 text-sm"
                    value={form.templateTitle}
                    onChange={(event) => {
                      const selected = quickTemplates.find((template) => template.title === event.target.value);
                      setForm((prev) => ({
                        ...prev,
                        templateTitle: event.target.value,
                        title: selected?.title ?? prev.title,
                        category: selected?.category ?? prev.category,
                        description: selected?.description ?? prev.description
                      }));
                    }}
                  >
                    <option value="">Sélectionner une base rapide</option>
                    {quickTemplates.map((template) => (
                      <option key={template.title} value={template.title}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium">Nom de la tâche</label>
                  <input
                    className="w-full rounded-xl border border-[#d8e5ff] px-3 py-2 text-sm"
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Ex: Passer l'aspirateur"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Catégorie</label>
                  <select
                    className="w-full rounded-xl border border-[#d8e5ff] px-3 py-2 text-sm"
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, category: event.target.value as Task["category"] }))
                    }
                  >
                    {categoryValues.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Assigné à</label>
                  <select
                    className="w-full rounded-xl border border-[#d8e5ff] px-3 py-2 text-sm"
                    value={form.assignedMemberId ?? ""}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, assignedMemberId: event.target.value || null }))
                    }
                  >
                    <option value="">Non assigné</option>
                    {state.profile.members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Statut</label>
                  <select
                    className="w-full rounded-xl border border-[#d8e5ff] px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, status: event.target.value as Task["status"] }))
                    }
                  >
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="done">Terminé</option>
                    <option value="late">En retard</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium">Détails (optionnel)</label>
                  <textarea
                    className="w-full rounded-xl border border-[#d8e5ff] px-3 py-2 text-sm"
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="rounded-xl border border-[#d8e5ff] px-4 py-2 text-sm"
                  onClick={() => setEditor(null)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  onClick={persistTask}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
