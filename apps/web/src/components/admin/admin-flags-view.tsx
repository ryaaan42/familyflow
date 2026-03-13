"use client";

import { useState, useTransition } from "react";
import type { FeatureFlag } from "@familyflow/shared";

import { toggleFeatureFlag } from "@/lib/supabase/admin-actions";
import { Card } from "@/components/ui/card";

interface Props {
  flags: FeatureFlag[];
}

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 ${
        enabled ? "bg-[var(--brand-primary)]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function AdminFlagsView({ flags: initialFlags }: Props) {
  const [flags, setFlags] = useState(initialFlags);
  const [isPending, startTransition] = useTransition();

  function handleToggle(key: string, current: boolean) {
    startTransition(async () => {
      await toggleFeatureFlag(key, !current);
      setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !current } : f)));
    });
  }

  const categories = Array.from(new Set(flags.map((f) => f.category)));

  return (
    <div className="space-y-5">
      {categories.map((category) => {
        const items = flags.filter((f) => f.category === category);
        return (
          <Card key={category}>
            <div className="p-6 space-y-3">
              <h2 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                {category}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((flag) => (
                  <div
                    key={flag.key}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 transition ${
                      flag.enabled
                        ? "border-[rgba(53,89,230,0.3)] bg-[linear-gradient(135deg,rgba(53,89,230,0.06),rgba(0,169,255,0.04))]"
                        : "border-[var(--border)] bg-white"
                    }`}
                  >
                    <div className="mr-4 flex-1 min-w-0">
                      <p className="font-semibold text-sm">{flag.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">{flag.description}</p>
                    </div>
                    <Toggle
                      enabled={flag.enabled}
                      onChange={() => handleToggle(flag.key, flag.enabled)}
                      disabled={isPending}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
