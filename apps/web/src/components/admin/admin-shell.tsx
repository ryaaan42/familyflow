"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Flag,
  LayoutDashboard,
  Mail,
  Settings,
  Users2
} from "lucide-react";

import { PlanilleLogo } from "@/components/brand/planille-logo";
import { cn } from "@/lib/utils";

const nav = [
  {
    href: "/app/admin",
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    exact: true,
    activeColor: "text-violet-600",
    activeBg: "bg-violet-100",
    activeGradient: "from-violet-500/20 to-purple-500/10"
  },
  {
    href: "/app/admin/users",
    label: "Utilisateurs",
    icon: Users2,
    exact: false,
    activeColor: "text-blue-600",
    activeBg: "bg-blue-100",
    activeGradient: "from-blue-500/20 to-cyan-500/10"
  },
  {
    href: "/app/admin/content",
    label: "Contenu du site",
    icon: FileText,
    exact: false,
    activeColor: "text-amber-600",
    activeBg: "bg-amber-100",
    activeGradient: "from-amber-500/20 to-orange-500/10"
  },
  {
    href: "/app/admin/newsletter",
    label: "Newsletter",
    icon: Mail,
    exact: false,
    activeColor: "text-fuchsia-600",
    activeBg: "bg-fuchsia-100",
    activeGradient: "from-fuchsia-500/20 to-pink-500/10"
  },
  {
    href: "/app/admin/flags",
    label: "Feature flags",
    icon: Flag,
    exact: false,
    activeColor: "text-emerald-600",
    activeBg: "bg-emerald-100",
    activeGradient: "from-emerald-500/20 to-teal-500/10"
  },
  {
    href: "/app/admin/settings",
    label: "Configuration",
    icon: Settings,
    exact: false,
    activeColor: "text-gray-600",
    activeBg: "bg-gray-100",
    activeGradient: "from-gray-400/20 to-slate-400/10"
  }
];

interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}

export function AdminShell({ children, adminName, adminEmail }: AdminShellProps) {
  const pathname = usePathname();

  function isActive(item: (typeof nav)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-5 px-3 py-4 md:px-5 lg:py-6 xl:grid-cols-[308px_minmax(0,1fr)] xl:gap-6 xl:px-6">
      {/* ── Sidebar ── */}
      <aside className="premium-shell sticky top-4 h-fit rounded-[30px] border border-[#d9e6ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,247,255,0.94))] p-4 shadow-[0_26px_70px_rgba(24,53,123,0.14)] backdrop-blur-xl md:p-5">
        {/* Brand header */}
        <div className="mb-5 rounded-[24px] border border-white/60 bg-[linear-gradient(140deg,rgba(53,89,230,0.92),rgba(109,94,244,0.86),rgba(0,169,255,0.82),rgba(46,197,161,0.76))] p-4 text-white shadow-[0_16px_40px_rgba(53,89,230,0.28)]">
          <div className="flex items-center gap-2.5">
            <PlanilleLogo
              markClassName="h-8 w-8 rounded-xl bg-white/20 shadow-none"
              textClassName="text-xs uppercase tracking-[0.2em] text-white/75"
            />
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Admin Panel</h1>
          <p className="mt-1.5 text-sm text-white/80">Gestion et supervision de la plateforme.</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-300" />
            <span className="text-xs font-semibold text-white/70">Accès administrateur</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex shrink-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all duration-100 active:scale-[0.99]",
                  active
                    ? `border-transparent bg-gradient-to-r ${item.activeGradient} ${item.activeColor} shadow-[0_8px_20px_rgba(0,0,0,0.08)]`
                    : "border-transparent text-[var(--foreground-muted)] hover:border-[#d9e6ff] hover:bg-white/90"
                )}
              >
                <span
                  className={cn(
                    "rounded-xl p-2 transition-all duration-100 active:scale-[0.99]",
                    active
                      ? `${item.activeBg} ${item.activeColor}`
                      : "bg-[#f1f6ff] text-[var(--foreground-subtle)] group-hover:bg-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom card */}
        <div className="mt-5 rounded-[22px] border border-[#d6e4ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(235,245,255,0.92))] p-4 md:mt-6">
          <Link
            href="/app"
            className="mb-3 flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-white/80 hover:text-[var(--foreground)]"
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            Retour à l&apos;app
          </Link>
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D5EF4,#00a9ff)] text-xs font-bold text-white">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{adminName}</p>
              <p className="truncate text-[10px] text-[var(--foreground-muted)]">{adminEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="min-w-0 space-y-5">
        {children}
      </main>
    </div>
  );
}
