"use client";

import { useRef } from "react";
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
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  UtensilsCrossed,
  Users
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

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1640px] gap-4 px-3 py-3 md:px-4 lg:py-4 xl:grid-cols-[272px_minmax(0,1fr)] xl:gap-5 xl:px-5">
      {/* ── Sidebar ── */}
      <aside className="sticky top-3 h-fit xl:top-4">
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

          {/* Navigation — scrollable on mobile, grid on xl */}
          <nav className="flex gap-1.5 overflow-x-auto pb-1 xl:grid xl:overflow-visible">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex shrink-0 items-center gap-2.5 rounded-[14px] border px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? `border-transparent bg-gradient-to-r ${item.activeGradient} ${item.color} font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.06)]`
                      : "border-transparent text-[#6b7280] hover:bg-gray-50 hover:text-[#1f2937] hover:border-[#f3f4f6]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] transition-all duration-150",
                      active
                        ? `${item.bg} ${item.color}`
                        : "bg-gray-100 text-[#9ca3af] group-hover:bg-gray-200 group-hover:text-[#6b7280]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span className={cn("ml-auto h-1.5 w-1.5 shrink-0 rounded-full", item.dot)} />
                  )}
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
      <main className="min-w-0 space-y-4">
        <AppHeader />
        {children}
      </main>
    </div>
  );
}
