"use client";

import { useMemo, useState } from "react";
import { categoryColors, categoryLabels, useFamilyFlowStore } from "@familyflow/shared";
import type { Task } from "@familyflow/shared";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = Object.keys(categoryLabels) as (keyof typeof categoryLabels)[];

interface Props {
  onDragStart: (taskId: string) => void;
  draggingTaskId: string | null;
}

export function TasksCategorySidebar({ onDragStart, draggingTaskId }: Props) {
  const state = useFamilyFlowStore();
  const [selected, setSelected] = useState<string>("all");

  const filtered = useMemo<Task[]>(() => {
    if (selected === "all") return state.tasks;
    return state.tasks.filter((t) => t.category === selected);
  }, [state.tasks, selected]);

  const countFor = (cat: string) =>
    state.tasks.filter((t) => t.category === cat).length;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Category tabs */}
      <div className="rounded-[22px] border border-[#d9e6ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(242,247,255,0.94))] p-3 shadow-[0_8px_28px_rgba(24,53,123,0.08)]">
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-[var(--foreground-subtle)]">
          Catégories
        </p>
        <div className="space-y-0.5">
          {/* All */}
          <button
            type="button"
            onClick={() => setSelected("all")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
              selected === "all"
                ? "bg-[rgba(109,94,244,0.12)] text-[#6D5EF4]"
                : "text-[var(--foreground-muted)] hover:bg-[#f1f6ff]"
            )}
          >
            <span>Toutes</span>
            <Badge variant="outline">{state.tasks.length}</Badge>
          </button>

          {ALL_CATEGORIES.map((cat) => {
            const color = categoryColors[cat];
            const isSelected = selected === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelected(cat)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                  isSelected
                    ? "bg-white shadow-[0_4px_14px_rgba(0,0,0,0.07)]"
                    : "text-[var(--foreground-muted)] hover:bg-[#f1f6ff]"
                )}
                style={isSelected ? { color } : {}}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {categoryLabels[cat]}
                </div>
                <span className="text-xs text-[var(--foreground-subtle)]">{countFor(cat)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto rounded-[22px] border border-[#d9e6ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(242,247,255,0.94))] p-3 shadow-[0_8px_28px_rgba(24,53,123,0.08)]">
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-[var(--foreground-subtle)]">
          Tâches — glisser pour assigner
        </p>
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="px-1 py-3 text-sm text-[var(--foreground-muted)]">
              Aucune tâche dans cette catégorie.
            </p>
          )}
          {filtered.map((task) => {
            const color = categoryColors[task.category];
            const isDragging = draggingTaskId === task.id;
            const assignedName =
              state.profile.members.find((m) => m.id === task.assignedMemberId)?.name;
            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("taskId", task.id);
                  e.dataTransfer.effectAllowed = "move";
                  onDragStart(task.id);
                }}
                className={cn(
                  "cursor-grab rounded-[18px] border px-3 py-2.5 transition-all select-none active:cursor-grabbing",
                  isDragging ? "opacity-40 scale-95" : "hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(30,24,77,0.1)]"
                )}
                style={{
                  borderColor: `${color}28`,
                  background: `linear-gradient(180deg,rgba(255,255,255,0.98),${color}0d)`
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                      {assignedName ?? "Non assigné"} · {task.estimatedMinutes} min
                    </p>
                  </div>
                  <span
                    className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {categoryLabels[task.category]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
