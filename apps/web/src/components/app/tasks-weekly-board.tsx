"use client";

import { useMemo, useState } from "react";
import { categoryLabels, useFamilyFlowStore } from "@familyflow/shared";
import type { Task } from "@familyflow/shared";
import {
  Baby,
  CheckCircle2,
  Circle,
  FileText,
  GripVertical,
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

const categoryColors: Record<string, string> = {
  menage: "#6D5EF4",
  cuisine: "#FF7E6B",
  animaux: "#56C7A1",
  enfants: "#FFBF5A",
  administratif: "#468BFF",
  budget: "#4AB5A4",
  courses: "#FF8DB2",
  hygiene: "#A07BFF",
  entretien: "#3AB0FF",
  routine: "#7AC74F"
};

const statusColumns: Array<{ value: Task["status"]; label: string }> = [
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminé" },
  { value: "late", label: "En retard" }
];

const weekdays = [
  { value: 1, label: "Lun", full: "Lundi" },
  { value: 2, label: "Mar", full: "Mardi" },
  { value: 3, label: "Mer", full: "Mercredi" },
  { value: 4, label: "Jeu", full: "Jeudi" },
  { value: 5, label: "Ven", full: "Vendredi" },
  { value: 6, label: "Sam", full: "Samedi" },
  { value: 7, label: "Dim", full: "Dimanche" }
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
    case "courses": return ShoppingCart;
    case "cuisine": return Utensils;
    case "hygiene": return ShowerHead;
    case "administratif": return FileText;
    case "budget": return Wallet;
    case "entretien": return Wrench;
    case "enfants": return Baby;
    case "menage": return Sparkles;
    default: return Home;
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
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const quickTemplates = useMemo(() => getTaskTemplatesForPets(state.profile.pets), [state.profile.pets]);
  const todayDow = currentDayOfWeek();

  const openCreateModal = (dayOfWeek?: number) => {
    setFeedback(null);
    setForm({ ...createDefaultForm(), dayOfWeek: dayOfWeek ?? currentDayOfWeek() });
    setEditor({ type: "create" });
  };

  const openEditModal = (task: Task) => {
    setFeedback(null);
    setForm({
      title: task.title,
      category: task.category,
      assignedMemberId: task.assignedMemberId ?? null,
      dayOfWeek: task.dayOfWeek ?? currentDayOfWeek(),
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
          dayOfWeek: task.dayOfWeek ?? currentDayOfWeek(),
          ...(task.assignedMemberId ? { assignedMemberId: task.assignedMemberId } : {})
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
    if (task.dayOfWeek === dayOfWeek) return;
    await withBusyTask(task.id, async () => {
      const body: Record<string, unknown> = { status: task.status, dayOfWeek };
      if (task.assignedMemberId) body.assignedMemberId = task.assignedMemberId;

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
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
          dayOfWeek: task.dayOfWeek ?? currentDayOfWeek(),
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

  const totalTasks = state.tasks.length;
  const doneTasks = state.tasks.filter((t) => t.status === "done").length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-[var(--foreground-muted)]">
              <span className="font-semibold text-[var(--foreground)]">{doneTasks}</span> / {totalTasks} tâches complétées
            </p>
            <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-[#edf0f7]">
              <div
                className="h-full rounded-full bg-[#6D5EF4] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-[#6D5EF4] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(109,94,244,0.35)] transition hover:bg-[#5b4ee0] active:scale-95"
          onClick={() => openCreateModal()}
        >
          <Plus className="h-4 w-4" /> Ajouter une tâche
        </button>
      </div>

      {feedback ? (
        <div
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${feedback.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
          {feedback.message}
          <button
            type="button"
            className="ml-auto opacity-60 hover:opacity-100"
            onClick={() => setFeedback(null)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* Weekly columns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {weekdays.map((day) => {
          const dayTasks = state.tasks.filter((task) => task.dayOfWeek === day.value);
          const isToday = day.value === todayDow;
          const isDragOver = dragOverDay === day.value;

          return (
            <section
              key={day.value}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverDay(day.value);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setDragOverDay(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragOverDay(null);
                const taskId = event.dataTransfer.getData("text/plain");
                const task = state.tasks.find((t) => t.id === taskId);
                if (task) void moveTaskToDay(task, day.value);
                setDraggingTaskId(null);
              }}
              className={`flex flex-col rounded-3xl border transition-all duration-200 ${
                isDragOver
                  ? "border-[#6D5EF4] bg-[rgba(109,94,244,0.06)] shadow-[0_0_0_2px_rgba(109,94,244,0.18)]"
                  : isToday
                  ? "border-[#6D5EF4]/30 bg-[linear-gradient(180deg,#fdfcff,#f5f3ff)]"
                  : "border-[#e4ebf5] bg-[linear-gradient(180deg,#ffffff,#f8fbff)]"
              } shadow-[0_2px_12px_rgba(31,66,135,0.06)]`}
            >
              {/* Day header */}
              <div
                className={`flex items-center justify-between rounded-t-3xl px-3 py-2.5 ${
                  isToday ? "bg-[#6D5EF4]" : "bg-transparent"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isToday ? "text-white" : "text-[var(--foreground-muted)]"
                    }`}
                  >
                    {day.label}
                  </span>
                  {dayTasks.length > 0 && (
                    <span
                      className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        isToday ? "bg-white/25 text-white" : "bg-[#6D5EF4]/10 text-[#6D5EF4]"
                      }`}
                    >
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openCreateModal(day.value)}
                  className={`flex h-5 w-5 items-center justify-center rounded-full transition hover:scale-110 ${
                    isToday ? "bg-white/20 text-white hover:bg-white/30" : "bg-[#6D5EF4]/10 text-[#6D5EF4] hover:bg-[#6D5EF4]/20"
                  }`}
                  title={`Ajouter pour ${day.full}`}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex flex-1 flex-col gap-2 p-2">
                {dayTasks.length === 0 ? (
                  <div
                    className={`flex flex-1 items-center justify-center rounded-2xl border border-dashed py-6 text-center text-xs transition-colors ${
                      isDragOver
                        ? "border-[#6D5EF4] bg-[rgba(109,94,244,0.04)] text-[#6D5EF4]"
                        : "border-[#dce4f0] text-[var(--foreground-muted)]"
                    }`}
                  >
                    {isDragOver ? "Déposer ici" : "Aucune tâche"}
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const memberName = state.profile.members.find((m) => m.id === task.assignedMemberId)?.name;
                    const isBusy = busyTaskIds.includes(task.id);
                    const isDraggingThis = draggingTaskId === task.id;
                    const Icon = resolveTaskIcon(task);
                    const catColor = categoryColors[task.category] ?? "#6D5EF4";
                    const isDone = task.status === "done";

                    return (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", task.id);
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingTaskId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggingTaskId(null);
                          setDragOverDay(null);
                        }}
                        className={`group relative rounded-2xl bg-white p-2.5 shadow-[0_1px_4px_rgba(31,66,135,0.08)] ring-1 ring-[#e8eef8] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(109,94,244,0.15)] hover:ring-[#6D5EF4]/30 ${
                          isDraggingThis ? "opacity-40 scale-95" : ""
                        } ${isBusy ? "opacity-60" : ""}`}
                      >
                        {/* Color accent */}
                        <div
                          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                          style={{ backgroundColor: catColor }}
                        />

                        <div className="flex items-start gap-1.5 pl-2">
                          {/* Drag handle */}
                          <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-[var(--foreground-muted)] opacity-0 group-hover:opacity-60 active:cursor-grabbing" />

                          {/* Status toggle */}
                          <button
                            type="button"
                            className={`mt-0.5 shrink-0 transition-colors ${isDone ? "text-emerald-500" : "text-[#c0ccde] hover:text-[#6D5EF4]"}`}
                            onClick={() => toggleStatus(task)}
                            disabled={isBusy}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Circle className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-1">
                              <Icon className="mt-0.5 h-3 w-3 shrink-0" style={{ color: catColor }} />
                              <p
                                className={`text-xs font-medium leading-snug ${
                                  isDone ? "text-[var(--foreground-muted)] line-through" : "text-[var(--foreground)]"
                                }`}
                              >
                                {task.title}
                              </p>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <span
                                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                                style={{ backgroundColor: `${catColor}18`, color: catColor }}
                              >
                                {categoryLabels[task.category]}
                              </span>
                              {memberName && (
                                <span className="rounded-md bg-[#f0f4ff] px-1.5 py-0.5 text-[10px] text-[#6D5EF4]">
                                  {memberName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions (hover) */}
                        <div className="mt-2 flex items-center justify-between gap-1 border-t border-[#f0f4f8] pt-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <select
                            className="flex-1 rounded-lg border border-[#e8eef8] bg-[#fafcff] px-1.5 py-0.5 text-[10px] text-[var(--foreground-muted)] focus:border-[#6D5EF4] focus:outline-none"
                            value={task.assignedMemberId ?? ""}
                            onChange={(e) => changeAssignee(task, e.target.value)}
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
                            className="rounded-lg p-1 text-[#a0aec0] hover:bg-[#f0f4ff] hover:text-[#6D5EF4]"
                            onClick={() => openEditModal(task)}
                            disabled={isBusy}
                            title="Modifier"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-1 text-[#a0aec0] hover:bg-rose-50 hover:text-rose-500"
                            onClick={() => deleteTask(task.id)}
                            disabled={isBusy}
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Create/Edit modal */}
      {editor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 pt-10 backdrop-blur-md md:items-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) setEditor(null);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_rgba(17,24,39,0.22)] ring-1 ring-black/5">
            {/* Modal header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#6D5EF4] to-[#8B7BFF] px-6 py-4">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {editor.type === "edit" ? "Modifier la tâche" : "Nouvelle tâche"}
                </h4>
                <p className="mt-0.5 text-xs text-white/70">
                  {editor.type === "edit" ? "Modifiez les champs souhaités" : "Ajoutez une tâche à votre planning"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Template picker */}
              {editor.type === "create" && quickTemplates.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--foreground-muted)]">Modèle rapide</p>
                  <select
                    className="w-full rounded-2xl border border-[#ede9fe] bg-[#faf8ff] px-3.5 py-2.5 text-sm text-[var(--foreground)] focus:border-[#6D5EF4] focus:outline-none focus:ring-2 focus:ring-[#6D5EF4]/12"
                    value={form.templateTitle}
                    onChange={(event) => {
                      const selected = quickTemplates.find((t) => t.title === event.target.value);
                      setForm((prev) => ({
                        ...prev,
                        templateTitle: event.target.value,
                        title: selected?.title ?? prev.title,
                        category: selected?.category ?? prev.category,
                        description: selected?.description ?? prev.description
                      }));
                    }}
                  >
                    <option value="">Sélectionner un modèle…</option>
                    {quickTemplates.map((template) => (
                      <option key={template.title} value={template.title}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Task name */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--foreground-muted)]">Nom de la tâche</p>
                <input
                  className="w-full rounded-2xl border border-[#e8e4f8] bg-[#fdfcff] px-4 py-3 text-sm font-medium text-[var(--foreground)] placeholder-[#c4bde8] transition focus:border-[#6D5EF4] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#6D5EF4]/10"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ex : Passer l'aspirateur"
                  autoFocus
                />
              </div>

              {/* Day chips */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--foreground-muted)]">Jour</p>
                <div className="flex flex-wrap gap-1.5">
                  {weekdays.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, dayOfWeek: d.value }))}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        form.dayOfWeek === d.value
                          ? "bg-[#6D5EF4] text-white shadow-[0_2px_8px_rgba(109,94,244,0.35)]"
                          : "bg-[#f1f0fc] text-[#6D5EF4] hover:bg-[#e8e5f9]"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category + Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--foreground-muted)]">Catégorie</p>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: categoryColors[form.category] ?? "#6D5EF4" }}
                    />
                    <select
                      className="w-full rounded-2xl border border-[#e8e4f8] bg-white py-2.5 pl-7 pr-3 text-sm text-[var(--foreground)] focus:border-[#6D5EF4] focus:outline-none focus:ring-2 focus:ring-[#6D5EF4]/10"
                      value={form.category}
                      onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as Task["category"] }))}
                    >
                      {categoryValues.map((cat) => (
                        <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--foreground-muted)]">Pour qui</p>
                  <select
                    className="w-full rounded-2xl border border-[#e8e4f8] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] focus:border-[#6D5EF4] focus:outline-none focus:ring-2 focus:ring-[#6D5EF4]/10"
                    value={form.assignedMemberId ?? ""}
                    onChange={(event) => setForm((prev) => ({ ...prev, assignedMemberId: event.target.value || null }))}
                  >
                    <option value="">Tout le monde</option>
                    {state.profile.members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status pills */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--foreground-muted)]">Statut</p>
                <div className="flex gap-2">
                  {statusColumns.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: s.value }))}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all ${
                        form.status === s.value
                          ? s.value === "done"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : s.value === "late"
                            ? "bg-rose-500 text-white shadow-sm"
                            : s.value === "in_progress"
                            ? "bg-amber-400 text-white shadow-sm"
                            : "bg-[#6D5EF4] text-white shadow-[0_2px_8px_rgba(109,94,244,0.3)]"
                          : "bg-[#f4f4f8] text-[var(--foreground-muted)] hover:bg-[#ecedf5]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--foreground-muted)]">Notes <span className="opacity-50">(optionnel)</span></p>
                <textarea
                  className="w-full resize-none rounded-2xl border border-[#e8e4f8] bg-[#fdfcff] px-4 py-3 text-sm placeholder-[#c4bde8] transition focus:border-[#6D5EF4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D5EF4]/10"
                  rows={2}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Détails supplémentaires…"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-[#e8e4f8] py-3 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[#f9f8ff]"
                  onClick={() => setEditor(null)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="flex-[2] rounded-2xl bg-[#6D5EF4] py-3 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(109,94,244,0.4)] transition hover:bg-[#5b4ee0] active:scale-[0.98] disabled:opacity-60"
                  onClick={persistTask}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enregistrement…" : editor.type === "edit" ? "Mettre à jour" : "Ajouter la tâche"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
