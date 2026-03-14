"use client";

import { useFamilyFlowStore } from "@familyflow/shared";
import { CalendarDays, CheckCircle2, Clock, ListTodo } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TasksAiPanel } from "@/components/app/tasks-ai-panel";
import { TasksWeeklyBoard } from "@/components/app/tasks-weekly-board";

const currentDayOfWeek = () => ((new Date().getDay() + 6) % 7) + 1;

export function TasksView() {
  const state = useFamilyFlowStore();

  const total = state.tasks.length;
  const done = state.tasks.filter((t) => t.status === "done").length;
  const inProgress = state.tasks.filter((t) => t.status === "in_progress").length;
  const todayTasks = state.tasks.filter((t) => t.dayOfWeek === currentDayOfWeek()).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const memberNames = state.profile.members.map((m) => m.name).join(", ");

  const stats = [
    { icon: ListTodo, label: "Total", value: total, bg: "bg-white/10" },
    { icon: CheckCircle2, label: "Fait", value: done, bg: "bg-emerald-500/20" },
    { icon: Clock, label: "En cours", value: inProgress, bg: "bg-amber-400/20" },
    { icon: CalendarDays, label: "Aujourd'hui", value: todayTasks, bg: "bg-sky-400/20" }
  ];

  return (
    <div className="space-y-4">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1e3a8a_0%,#3730a3_30%,#6D5EF4_65%,#818cf8_100%)] p-6 text-white shadow-[0_20px_60px_rgba(79,70,229,0.4)] md:p-8">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />

        <div className="relative grid gap-6 md:grid-cols-[1fr_auto]">
          {/* Left: copy */}
          <div className="space-y-4">
            <Badge variant="white">Planning hebdomadaire</Badge>
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em] md:text-4xl">
                {total > 0
                  ? `${done} tâche${done > 1 ? "s" : ""} complétée${done > 1 ? "s" : ""} · ${pct}%`
                  : "Organisez votre semaine"}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-white/75">
                {memberNames
                  ? `${memberNames} · ${total} tâche${total > 1 ? "s" : ""} planifiée${total > 1 ? "s" : ""} cette semaine`
                  : "Ajoutez votre foyer puis générez un plan personnalisé avec l'IA."}
              </p>
            </div>

            {total > 0 && (
              <div className="flex max-w-xs items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white/80">{pct}%</span>
              </div>
            )}
          </div>

          {/* Right: stat chips */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`rounded-2xl border border-white/15 ${stat.bg} p-3 backdrop-blur-md`}
                >
                  <Icon className="mb-1 h-4 w-4 text-white/60" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] font-medium text-white/60">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── AI Panel ── */}
      <TasksAiPanel />

      {/* ── Weekly board ── */}
      <TasksWeeklyBoard />
    </div>
  );
}
