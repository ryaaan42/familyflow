"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useFamilyFlowStore } from "@familyflow/shared";

import { cn } from "@/lib/utils";

function getGreeting(): string {
  const h = new Date().getHours();
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
  const user = useFamilyFlowStore((s) => s.user);
  const profile = useFamilyFlowStore((s) => s.profile);
  const tasks = useFamilyFlowStore((s) => s.tasks);

  const pendingCount = useMemo(
    () => tasks.filter((t) => t.status !== "done").length,
    [tasks]
  );

  const score = profile.household.balanceScore;
  const scoreColor =
    score >= 80
      ? "bg-emerald-100 text-emerald-700"
      : score >= 60
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-600";

  const firstName = user.displayName?.split(" ")[0] ?? user.displayName ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#d9e6ff] bg-white/80 px-5 py-3.5 shadow-[0_8px_28px_rgba(24,53,123,0.08)] backdrop-blur-md"
    >
      {/* Left: greeting + date */}
      <div className="min-w-0">
        <p className="text-sm font-bold tracking-[-0.01em] text-[var(--foreground)]">
          {getGreeting()}
          {firstName ? (
            <span className="ml-1 bg-[linear-gradient(90deg,#3559e6,#6D5EF4)] bg-clip-text text-transparent">
              {firstName}
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 text-xs capitalize text-[var(--foreground-muted)]">{formatDate()}</p>
      </div>

      {/* Right: pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Household name */}
        <span className="rounded-full border border-[#d9e6ff] bg-[#f1f6ff] px-3 py-1 text-xs font-semibold text-[var(--foreground-muted)]">
          {profile.household.name}
        </span>

        {/* Balance score */}
        {score > 0 && (
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", scoreColor)}>
            Équilibre {score}/100
          </span>
        )}

        {/* Pending tasks */}
        {pendingCount > 0 && (
          <span className="rounded-full bg-[rgba(109,94,244,0.1)] px-3 py-1 text-xs font-semibold text-[#6D5EF4]">
            {pendingCount} tâche{pendingCount > 1 ? "s" : ""} à faire
          </span>
        )}
      </div>
    </motion.div>
  );
}
