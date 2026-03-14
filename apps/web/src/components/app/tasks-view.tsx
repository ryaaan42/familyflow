"use client";

import { useState } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";

import { TasksAiPanel } from "./tasks-ai-panel";
import { TasksCategorySidebar } from "./tasks-category-sidebar";
import { TasksMemberBoard } from "./tasks-member-board";

export function TasksView() {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const addTask = async () => {
    if (!title.trim()) return;
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

    if (response.ok) {
      const tasks = await response.json();
      useFamilyFlowStore.setState({ tasks });
      setTitle("");
    }
  };

  return (
    <div
      className="space-y-5"
      onDragEnd={() => setDraggingTaskId(null)}
    >
      {/* IA Panel */}
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

      {/* Main body: category sidebar + member board */}
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left: category sidebar */}
        <TasksCategorySidebar
          onDragStart={setDraggingTaskId}
          draggingTaskId={draggingTaskId}
        />

        {/* Right: member board */}
        <TasksMemberBoard
          draggingTaskId={draggingTaskId}
          onDragEnd={() => setDraggingTaskId(null)}
        />
      </div>
    </div>
  );
}
