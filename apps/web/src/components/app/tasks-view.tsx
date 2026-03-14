"use client";

import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";

import { TasksAiPanel } from "./tasks-ai-panel";
import { TasksWeeklyBoard } from "./tasks-weekly-board";

export function TasksView() {
  const state = useFamilyFlowStore();

  const latestSmartTasks = useMemo(
    () => state.tasks.filter((task) => task.origin === "smart").slice(0, 6),
    [state.tasks]
  );

  return (
    <div className="space-y-5">
      <TasksAiPanel />

      {latestSmartTasks.length > 0 && (
        <div className="rounded-2xl border border-[#d9e6ff] bg-white p-4">
          <p className="mb-2 text-sm font-semibold">Review des suggestions IA (éditables)</p>
          <div className="space-y-2">
            {latestSmartTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-[#ebf1ff] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Suggestion intégrée au planning hebdomadaire ci-dessous.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <TasksWeeklyBoard />
    </div>
  );
}
