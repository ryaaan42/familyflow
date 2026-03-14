"use client";

import { useMemo, useState } from "react";
import { categoryLabels, useFamilyFlowStore } from "@familyflow/shared";
import type { Task } from "@familyflow/shared";

import { TasksAiPanel } from "./tasks-ai-panel";
import { TasksCategorySidebar } from "./tasks-category-sidebar";
import { TasksMemberBoard } from "./tasks-member-board";

const categoryValues = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

export function TasksView() {
  const state = useFamilyFlowStore();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editFrequency, setEditFrequency] = useState<Task["frequency"]>("hebdomadaire");
  const [editCategory, setEditCategory] = useState<Task["category"]>("routine");
  const [error, setError] = useState<string | null>(null);

  const latestSmartTasks = useMemo(
    () => state.tasks.filter((task) => task.origin === "smart").slice(0, 6),
    [state.tasks]
  );

  const refreshFrom = async (response: Response) => {
    const payload = await response.json();
    if (Array.isArray(payload)) {
      useFamilyFlowStore.setState({ tasks: payload });
      return;
    }
    if (Array.isArray(payload.tasks)) {
      useFamilyFlowStore.setState({ tasks: payload.tasks });
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;
    setError(null);

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category: "routine",
        frequency: "hebdomadaire",
        estimatedMinutes: 20
      })
    });

    if (!response.ok) {
      setError("Impossible d'ajouter la tâche.");
      return;
    }

    await refreshFrom(response);
    setTitle("");
  };

  const deleteTask = async (taskId: string) => {
    setError(null);
    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Impossible de supprimer la tâche.");
      return;
    }
    await refreshFrom(response);
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditFrequency(task.frequency);
    setEditCategory(task.category);
  };

  const saveEdit = async () => {
    if (!editingTaskId) return;
    setError(null);
    const response = await fetch(`/api/tasks/${editingTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, frequency: editFrequency, category: editCategory })
    });
    if (!response.ok) {
      setError("Impossible d'enregistrer les modifications.");
      return;
    }
    await refreshFrom(response);
    setEditingTaskId(null);
  };

  return (
    <div className="space-y-5" onDragEnd={() => setDraggingTaskId(null)}>
      <TasksAiPanel />

      <div className="flex gap-2">
        <input
          className="h-10 flex-1 rounded-xl border border-[var(--border)] px-3 text-sm"
          placeholder="Ajouter une tâche manuelle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="button" className="h-10 rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white" onClick={addTask}>
          Ajouter
        </button>
      </div>

      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      {latestSmartTasks.length > 0 && (
        <div className="rounded-2xl border border-[#d9e6ff] bg-white p-4">
          <p className="mb-2 text-sm font-semibold">Review des suggestions IA (éditables)</p>
          <div className="space-y-2">
            {latestSmartTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-[#ebf1ff] p-3">
                {editingTaskId === task.id ? (
                  <div className="grid gap-2 md:grid-cols-4">
                    <input className="rounded-lg border px-2 py-1 text-sm md:col-span-2" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    <select className="rounded-lg border px-2 py-1 text-sm" value={editCategory} onChange={(e) => setEditCategory(e.target.value as Task["category"])}>
                      {categoryValues.map((cat) => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
                    </select>
                    <select className="rounded-lg border px-2 py-1 text-sm" value={editFrequency} onChange={(e) => setEditFrequency(e.target.value as Task["frequency"])}>
                      <option value="quotidienne">Quotidienne</option>
                      <option value="hebdomadaire">Hebdomadaire</option>
                      <option value="mensuelle">Mensuelle</option>
                      <option value="personnalisee">Personnalisée</option>
                    </select>
                    <div className="flex gap-2 md:col-span-4">
                      <button className="rounded-lg bg-[var(--brand-primary)] px-3 py-1 text-xs font-semibold text-white" onClick={saveEdit}>Enregistrer</button>
                      <button className="rounded-lg border px-3 py-1 text-xs" onClick={() => setEditingTaskId(null)}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">{categoryLabels[task.category]} · {task.frequency}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => startEdit(task)}>Modifier</button>
                      <button className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700" onClick={() => deleteTask(task.id)}>Supprimer</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <TasksCategorySidebar onDragStart={setDraggingTaskId} draggingTaskId={draggingTaskId} />
        <TasksMemberBoard draggingTaskId={draggingTaskId} onDragEnd={() => setDraggingTaskId(null)} />
      </div>
    </div>
  );
}
