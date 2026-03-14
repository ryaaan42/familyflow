"use client";

import { useState } from "react";
import { categoryColors, categoryLabels, useFamilyFlowStore } from "@familyflow/shared";
import type { HouseholdMember, Task } from "@familyflow/shared";
import { UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemberColumnProps {
  member: HouseholdMember | null; // null = "Non assigné"
  tasks: Task[];
  dragOverId: string | null;
  onDragOver: (id: string) => void;
  onDragLeave: () => void;
  onDrop: (memberId: string | null) => void;
}

function MemberColumn({ member, tasks, dragOverId, onDragOver, onDragLeave, onDrop }: MemberColumnProps) {
  const columnId = member?.id ?? "unassigned";
  const isDragOver = dragOverId === columnId;
  const totalMin = tasks.reduce((s, t) => s + t.estimatedMinutes, 0);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(columnId);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(member?.id ?? null);
      }}
      className={cn(
        "flex flex-col rounded-[26px] border p-4 transition-all duration-150",
        isDragOver
          ? "border-[#6D5EF4] bg-[rgba(109,94,244,0.06)] shadow-[0_0_0_2px_rgba(109,94,244,0.3)]"
          : "border-[#d9e6ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(242,247,255,0.92))]",
        "shadow-[0_12px_32px_rgba(24,53,123,0.08)]"
      )}
    >
      {/* Member header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {member ? (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-[0_6px_18px_rgba(30,24,77,0.16)]"
              style={{ backgroundColor: member.avatarColor }}
            >
              {member.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f6ff] text-[var(--foreground-subtle)]">
              <UserRound className="h-4 w-4" />
            </span>
          )}
          <div>
            <p className="text-sm font-semibold">{member?.name ?? "Non assigné"}</p>
            {member && (
              <p className="text-xs capitalize text-[var(--foreground-muted)]">
                {member.memberCategory ?? member.role}
                {member.isPregnant ? " · enceinte" : ""}
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline">{totalMin} min</Badge>
      </div>

      {/* Drop hint */}
      {isDragOver && (
        <div className="mb-3 rounded-xl border-2 border-dashed border-[#6D5EF4] py-3 text-center text-xs font-semibold text-[#6D5EF4]">
          Déposer ici
        </div>
      )}

      {/* Tasks */}
      <div className="flex-1 space-y-2">
        {tasks.length === 0 && !isDragOver && (
          <div className="rounded-[18px] border border-dashed border-[#d9e6ff] py-4 text-center text-xs text-[var(--foreground-subtle)]">
            Glisser une tâche ici
          </div>
        )}
        {tasks.map((task) => {
          const color = categoryColors[task.category];
          return (
            <div
              key={task.id}
              className="rounded-[18px] border px-3 py-2.5"
              style={{
                borderColor: `${color}30`,
                background: `linear-gradient(180deg,rgba(255,255,255,0.98),${color}0d)`
              }}
            >
              <p className="text-xs font-semibold">{task.title}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-[10px] text-[var(--foreground-muted)]">
                  {categoryLabels[task.category]}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                    task.status === "done"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-[#f1f6ff] text-[var(--foreground-muted)]"
                  )}
                >
                  {task.status === "done" ? "Fait" : `${task.estimatedMinutes}m`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  draggingTaskId: string | null;
  onDragEnd: () => void;
}

export function TasksMemberBoard({ draggingTaskId, onDragEnd }: Props) {
  const state = useFamilyFlowStore();
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDrop = async (memberId: string | null) => {
    if (!draggingTaskId) return;

    const response = await fetch(`/api/tasks/${draggingTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedMemberId: memberId })
    });

    if (response.ok) {
      const tasks = (await response.json()) as Task[];
      useFamilyFlowStore.setState({ tasks });
    } else if (memberId === null) {
      state.unassignTask(draggingTaskId);
    } else {
      state.assignTask(draggingTaskId, memberId);
    }

    setDragOverId(null);
    onDragEnd();
  };

  const unassignedTasks = state.tasks.filter((t) => !t.assignedMemberId);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
      {/* Member columns */}
      {state.profile.members.map((member) => (
        <MemberColumn
          key={member.id}
          member={member}
          tasks={state.tasks.filter((t) => t.assignedMemberId === member.id)}
          dragOverId={dragOverId}
          onDragOver={setDragOverId}
          onDragLeave={() => setDragOverId(null)}
          onDrop={handleDrop}
        />
      ))}

      {/* Unassigned column */}
      <MemberColumn
        member={null}
        tasks={unassignedTasks}
        dragOverId={dragOverId}
        onDragOver={setDragOverId}
        onDragLeave={() => setDragOverId(null)}
        onDrop={handleDrop}
      />
    </div>
  );
}
