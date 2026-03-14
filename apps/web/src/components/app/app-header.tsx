"use client";

import { useMemo } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Bell, Clock3, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function formatDate(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

export function AppHeader() {
  const user    = useFamilyFlowStore((s) => s.user);
  const profile = useFamilyFlowStore((s) => s.profile);
  const tasks   = useFamilyFlowStore((s) => s.tasks);

  const pendingCount = useMemo(
    () => tasks.filter((t) => t.status !== "done").length,
    [tasks]
  );

  const lateCount = useMemo(
    () => tasks.filter((t) => t.status === "late").length,
    [tasks]
  );

  const score = profile.household.balanceScore;
  const firstName = user.displayName?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-white/90 bg-white/85 px-3 py-2.5 shadow-[0_4px_20px_rgba(79,70,229,0.07)] backdrop-blur-xl sm:px-4 sm:py-3">
      {/* Left: greeting */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#4f46e5,#0ea5e9)] text-sm font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
          {firstName.charAt(0) || "?"}
        </div>
        <div>
          <p className="text-sm font-bold text-[#0f0e1a]">
            {getGreeting()}
            {firstName ? (
              <span className="ml-1 bg-[linear-gradient(90deg,#4f46e5,#7c3aed)] bg-clip-text text-transparent">
                {firstName}
              </span>
            ) : null}
          </p>
          <p className="text-[11px] capitalize text-[#9ca3af]">{formatDate()}</p>
        </div>
      </div>

      {/* Right: status pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1.5 rounded-full border border-[#e0e7ff] bg-[#f5f3ff] px-2.5 py-1 text-[11px] font-semibold text-[#4f46e5] sm:px-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4f46e5]" />
          <span className="max-w-[120px] truncate">{profile.household.name}</span>
        </span>

        {score > 0 && (
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:flex sm:px-3",
              score >= 80 ? "bg-emerald-100 text-emerald-700" :
              score >= 60 ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-600"
            )}
          >
            <Sparkles className="h-3 w-3" />
            {score}/100
          </span>
        )}

        {lateCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
            <Bell className="h-3 w-3" />
            {lateCount}
          </span>
        )}

        {pendingCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[rgba(99,102,241,0.1)] px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
            <Clock3 className="h-3 w-3" />
            {pendingCount}
          </span>
        )}
      </div>
    </div>
  );
}
