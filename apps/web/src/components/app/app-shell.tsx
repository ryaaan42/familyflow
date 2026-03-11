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
      <aside className="premium-shell sticky top-5 h-fit rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[0_4px_24px_rgba(124,58,237,0.08)]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              FamilyFlow
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-[-0.03em]">Workspace</h1>
          </div>
          <Badge variant="mint">Plus</Badge>
        </div>
        <nav className="grid gap-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-[rgba(124,58,237,0.1)] text-[var(--brand-primary)] font-semibold"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--card-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 rounded-[20px] bg-[linear-gradient(135deg,rgba(124,58,237,0.08),rgba(236,72,153,0.08))] p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">Freemium prepare</p>
          <p className="mt-1.5 text-xs leading-5 text-[var(--foreground-muted)]">
            Themes PDF premium, limites membres et rappels avances.
          </p>
        </div>
      </aside>
      <main className="space-y-5">{children}</main>
    </div>
  );
}
