"use client";

import { TasksAiPanel } from "@/components/app/tasks-ai-panel";
import { TasksWeeklyBoard } from "@/components/app/tasks-weekly-board";

export function TasksView() {
  return (
    <div className="space-y-4">
      <TasksAiPanel />
      <TasksWeeklyBoard />
    </div>
  );
}
