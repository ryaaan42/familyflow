"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Baby,
  BrainCircuit,
  Coins,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  UtensilsCrossed,
  Users,
  X
} from "lucide-react";
import { useFamilyFlowStore } from "@familyflow/shared";
import type { HouseholdProfile, UserProfile } from "@familyflow/shared";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";

const navItems = [
  {
    href: "/app",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    activeBorder: "border-indigo-200",
    activeGradient: "from-indigo-50 to-violet-50",
    dot: "bg-indigo-500"
  },
  {
    href: "/app/assistant",
    label: "Assistant IA",
    icon: BrainCircuit,
    color: "text-violet-600",
    bg: "bg-violet-100",
    activeBorder: "border-violet-200",
    activeGradient: "from-violet-50 to-purple-50",
    dot: "bg-violet-500"
  },
  {
    href: "/app/household",
    label: "Foyer",
    icon: Users,
    color: "text-pink-600",
    bg: "bg-pink-100",
    activeBorder: "border-pink-200",
    activeGradient: "from-pink-50 to-rose-50",
    dot: "bg-pink-500"
  },
  {
    href: "/app/birth-list",
    label: "Naissance",
    icon: Baby,
    requiresExpectingBaby: true,
    color: "text-rose-600",
    bg: "bg-rose-100",
    activeBorder: "border-rose-200",
    activeGradient: "from-rose-50 to-pink-50",
    dot: "bg-rose-500"
  },
  {
    href: "/app/tasks",
    label: "Tâches",
    icon: ListTodo,
    color: "text-blue-600",
    bg: "bg-blue-100",
    activeBorder: "border-blue-200",
    activeGradient: "from-blue-50 to-indigo-50",
    dot: "bg-blue-500"
  },
  {
    href: "/app/budget",
    label: "Budget",
    icon: Coins,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    activeBorder: "border-emerald-200",
    activeGradient: "from-emerald-50 to-teal-50",
    dot: "bg-emerald-500"
  },
  {
    href: "/app/meals",
    label: "Repas",
    icon: UtensilsCrossed,
    color: "text-orange-600",
    bg: "bg-orange-100",
    activeBorder: "border-orange-200",
    activeGradient: "from-orange-50 to-amber-50",
    dot: "bg-orange-500"
  },
  {
    href: "/app/shopping",
    label: "Courses",
    icon: ShoppingCart,
    color: "text-lime-700",
    bg: "bg-lime-100",
    activeBorder: "border-lime-200",
    activeGradient: "from-lime-50 to-green-50",
    dot: "bg-lime-600"
  },
  {
    href: "/app/goals",
    label: "Objectifs",
    icon: Target,
    color: "text-teal-600",
    bg: "bg-teal-100",
    activeBorder: "border-teal-200",
    activeGradient: "from-teal-50 to-cyan-50",
    dot: "bg-teal-500"
  },
  {
    href: "/app/savings",
    label: "Économies",
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-100",
    activeBorder: "border-amber-200",
    activeGradient: "from-amber-50 to-yellow-50",
    dot: "bg-amber-500"
  },
  {
    href: "/app/exports",
    label: "PDF",
    icon: FileSpreadsheet,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
    activeBorder: "border-cyan-200",
    activeGradient: "from-cyan-50 to-sky-50",
    dot: "bg-cyan-500"
  },
  {
    href: "/app/subscription",
    label: "Abonnement",
    icon: CreditCard,
    color: "text-purple-600",
    bg: "bg-purple-100",
    activeBorder: "border-purple-200",
    activeGradient: "from-purple-50 to-violet-50",
    dot: "bg-purple-500"
  },
  {
    href: "/app/settings",
    label: "Paramètres",
    icon: Settings,
    color: "text-gray-600",
    bg: "bg-gray-100",
    activeBorder: "border-gray-200",
    activeGradient: "from-gray-50 to-slate-50",
    dot: "bg-gray-500"
  },
  {
    href: "/app/admin",
    label: "Admin",
    icon: ShieldCheck,
    requiresAdmin: true,
    color: "text-red-600",
    bg: "bg-red-100",
    activeBorder: "border-red-200",
    activeGradient: "from-red-50 to-rose-50",
    dot: "bg-red-500"
  }
];

// Bottom tab items for mobile (most important 4, plus "More")
const BOTTOM_TAB_HREFS = ["/app", "/app/tasks", "/app/budget", "/app/household"];

interface AppShellProps {
  children: React.ReactNode;
  userProfile: UserProfile | null;
  householdProfile: HouseholdProfile;
  initialTasks?: ReturnType<typeof useFamilyFlowStore.getState>["tasks"];
  initialCompletions?: ReturnType<typeof useFamilyFlowStore.getState>["completions"];
  initialBudgetItems?: ReturnType<typeof useFamilyFlowStore.getState>["budgetItems"];
  initialSavingsScenarios?: ReturnType<typeof useFamilyFlowStore.getState>["savingsScenarios"];
  initialBirthListItems?: ReturnType<typeof useFamilyFlowStore.getState>["birthListItems"];
}

