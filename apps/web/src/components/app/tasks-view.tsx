"use client";

import { useMemo, useState } from "react";
import { categoryColors, categoryLabels, useFamilyFlowStore } from "@familyflow/shared";
import type { AiHouseholdPlan, Task, TaskCategory } from "@familyflow/shared";
import {
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Plus,
  Shuffle,
  Trash2,
  X
} from "lucide-react";

import { cn } from "@/lib/utils";

const ALL_CATEGORIES = Object.keys(categoryLabels) as TaskCategory[];
const DURATION_OPTIONS = [15, 30, 45, 60, 90];

// ── AI Panel ──────────────────────────────────────────────────────────────────

function AiPanel({
  onImportTask
}: {
  onImportTask: (title: string, category: string) => void;
}) {
  const state = useFamilyFlowStore();
  const [plan, setPlan] = useState<AiHouseholdPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());

  const ready = Boolean(state.profile.household.name && state.profile.members.length > 0);

  const runAi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/household-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          tasks: state.tasks,
          budgetItems: state.budgetItems,
          birthListItems: state.birthListItems
        })
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as AiHouseholdPlan;
      setPlan(data);
      setExpanded(true);
      setImported(new Set());
    } catch {
      setError("Impossible de générer le planning IA pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const guessCategory = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes("cuis") || t.includes("repas") || t.includes("manger") || t.includes("dîner")) return "cuisine";
    if (t.includes("course") || t.includes("achat") || t.includes("marché")) return "courses";
    if (t.includes("enfant") || t.includes("bébé") || t.includes("école") || t.includes("devoirs")) return "enfants";
    if (t.includes("animal") || t.includes("chien") || t.includes("chat")) return "animaux";
    if (t.includes("facture") || t.includes("admin") || t.includes("papier")) return "administratif";
    if (t.includes("budget") || t.includes("argent") || t.includes("banque")) return "budget";
    if (t.includes("douche") || t.includes("bain") || t.includes("hygiène")) return "hygiene";
    if (t.includes("jardin") || t.includes("voiture") || t.includes("répar")) return "entretien";
    if (t.includes("routine") || t.includes("matin") || t.includes("soir")) return "routine";
    return "menage";
  };

  const handleImport = (item: AiHouseholdPlan["taskFocus"][number]) => {
    onImportTask(item.title, guessCategory(item.title));
    setImported((prev) => new Set([...prev, item.title]));
  };

  return (
    <div className="rounded-[24px] border border-[#d9e6ff] bg-gradient-to-br from-white to-[#f2f7ff] p-4 shadow-[0_12px_40px_rgba(24,53,123,0.09)]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <BrainCircuit className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#0f0e1a]">Assistant IA</p>
          {plan ? (
            <p className="mt-0.5 truncate text-xs text-[#6b7280]">{plan.headline}</p>
          ) : (
            <p className="mt-0.5 text-xs text-[#9ca3af]">Génère un planning adapté à votre foyer</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => state.rebalanceAssignments()}
            className="flex items-center gap-1.5 rounded-xl border border-[#e0e7ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f46e5] shadow-sm transition-all hover:bg-indigo-50 active:scale-95"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Rééquilibrer</span>
          </button>

          <button
            type="button"
            disabled={!ready || loading}
            onClick={runAi}
            className="flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] px-3 py-1.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-40"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Génération...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Générer</span>
                <span className="sm:hidden">IA</span>
              </>
            )}
          </button>

          {plan && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d9e6ff] bg-white text-[#9ca3af] transition hover:bg-[#f1f6ff] active:scale-95"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      {plan && expanded && (
        <div className="mt-4 space-y-3 border-t border-[#e8f0ff] pt-4">
          <p className="text-sm leading-6 text-[#6b7280]">{plan.summary}</p>

          {plan.taskFocus.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                Tâches suggérées — cliquez pour importer
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {plan.taskFocus.map((item) => {
                  const isImported = imported.has(item.title);
                  return (
                    <div
                      key={item.title}
                      className="flex items-center justify-between gap-3 rounded-[18px] border border-[#e8f0ff] bg-white px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#0f0e1a]">{item.title}</p>
                        <p className="mt-0.5 text-[10px] text-[#9ca3af]">
                          {item.who} · {item.when}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImport(item)}
                        disabled={isImported}
                        className={cn(
                          "shrink-0 rounded-[10px] px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95",
                          isImported
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                        )}
                      >
                        {isImported ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          "+ Importer"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {plan.routines.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Routines</p>
              {plan.routines.map((r) => (
                <p key={r} className="text-xs text-[#6b7280]">· {r}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add Task Form ─────────────────────────────────────────────────────────────

interface AddTaskFormProps {
  initialTitle?: string;
  initialCategory?: string;
  members: { id: string; name: string; avatarColor: string }[];
  onAdd: (task: Omit<Task, "id" | "householdId" | "createdAt">) => void;
  onCancel: () => void;
}

function AddTaskForm({
  initialTitle = "",
  initialCategory = "menage",
  members,
  onAdd,
  onCancel
}: AddTaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<TaskCategory>(initialCategory as TaskCategory);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);

  const handleSave = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      category,
      frequency: "hebdomadaire",
      dueDate: new Date().toISOString().split("T")[0],
      status: "todo",
      estimatedMinutes: duration,
      difficulty: 2,
      assignedMemberId: memberId ?? undefined,
      origin: "custom"
    });
  };

  return (
    <div className="rounded-[22px] border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-violet-50/40 p-4 shadow-[0_4px_16px_rgba(79,70,229,0.1)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-[#0f0e1a]">Nouvelle tâche</p>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 text-[#9ca3af] transition hover:bg-white/80 active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Title */}
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Nom de la tâche..."
        className="w-full rounded-[14px] border border-white bg-white px-3 py-2.5 text-sm font-medium text-[#0f0e1a] placeholder:text-[#d1d5db] shadow-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />

      {/* Category pills */}
      <div className="mt-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Catégorie</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map((cat) => {
            const color = categoryColors[cat];
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95",
                  isSelected
                    ? "text-white shadow-sm"
                    : "border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-current"
                )}
                style={isSelected ? { backgroundColor: color } : {}}
              >
                {categoryLabels[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Member pills */}
      {members.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Assigner à</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setMemberId(null)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95",
                !memberId
                  ? "bg-[#4b5563] text-white"
                  : "border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#9ca3af]"
              )}
            >
              Non assigné
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMemberId(m.id === memberId ? null : m.id)}
                className="rounded-full px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: memberId === m.id ? m.avatarColor : "#f3f4f6",
                  color: memberId === m.id ? "white" : "#4b5563"
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration pills */}
      <div className="mt-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Durée estimée</p>
        <div className="flex flex-wrap gap-1.5">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95",
                duration === d
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-indigo-300"
              )}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!title.trim()}
        className="mt-4 w-full rounded-[14px] bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_6px_16px_rgba(79,70,229,0.4)] active:scale-[0.99] disabled:opacity-40"
      >
        Enregistrer
      </button>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  members,
  onToggle,
  onAssign,
  onDelete
}: {
  task: Task;
  members: { id: string; name: string; avatarColor: string }[];
  onToggle: () => void;
  onAssign: (memberId: string | null) => void;
  onDelete: () => void;
}) {
  const [showAssign, setShowAssign] = useState(false);
  const color = categoryColors[task.category] ?? "#6366f1";
  const assignedMember = members.find((m) => m.id === task.assignedMemberId);
  const isDone = task.status === "done";

  return (
    <div
      className={cn(
        "group rounded-[20px] border px-3 py-3 transition-all",
        isDone
          ? "border-[#e5e7eb] bg-[#f9fafb] opacity-60"
          : "border-white bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90",
            isDone
              ? "border-emerald-400 bg-emerald-400 text-white"
              : "border-[#d1d5db] hover:border-indigo-400"
          )}
        >
          {isDone && <Check className="h-3 w-3" />}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-semibold leading-tight",
              isDone && "text-[#9ca3af] line-through"
            )}
          >
            {task.title}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {categoryLabels[task.category]}
            </span>
            <span className="text-[10px] text-[#9ca3af]">{task.estimatedMinutes} min</span>

            {/* Assign toggle */}
            <button
              type="button"
              onClick={() => setShowAssign((v) => !v)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition active:scale-95",
                showAssign
                  ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                  : "border-[#e5e7eb] bg-[#f9f9fb] text-[#6b7280] hover:border-indigo-300 hover:text-indigo-600"
              )}
            >
              {assignedMember && (
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ backgroundColor: assignedMember.avatarColor }}
                >
                  {assignedMember.name.charAt(0)}
                </span>
              )}
              {assignedMember?.name ?? "Assigner"}
            </button>
          </div>

          {/* Member selection (inline, no dropdown) */}
          {showAssign && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onAssign(null);
                  setShowAssign(false);
                }}
                className="rounded-full border border-[#e5e7eb] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#6b7280] transition hover:bg-gray-100 active:scale-95"
              >
                Retirer
              </button>
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onAssign(m.id);
                    setShowAssign(false);
                  }}
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm transition active:scale-95"
                  style={{ backgroundColor: m.avatarColor }}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete — always visible on touch, hover on desktop */}
        <button
          type="button"
          onClick={onDelete}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#d1d5db] transition hover:bg-rose-50 hover:text-rose-400 active:scale-90 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function TasksView() {
  const state = useFamilyFlowStore();
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ title: string; category: string } | null>(null);

  const members = state.profile.members;

  const handleAddTask = (taskData: Omit<Task, "id" | "householdId" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      householdId: state.profile.household.id,
      createdAt: new Date().toISOString()
    };
    useFamilyFlowStore.setState((s) => ({ tasks: [newTask, ...s.tasks] }));
    setShowAddForm(false);
    setPendingImport(null);
  };

  const handleImportFromAI = (title: string, category: string) => {
    setPendingImport({ title, category });
    setShowAddForm(true);
    // Scroll to top of page so form is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: state.tasks.length };
    ALL_CATEGORIES.forEach((cat) => {
      map[cat] = state.tasks.filter((t) => t.category === cat).length;
    });
    return map;
  }, [state.tasks]);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return state.tasks;
    return state.tasks.filter((t) => t.category === selectedCategory);
  }, [state.tasks, selectedCategory]);

  const todo = filtered.filter((t) => t.status !== "done");
  const done = filtered.filter((t) => t.status === "done");

  return (
    <div className="space-y-4">
      {/* AI Panel */}
      <AiPanel onImportTask={handleImportFromAI} />

      {/* Filter pills + Add button */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-1.5" style={{ width: "max-content" }}>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-indigo-300"
              )}
            >
              Toutes{counts.all > 0 ? ` (${counts.all})` : ""}
            </button>
            {ALL_CATEGORIES.filter((cat) => counts[cat] > 0).map((cat) => {
              const color = categoryColors[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                    isSelected
                      ? "text-white shadow-sm"
                      : "border border-[#e5e7eb] bg-white text-[#6b7280]"
                  )}
                  style={isSelected ? { backgroundColor: color } : {}}
                >
                  {categoryLabels[cat]} ({counts[cat]})
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPendingImport(null);
            setShowAddForm((v) => !v);
          }}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
            showAddForm
              ? "bg-[#f3f4f6] text-[#6b7280]"
              : "bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
          )}
        >
          {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showAddForm ? "Annuler" : "Ajouter"}
        </button>
      </div>

      {/* Add task form */}
      {showAddForm && (
        <AddTaskForm
          initialTitle={pendingImport?.title}
          initialCategory={pendingImport?.category}
          members={members}
          onAdd={handleAddTask}
          onCancel={() => {
            setShowAddForm(false);
            setPendingImport(null);
          }}
        />
      )}

      {/* Empty state */}
      {filtered.length === 0 && !showAddForm && (
        <div className="rounded-[24px] border border-dashed border-[#d1d5db] bg-white/60 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
            <Plus className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-sm font-semibold text-[#6b7280]">Aucune tâche</p>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Appuyez sur Ajouter ou utilisez l'IA pour créer des tâches
          </p>
        </div>
      )}

      {/* À faire */}
      {todo.length > 0 && (
        <div className="space-y-2">
          <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
            À faire · {todo.length}
          </p>
          {todo.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              onToggle={() => state.toggleTask(task.id)}
              onAssign={(mId) =>
                mId === null ? state.unassignTask(task.id) : state.assignTask(task.id, mId)
              }
              onDelete={() =>
                useFamilyFlowStore.setState((s) => ({
                  tasks: s.tasks.filter((t) => t.id !== task.id)
                }))
              }
            />
          ))}
        </div>
      )}

      {/* Terminées */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
            Terminées · {done.length}
          </p>
          {done.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              onToggle={() => state.toggleTask(task.id)}
              onAssign={(mId) =>
                mId === null ? state.unassignTask(task.id) : state.assignTask(task.id, mId)
              }
              onDelete={() =>
                useFamilyFlowStore.setState((s) => ({
                  tasks: s.tasks.filter((t) => t.id !== task.id)
                }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
