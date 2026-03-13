"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Flag,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users2
} from "lucide-react";

const nav = [
  { href: "/app/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/app/admin/users", label: "Utilisateurs", icon: Users2, exact: false },
  { href: "/app/admin/content", label: "Contenu du site", icon: FileText, exact: false },
  { href: "/app/admin/flags", label: "Feature flags", icon: Flag, exact: false },
  { href: "/app/admin/settings", label: "Configuration", icon: Settings, exact: false }
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
    <div className="flex min-h-screen bg-[#0f0f23]">
      {/* ── Sidebar ── */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/8 bg-[#141428]">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/8 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6D5EF4,#00a9ff)]">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin</p>
            <p className="text-[10px] text-white/40">FamilyFlow</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[rgba(109,94,244,0.22)] text-[#a89cf7]"
                    : "text-white/50 hover:bg-white/6 hover:text-white/80"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="border-t border-white/8 px-3 py-4 space-y-0.5">
          <Link
            href="/app"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 hover:bg-white/6 hover:text-white/70 transition-colors"
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            Retour à l&apos;app
          </Link>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D5EF4,#00a9ff)] text-[10px] font-bold text-white shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/70">{adminName}</p>
              <p className="truncate text-[10px] text-white/35">{adminEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 overflow-auto bg-[#f5f5fa]">
        <div className="mx-auto max-w-6xl p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