export function AppShell({
  children,
  userProfile,
  householdProfile,
  initialTasks = [],
  initialCompletions = [],
  initialBudgetItems = [],
  initialSavingsScenarios = [],
  initialBirthListItems = []
}: AppShellProps) {
  const pathname = usePathname();
  const initialized = useRef(false);
  const [moreOpen, setMoreOpen] = useState(false);

  if (!initialized.current) {
    initialized.current = true;
    useFamilyFlowStore.setState({
      user: userProfile ?? {
        id: "",
        email: "",
        displayName: "",
        locale: "fr-FR",
        currency: "EUR",
        plan: "free",
        isAdmin: false
      },
      profile: householdProfile,
      tasks: initialTasks,
      completions: initialCompletions,
      budgetItems: initialBudgetItems,
      savingsScenarios: initialSavingsScenarios,
      birthListItems: initialBirthListItems,
      hydratedFromDemo: false,
      ready: true
    });
  }

  const profile = useFamilyFlowStore((s) => s.profile);
  const user = useFamilyFlowStore((s) => s.user);
  const visibleItems = navItems.filter((item) => {
    if (item.requiresExpectingBaby && !profile.household.isExpectingBaby) return false;
    if (item.requiresAdmin && !user?.isAdmin) return false;
    return true;
  });

  const bottomTabs = visibleItems.filter((item) => BOTTOM_TAB_HREFS.includes(item.href));
  const moreItems = visibleItems.filter((item) => !BOTTOM_TAB_HREFS.includes(item.href));
  const isMoreActive = !BOTTOM_TAB_HREFS.includes(pathname) && pathname.startsWith("/app");

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1640px] gap-4 px-3 py-3 md:px-4 lg:py-4 xl:grid-cols-[272px_minmax(0,1fr)] xl:gap-5 xl:px-5">
      {/* ── Sidebar (desktop only) ── */}
      <aside className="sticky top-3 hidden h-fit xl:block xl:top-4">
        <div className="rounded-[26px] border border-white/80 bg-white/90 p-3 shadow-[0_8px_32px_rgba(79,70,229,0.1),0_2px_8px_rgba(79,70,229,0.06)] backdrop-blur-xl">
          {/* Brand header */}
          <div className="mb-3 overflow-hidden rounded-[20px] bg-[linear-gradient(140deg,#1e1b4b_0%,#4338ca_35%,#7c3aed_60%,#0ea5e9_100%)] p-4 text-white shadow-[0_8px_24px_rgba(79,70,229,0.36)]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="text-base font-black">P</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Planille</p>
                <p className="text-sm font-bold leading-tight">Control Center</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-medium text-white/75 truncate">{profile.household.name}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1.5 overflow-x-auto pb-1 xl:grid xl:overflow-visible">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex shrink-0 items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-150 overflow-hidden",
                    active
                      ? `bg-gradient-to-r ${item.activeGradient} ${item.color} font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.08)]`
                      : "text-[#6b7280] hover:bg-[#f8f9ff] hover:text-[#1f2937]"
                  )}
                >
                  {/* Left border accent when active */}
                  {active && (
                    <span className={cn("absolute left-0 top-2 bottom-2 w-[3px] rounded-full", item.dot)} />
                  )}
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] transition-all duration-150",
                      active
                        ? `${item.bg} ${item.color} shadow-sm`
                        : "bg-gray-100 text-[#9ca3af] group-hover:bg-indigo-50 group-hover:text-indigo-400"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-3 space-y-1.5">
            <div className="rounded-[16px] border border-[#e0e7ff] bg-gradient-to-br from-indigo-50 to-violet-50 p-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-xs font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
                  {(user.displayName || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#1f2937]">{user.displayName || "Utilisateur"}</p>
                  <p className="truncate text-[10px] text-[#9ca3af]">{user.email}</p>
                </div>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="min-w-0 space-y-4 pb-24 xl:pb-4">
        <AppHeader />
        {children}
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#ebebf0] bg-white/97 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-lg items-center px-1 pb-safe-area-inset-bottom">
          {bottomTabs.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 transition-all"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200",
                    active ? `${item.bg} ${item.color} shadow-[0_2px_8px_rgba(0,0,0,0.1)] scale-105` : "text-[#a1a1aa]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-none tracking-tight",
                    active ? item.color : "text-[#a1a1aa]"
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <span className={cn("mt-0.5 h-1 w-4 rounded-full", item.dot)} />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5"
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200",
                isMoreActive ? "bg-gray-100 text-[#374151] scale-105 shadow-[0_2px_8px_rgba(0,0,0,0.1)]" : "text-[#a1a1aa]"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold leading-none tracking-tight",
                isMoreActive ? "text-[#374151]" : "text-[#a1a1aa]"
              )}
            >
              Plus
            </span>
            {isMoreActive && (
              <span className="mt-0.5 h-1 w-4 rounded-full bg-gray-400" />
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile "More" drawer ── */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-white shadow-2xl">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div>
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
                <p className="text-sm font-bold text-[#0f0e1a]">Navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-2 text-[#9ca3af] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav grid */}
            <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-[18px] border px-2 py-3.5 transition-all",
                      active
                        ? `border-transparent bg-gradient-to-br ${item.activeGradient} ${item.color}`
                        : "border-[#f3f4f6] bg-[#f9f9fb] text-[#6b7280]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-[14px]",
                        active ? `${item.bg} ${item.color}` : "bg-white text-[#9ca3af] shadow-sm"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-center text-[11px] font-semibold leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User info + sign out */}
            <div className="border-t border-[#f3f4f6] px-4 py-4">
              <div className="mb-3 flex items-center gap-3 rounded-[16px] border border-[#e0e7ff] bg-gradient-to-br from-indigo-50 to-violet-50 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-sm font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
                  {(user.displayName || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1f2937]">{user.displayName || "Utilisateur"}</p>
                  <p className="truncate text-xs text-[#9ca3af]">{user.email}</p>
                </div>
              </div>
              <SignOutButton />
            </div>

            {/* Safe area bottom padding */}
            <div className="h-safe-area-inset-bottom" />
          </div>
        </div>
      )}
    </div>
  );
}
