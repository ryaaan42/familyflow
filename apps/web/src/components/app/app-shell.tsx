"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coins,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/household", label: "Foyer", icon: Users },
  { href: "/app/tasks", label: "Taches", icon: Home },
  { href: "/app/budget", label: "Budget", icon: Coins },
  { href: "/app/savings", label: "Economies", icon: Sparkles },
  { href: "/app/exports", label: "PDF", icon: FileSpreadsheet },
  { href: "/app/settings", label: "Parametres", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-5 xl:grid-cols-[260px_minmax(0,1fr)] xl:px-6">
      <aside className="rounded-[30px] border border-white/60 bg-[rgba(255,251,248,0.92)] p-5 shadow-[0_20px_80px_rgba(109,94,244,0.08)] backdrop-blur">
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-[linear-gradient(135deg,rgba(109,94,244,0.14),rgba(74,142,255,0.08))] text-[var(--brand-primary)]"
                    : "text-[var(--foreground-muted)] hover:bg-white/70"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,126,107,0.14),rgba(255,191,90,0.18))] p-5">
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

