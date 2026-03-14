"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryColors, categoryLabels, useFamilyFlowStore } from "@familyflow/shared";
import type { HouseholdMember, Task } from "@familyflow/shared";
import { UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const weekDays = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" }
] as const;

interface TaskDraft {
  assignedMemberId: string | null;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  status: Task["status"];
}

interface MemberColumnProps {
  member: HouseholdMember | null;
  tasks: Task[];
  dragOverId: string | null;
  onDragOver: (id: string) => void;
  onDragLeave: () => void;
  onDrop: (memberId: string | null) => void;
  drafts: Record<string, TaskDraft>;
  onDayChange: (taskId: string, dayOfWeek: TaskDraft["dayOfWeek"]) => void;
}

function MemberColumn({ member, tasks, dragOverId, onDragOver, onDragLeave, onDrop, drafts, onDayChange }: MemberColumnProps) {
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
          </div>
        </div>
        <Badge variant="outline">{totalMin} min</Badge>
      </div>

      {isDragOver && (
        <div className="mb-3 rounded-xl border-2 border-dashed border-[#6D5EF4] py-3 text-center text-xs font-semibold text-[#6D5EF4]">
          Déposer ici
        </div>
      )}

      <div className="flex-1 space-y-2">
        {tasks.length === 0 && !isDragOver && (
          <div className="rounded-[18px] border border-dashed border-[#d9e6ff] py-4 text-center text-xs text-[var(--foreground-subtle)]">
            Glisser une tâche ici
          </div>
        )}
        {tasks.map((task) => {
          const color = categoryColors[task.category];
          const taskDraft = drafts[task.id];
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
                <span className="text-[10px] text-[var(--foreground-muted)]">{categoryLabels[task.category]}</span>
                <span className="rounded-full bg-[#f1f6ff] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--foreground-muted)]">
                  {taskDraft?.status === "done" ? "Fait" : `${task.estimatedMinutes}m`}
                </span>
              </div>
              <select
                className="mt-2 w-full rounded-lg border border-[#d9e6ff] bg-white px-2 py-1 text-[11px]"
                value={taskDraft?.dayOfWeek ?? task.dayOfWeek ?? 1}
                onChange={(event) => onDayChange(task.id, Number(event.target.value) as TaskDraft["dayOfWeek"])}
              >
                {weekDays.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
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
  const [drafts, setDrafts] = useState<Record<string, TaskDraft>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        state.tasks.map((task) => [
          task.id,
          {
            assignedMemberId: task.assignedMemberId ?? null,
            dayOfWeek: (task.dayOfWeek ?? 1) as TaskDraft["dayOfWeek"],
            status: task.status
          }
        ])
      )
    );
  }, [state.tasks]);

  const hasPendingChanges = useMemo(
    () =>
      state.tasks.some((task) => {
        const draft = drafts[task.id];
        if (!draft) return false;
        return draft.assignedMemberId !== (task.assignedMemberId ?? null) || draft.dayOfWeek !== (task.dayOfWeek ?? 1) || draft.status !== task.status;
      }),
    [drafts, state.tasks]
  );

  const handleDrop = (memberId: string | null) => {
    if (!draggingTaskId) return;

    setDrafts((previous) => ({
      ...previous,
      [draggingTaskId]: {
        ...(previous[draggingTaskId] ?? { dayOfWeek: 1, status: "todo" as Task["status"] }),
        assignedMemberId: memberId
      }
    }));

    useFamilyFlowStore.setState((prev) => ({
      tasks: prev.tasks.map((task) => (task.id === draggingTaskId ? { ...task, assignedMemberId: memberId ?? undefined } : task))
    }));

    setSaveMessage(null);
    setSaveError(null);
    setDragOverId(null);
    onDragEnd();
  };

  const handleDayChange = (taskId: string, dayOfWeek: TaskDraft["dayOfWeek"]) => {
    setDrafts((previous) => ({
      ...previous,
      [taskId]: {
        ...(previous[taskId] ?? { assignedMemberId: null, status: "todo" as Task["status"] }),
        dayOfWeek
      }
    }));
    useFamilyFlowStore.setState((prev) => ({
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, dayOfWeek } : task))
    }));
    setSaveMessage(null);
    setSaveError(null);
  };

  const savePlanning = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    const payload = {
      items: Object.entries(drafts).map(([taskId, value]) => ({
        taskId,
        assignedMemberId: value.assignedMemberId,
        dayOfWeek: value.dayOfWeek,
        status: value.status
      }))
    };

    const response = await fetch("/api/tasks/bulk-save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSaving(false);

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
      setSaveError(errorPayload?.error ?? "Erreur lors de l'enregistrement du planning.");
      return;
    }

    const body = (await response.json()) as { tasks?: Task[] };
    if (Array.isArray(body.tasks)) {
      useFamilyFlowStore.setState({ tasks: body.tasks });
      setSaveMessage("Modifications enregistrées.");
      return;
    }

    setSaveError("Réponse serveur invalide après enregistrement.");
  };

  const unassignedTasks = state.tasks.filter((t) => !drafts[t.id]?.assignedMemberId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-[#d9e6ff] bg-white px-4 py-2">
        <p className="text-sm text-[var(--foreground-muted)]">Planning hebdomadaire des tâches (affectation + jour)</p>
        <button
          type="button"
          onClick={savePlanning}
          disabled={saving || !hasPendingChanges}
          className="rounded-xl bg-[var(--brand-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
      {saveMessage ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveMessage}</p> : null}
      {saveError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {state.profile.members.map((member) => (
          <MemberColumn
            key={member.id}
            member={member}
            tasks={state.tasks.filter((t) => drafts[t.id]?.assignedMemberId === member.id)}
            dragOverId={dragOverId}
            onDragOver={setDragOverId}
            onDragLeave={() => setDragOverId(null)}
            onDrop={handleDrop}
            drafts={drafts}
            onDayChange={handleDayChange}
          />
        ))}

        <MemberColumn
          member={null}
          tasks={unassignedTasks}
          dragOverId={dragOverId}
          onDragOver={setDragOverId}
          onDragLeave={() => setDragOverId(null)}
          onDrop={handleDrop}
          drafts={drafts}
          onDayChange={handleDayChange}
        />
      </div>
    </div>
  );
}
