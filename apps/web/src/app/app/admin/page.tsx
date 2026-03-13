import { FileText, Home, Shield, TrendingUp, Users2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getAdminStats } from "@/lib/supabase/admin-queries";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const kpis = [
    {
      label: "Utilisateurs",
      value: stats.totalUsers.toLocaleString("fr-FR"),
      icon: Users2,
      gradient: "from-violet-500/20 to-purple-500/10",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600"
    },
    {
      label: "Foyers actifs",
      value: stats.totalHouseholds.toLocaleString("fr-FR"),
      icon: Home,
      gradient: "from-blue-500/20 to-cyan-500/10",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Tâches créées",
      value: stats.totalTasks.toLocaleString("fr-FR"),
      icon: TrendingUp,
      gradient: "from-emerald-500/20 to-teal-500/10",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      label: "Exports PDF",
      value: stats.totalExports.toLocaleString("fr-FR"),
      icon: FileText,
      gradient: "from-pink-500/20 to-rose-500/10",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600"
    }
  ];

  const planLabels: Record<string, string> = {
    free: "Gratuit",
    plus: "Plus",
    "family-pro": "Family Pro"
  };

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    plus: "bg-blue-100 text-blue-700",
    "family-pro": "bg-violet-100 text-violet-700"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6D5EF4,#00a9ff)]">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vue d&apos;ensemble</h1>
          <p className="text-sm text-[var(--foreground-muted)]">Métriques en temps réel depuis Supabase</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={`overflow-hidden bg-gradient-to-br ${kpi.gradient}`}>
              <div className="p-5">
                <div className={`inline-flex rounded-xl p-2.5 ${kpi.iconBg}`}>
                  <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight">{kpi.value}</p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">{kpi.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Plan breakdown */}
      <Card>
        <div className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Répartition des plans</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(stats.planBreakdown).map(([plan, count]) => {
              const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
              return (
                <div key={plan} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${planColors[plan]}`}>
                      {planLabels[plan] ?? plan}
                    </span>
                    <span className="text-sm font-semibold text-[var(--foreground-muted)]">{pct}%</span>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">utilisateurs</p>
                  <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        plan === "family-pro" ? "bg-violet-500" : plan === "plus" ? "bg-blue-500" : "bg-gray-300"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/app/admin/users", label: "Gérer les utilisateurs", desc: "Voir, modifier les plans, statuts", color: "violet" },
          { href: "/app/admin/content", label: "Éditer le contenu", desc: "Textes marketing et messages app", color: "blue" },
          { href: "/app/admin/flags", label: "Feature flags", desc: "Activer / désactiver des modules", color: "emerald" }
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block rounded-2xl border border-[var(--border)] bg-white p-5 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold">{link.label}</p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">{link.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
