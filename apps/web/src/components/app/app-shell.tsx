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
  ShieldCheck,
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
  { href: "/app/settings", label: "Parametres", icon: Settings },
  { href: "/app/admin", label: "Admin", icon: ShieldCheck }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const state = useFamilyFlowStore();
  const visibleItems = navItems.filter(
    (item) => !item.requiresExpectingBaby || state.profile.household.isExpectingBaby
  );

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-5 px-3 py-4 md:px-5 lg:py-6 xl:grid-cols-[308px_minmax(0,1fr)] xl:gap-6 xl:px-6">
      <aside className="premium-shell sticky top-4 h-fit rounded-[30px] border border-[#d9e6ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,247,255,0.92))] p-4 shadow-[0_26px_70px_rgba(24,53,123,0.14)] backdrop-blur-xl md:p-5">
        <div className="mb-5 rounded-[24px] border border-white/70 bg-[linear-gradient(140deg,rgba(53,89,230,0.9),rgba(0,169,255,0.82),rgba(46,197,161,0.75))] p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/78 md:text-sm">FamilyFlow</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Control Center</h1>
          <p className="mt-2 text-sm text-white/82">Pilotez toute la vie du foyer depuis un seul espace clair.</p>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "border-[#b7ccff] bg-[linear-gradient(135deg,rgba(53,89,230,0.18),rgba(0,169,255,0.12),rgba(46,197,161,0.08))] text-[var(--brand-primary)] shadow-[0_12px_28px_rgba(53,89,230,0.14)]"
                    : "border-transparent text-[var(--foreground-muted)] hover:border-[#d9e6ff] hover:bg-white/86"
                )}
              >
                <span
                  className={cn(
                    "rounded-xl p-2 transition",
                    active ? "bg-white/80" : "bg-[#f1f6ff] text-[var(--foreground-subtle)] group-hover:bg-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 rounded-[24px] border border-[#d6e4ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(235,245,255,0.9))] p-4 md:mt-7 md:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Plan Premium</p>
            <Badge variant="mint">Beta</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            Debloquez les exports avances, les themes personnalises et des recommandations encore plus fines.
          </p>
        </div>
      </aside>
      <main className="space-y-5">{children}</main>
    </div>
  );
}
