"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Baby,
  BrainCircuit,
  Coins,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users
} from "lucide-react";
import { useFamilyFlowStore } from "@familyflow/shared";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/assistant", label: "Assistant IA", icon: BrainCircuit },
  { href: "/app/household", label: "Foyer", icon: Users },
  { href: "/app/birth-list", label: "Naissance", icon: Baby, requiresExpectingBaby: true },
  { href: "/app/tasks", label: "Taches", icon: Home },
  { href: "/app/budget", label: "Budget", icon: Coins },
  { href: "/app/savings", label: "Economies", icon: Sparkles },
  { href: "/app/exports", label: "PDF", icon: FileSpreadsheet },
  { href: "/app/settings", label: "Parametres", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const state = useFamilyFlowStore();
  const visibleItems = navItems.filter(
    (item) => !item.requiresExpectingBaby || state.profile.household.isExpectingBaby
  );

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-5 xl:grid-cols-[280px_minmax(0,1fr)] xl:px-6">
      <aside className="premium-shell rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,253,251,0.92),rgba(247,241,255,0.88))] p-5 shadow-[0_28px_90px_rgba(40,32,92,0.12)] backdrop-blur-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
              FamilyFlow
            </p>
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">Workspace</h1>
          </div>
          <Badge variant="mint">Plus</Badge>
        </div>
        <nav className="grid gap-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-[linear-gradient(135deg,rgba(109,94,244,0.18),rgba(74,142,255,0.12),rgba(86,199,161,0.08))] text-[var(--brand-primary)] shadow-[0_14px_30px_rgba(92,85,219,0.16)]"
                    : "text-[var(--foreground-muted)] hover:bg-white/80"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-[30px] bg-[linear-gradient(135deg,rgba(109,94,244,0.12),rgba(255,126,107,0.12),rgba(255,191,90,0.18))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          <p className="text-sm font-semibold">Freemium prepare</p>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            La V1 supporte deja les themes PDF premium, les limites de membres et les rappels
            avances.
          </p>
        </div>
      </aside>
      <main className="space-y-5">{children}</main>
    </div>
  );
}
