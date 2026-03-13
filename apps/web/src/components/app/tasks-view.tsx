"use client";

import { useState } from "react";

import { TasksAiPanel } from "./tasks-ai-panel";
import { TasksCategorySidebar } from "./tasks-category-sidebar";
import { TasksMemberBoard } from "./tasks-member-board";

export function TasksView() {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  return (
    <div
      className="space-y-5"
      onDragEnd={() => setDraggingTaskId(null)}
    >
      {/* IA Panel */}
      <TasksAiPanel />

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
