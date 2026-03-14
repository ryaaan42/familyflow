"use client";

import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Sparkles } from "lucide-react";

import { TasksAiPanel } from "./tasks-ai-panel";
import { TasksWeeklyBoard } from "./tasks-weekly-board";

export function TasksView() {
  const state = useFamilyFlowStore();

  const summary = useMemo(() => {
    const done = state.tasks.filter((task) => task.status === "done").length;
    const total = state.tasks.length;
    return {
      done,
      total,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      smartTasks: state.tasks.filter((task) => task.origin === "smart").length
    };
  }, [state.tasks]);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#d8e5ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(237,245,255,0.94))] p-5 shadow-[0_14px_38px_rgba(31,66,135,0.1)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">Planning semaine</p>
            <h2 className="text-2xl font-semibold tracking-tight">Vue claire par jour, actions rapides</h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">Ajout fluide, édition contextuelle en modale, assignation simplifiée.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#d8e5ff] bg-white px-3 py-2 text-sm font-medium text-[var(--brand-primary)]">
            <Sparkles className="h-4 w-4" />
            {summary.smartTasks} suggestion(s) IA actives
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl bg-white px-3 py-2.5">
            <p className="text-xs text-[var(--foreground-muted)]">Tâches semaine</p>
            <p className="text-xl font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2.5">
            <p className="text-xs text-[var(--foreground-muted)]">Terminées</p>
            <p className="text-xl font-semibold">{summary.done}</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2.5">
            <p className="text-xs text-[var(--foreground-muted)]">Progression</p>
            <p className="text-xl font-semibold">{summary.completionRate}%</p>
          </div>
        </div>
      </section>

      <TasksAiPanel />
      <TasksWeeklyBoard />
    </div>
  );
}
