"use client";

import { useFamilyFlowStore } from "@familyflow/shared";
import { CalendarDays, CheckCircle2, Clock, ListTodo, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    { icon: ListTodo, label: "Total", value: total, tint: "from-violet-500/20 to-indigo-500/5" },
    { icon: CheckCircle2, label: "Terminées", value: done, tint: "from-emerald-500/20 to-emerald-500/5" },
    { icon: Clock, label: "En cours", value: inProgress, tint: "from-amber-500/20 to-orange-500/5" },
    { icon: CalendarDays, label: "Aujourd'hui", value: todayTasks, tint: "from-sky-500/20 to-cyan-500/5" }
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_0%_0%,#4338ca_0%,#312e81_40%,#0f172a_100%)] text-white shadow-[0_20px_60px_rgba(49,46,129,0.45)]">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="space-y-4">
            <Badge variant="white">Zone tâches</Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {total > 0 ? `${done} / ${total} tâches validées` : "Créez votre cockpit de tâches"}
              </h2>
              <p className="max-w-2xl text-sm text-white/75">
                {memberNames
                  ? `${memberNames} · suivi hebdomadaire en temps réel et meilleure répartition de la charge.`
                  : "Ajoutez votre foyer, puis générez des tâches intelligentes avec l'IA."}
              </p>
            </div>
            <div className="flex max-w-sm items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-bold">{pct}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`rounded-2xl border border-white/20 bg-gradient-to-b ${stat.tint} p-3 backdrop-blur-md`}>
                  <Icon className="mb-1.5 h-4 w-4 text-white/75" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[11px] text-white/70">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="border-[#dbe4ff] bg-[linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] shadow-[0_8px_28px_rgba(87,117,214,0.12)]">
        <div className="flex flex-wrap items-center gap-2 p-4 text-sm text-[#4f46e5]">
          <Sparkles className="h-4 w-4" />
          Vue revue : colonnes lisibles, cartes plus aérées, meilleure hiérarchie visuelle et drag & drop plus clair.
        </div>
      </Card>

      <TasksAiPanel />
      <TasksWeeklyBoard />
    </div>
  );
}
