"use client";

import Link from "next/link";
import { useRef } from "react";
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

import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";

const navItems = [
  {
    href: "/app",
    label: "Dashboard",
    icon: LayoutDashboard,
    activeColor: "text-violet-600",
    activeBg: "bg-violet-100",
    activeGradient: "from-violet-500/20 to-purple-500/10"
  },
  {
    href: "/app/assistant",
    label: "Assistant IA",
    icon: BrainCircuit,
    activeColor: "text-blue-600",
    activeBg: "bg-blue-100",
    activeGradient: "from-blue-500/20 to-cyan-500/10"
  },
  {
    href: "/app/household",
    label: "Foyer",
    icon: Users,
    activeColor: "text-pink-600",
    activeBg: "bg-pink-100",
    activeGradient: "from-pink-500/20 to-rose-500/10"
  },
  {
    href: "/app/birth-list",
    label: "Naissance",
    icon: Baby,
    requiresExpectingBaby: true,
    activeColor: "text-rose-600",
    activeBg: "bg-rose-100",
    activeGradient: "from-rose-500/20 to-pink-500/10"
  },
  {
    href: "/app/tasks",
    label: "Tâches",
    icon: ListTodo,
    activeColor: "text-violet-600",
    activeBg: "bg-violet-100",
    activeGradient: "from-violet-500/20 to-indigo-500/10"
  },
  {
    href: "/app/budget",
    label: "Budget",
    icon: Coins,
    activeColor: "text-blue-600",
    activeBg: "bg-blue-100",
    activeGradient: "from-blue-500/20 to-sky-500/10"
  },

  {
    href: "/app/meals",
    label: "Repas",
    icon: UtensilsCrossed,
    activeColor: "text-orange-600",
    activeBg: "bg-orange-100",
    activeGradient: "from-orange-500/20 to-amber-500/10"
  },
  {
    href: "/app/shopping",
    label: "Courses",
    icon: ShoppingCart,
    activeColor: "text-lime-700",
    activeBg: "bg-lime-100",
    activeGradient: "from-lime-500/20 to-emerald-500/10"
  },
  {
    href: "/app/goals",
    label: "Objectifs",
    icon: Target,
    activeColor: "text-green-600",
    activeBg: "bg-green-100",
    activeGradient: "from-green-500/20 to-emerald-500/10"
  },
  {
    href: "/app/savings",
    label: "Économies",
    icon: Sparkles,
    activeColor: "text-emerald-600",
    activeBg: "bg-emerald-100",
    activeGradient: "from-emerald-500/20 to-teal-500/10"
  },
  {
    href: "/app/exports",
    label: "PDF",
    icon: FileSpreadsheet,
    activeColor: "text-amber-600",
    activeBg: "bg-amber-100",
    activeGradient: "from-amber-500/20 to-orange-500/10"
  },

  {
    href: "/app/subscription",
    label: "Abonnement",
    icon: CreditCard,
    activeColor: "text-indigo-700",
    activeBg: "bg-indigo-100",
    activeGradient: "from-indigo-500/20 to-violet-500/10"
  },
  {
    href: "/app/settings",
    label: "Paramètres",
    icon: Settings,
    activeColor: "text-gray-600",
    activeBg: "bg-gray-100",
    activeGradient: "from-gray-400/20 to-slate-400/10"
  },
  {
    href: "/app/admin",
    label: "Admin",
    icon: ShieldCheck,
    requiresAdmin: true,
    activeColor: "text-red-600",
    activeBg: "bg-red-100",
    activeGradient: "from-red-500/20 to-rose-500/10"
  }
];

interface AppShellProps {
  children: React.ReactNode;
  userProfile: UserProfile | null;
  householdProfile: HouseholdProfile;
}

export function AppShell({ children, userProfile, householdProfile }: AppShellProps) {
  const pathname = usePathname();
  const initialized = useRef(false);

  // Initialize store synchronously on first render with real user data (no demo data)
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
      tasks: [],
      completions: [],
      budgetItems: [],
      savingsScenarios: [],
      birthListItems: [],
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
    <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-5 px-3 py-4 md:px-5 lg:py-6 xl:grid-cols-[308px_minmax(0,1fr)] xl:gap-6 xl:px-6">
      <aside className="premium-shell sticky top-4 h-fit rounded-[30px] border border-[#d9e6ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,247,255,0.94))] p-4 shadow-[0_26px_70px_rgba(24,53,123,0.14)] backdrop-blur-xl md:p-5">
        {/* Brand header */}
        <div className="mb-5 rounded-[24px] border border-white/60 bg-[linear-gradient(140deg,rgba(53,89,230,0.92),rgba(109,94,244,0.86),rgba(0,169,255,0.82),rgba(46,197,161,0.76))] p-4 text-white shadow-[0_16px_40px_rgba(53,89,230,0.28)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Planille</p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Control Center</h1>
          <p className="mt-1.5 text-sm text-white/80">Pilotez votre vie de famille au quotidien.</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-300" />
            <span className="text-xs font-semibold text-white/70">
              {profile.household.name}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex shrink-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  active
                    ? `border-transparent bg-gradient-to-r ${item.activeGradient} ${item.activeColor} shadow-[0_8px_20px_rgba(0,0,0,0.08)]`
                    : "border-transparent text-[var(--foreground-muted)] hover:border-[#d9e6ff] hover:bg-white/90"
                )}
              >
                <span
                  className={cn(
                    "rounded-xl p-2 transition-all duration-200",
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

        {/* Plan upgrade card */}
        <div className="mt-5 rounded-[22px] border border-[#d6e4ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(235,245,255,0.92))] p-4 md:mt-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold">Plan Premium</p>
            <Badge variant="mint">Beta</Badge>
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
            Exports avancés, thèmes personnalisés et recommandations IA enrichies.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-[linear-gradient(135deg,#3559e6,#00a9ff)] px-3 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(53,89,230,0.26)] transition hover:-translate-y-0.5"
          >
            Découvrir le Premium
          </button>

          <SignOutButton />
        </div>
      </aside>
      <main className="min-w-0 space-y-5">
        <AppHeader />
        {children}
      </main>
    </div>
  );
}
