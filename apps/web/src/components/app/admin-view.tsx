"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  CreditCard,
  Database,
  FileText,
  Globe,
  Home,
  LayoutGrid,
  Lock,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Users2,
  Wrench,
  XCircle,
  Zap
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* ─────────────────────────────────────────────────────
   Mock data – replace with real API calls in production
───────────────────────────────────────────────────── */
const kpis = [
  {
    label: "Utilisateurs actifs",
    value: "1 284",
    delta: "+12 % ce mois",
    positive: true,
    icon: Users2,
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100"
  },
  {
    label: "Foyers créés",
    value: "389",
    delta: "+7 % ce mois",
    positive: true,
    icon: Home,
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100"
  },
  {
    label: "MRR",
    value: "4 820 €",
    delta: "+18 % vs N-1",
    positive: true,
    icon: TrendingUp,
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100"
  },
  {
    label: "Exports PDF / mois",
    value: "2 741",
    delta: "+31 % ce mois",
    positive: true,
    icon: FileText,
    gradient: "from-pink-500/20 to-rose-500/10",
    iconColor: "text-pink-600",
    iconBg: "bg-pink-100"
  }
];

const mockUsers = [
  { id: "u1", name: "Sophie Martin", email: "sophie@example.com", plan: "family-pro", status: "active", household: "Famille Martin", joined: "02/01/2025" },
  { id: "u2", name: "Thomas Dubois", email: "thomas@example.com", plan: "plus", status: "active", household: "Foyer Dubois", joined: "15/01/2025" },
  { id: "u3", name: "Marie Leclerc", email: "marie@example.com", plan: "free", status: "active", household: "Leclerc & Co", joined: "20/01/2025" },
  { id: "u4", name: "Paul Renaud", email: "paul@example.com", plan: "plus", status: "suspended", household: "Renaud Family", joined: "03/02/2025" },
  { id: "u5", name: "Julie Bernard", email: "julie@example.com", plan: "family-pro", status: "active", household: "Les Bernard", joined: "10/02/2025" },
  { id: "u6", name: "Antoine Moreau", email: "antoine@example.com", plan: "free", status: "active", household: "Moreau House", joined: "14/02/2025" }
];

const featureFlags = [
  { key: "ai_assistant", label: "Assistant IA", description: "Génération de plannings via LLM", enabled: true, category: "IA" },
  { key: "birth_list", label: "Liste de naissance", description: "Module bébé et partage public", enabled: true, category: "Fonctionnel" },
  { key: "pdf_export", label: "Export PDF premium", description: "Génération PDF multi-thèmes", enabled: true, category: "Export" },
  { key: "budget_alerts", label: "Alertes budget", description: "Notifications dépassement de seuil", enabled: false, category: "Budget" },
  { key: "dark_mode", label: "Mode sombre", description: "Thème nuit pour l'app web", enabled: false, category: "UI" },
  { key: "mobile_push", label: "Push mobile", description: "Notifications push Expo", enabled: false, category: "Mobile" },
  { key: "stripe_billing", label: "Paiement Stripe", description: "Gestion abonnements live", enabled: false, category: "Paiement" },
  { key: "maintenance", label: "Mode maintenance", description: "Bannière maintenance utilisateurs", enabled: false, category: "Système" }
];

const activityFeed = [
  { type: "user", message: "Nouvel utilisateur inscrit : Sophie Martin", time: "il y a 3 min", icon: Users2, color: "text-violet-600", bg: "bg-violet-100" },
  { type: "export", message: "Export PDF généré (thème premium)", time: "il y a 11 min", icon: FileText, color: "text-pink-600", bg: "bg-pink-100" },
  { type: "payment", message: "Abonnement family-pro activé : Famille Martin", time: "il y a 22 min", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-100" },
  { type: "system", message: "Rebalancement IA déclenché (foyer Dubois)", time: "il y a 45 min", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-100" },
  { type: "export", message: "Export PDF généré (thème minimal)", time: "il y a 1 h", icon: FileText, color: "text-pink-600", bg: "bg-pink-100" },
  { type: "user", message: "Compte suspendu : paul@example.com", time: "il y a 2 h", icon: XCircle, color: "text-red-600", bg: "bg-red-100" }
];

const planColors: Record<string, string> = {
  "family-pro": "bg-violet-100 text-violet-700",
  plus: "bg-blue-100 text-blue-700",
  free: "bg-gray-100 text-gray-600"
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700"
};

/* ─────────────────────────────────────────────────────
   Toggle component (no external dep)
───────────────────────────────────────────────────── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
        enabled ? "bg-[var(--brand-primary)]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─────────────────────────────────────────────────────
   Main AdminView
───────────────────────────────────────────────────── */
export function AdminView() {
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(featureFlags.map((f) => [f.key, f.enabled]))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "flags" | "config">("overview");

  const toggleFlag = (key: string) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(15,15,40,0.96),rgba(79,60,200,0.92),rgba(56,130,220,0.86),rgba(46,197,161,0.78))] text-white">
        <div className="flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white/14 p-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <Badge className="bg-white/14 text-white shadow-none">Accès restreint</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Panel Admin</h1>
            <p className="max-w-xl text-sm leading-6 text-white/78">
              Console centralisée pour administrer Planille — utilisateurs, paiements, feature flags,
              configuration produit et supervision système.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/18">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            <Button variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/18">
              <Mail className="mr-2 h-4 w-4" />
              Envoyer newsletter
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Warning banner ── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>V1 interface.</strong> Les mutations backend (RBAC, audit log, billing provider Stripe) doivent être
            connectées pour un usage production. Les données affichées sont simulées.
          </p>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={`overflow-hidden bg-gradient-to-br ${kpi.gradient}`}>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2.5 ${kpi.iconBg}`}>
                    <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                  </div>
                  <span className={`text-xs font-semibold ${kpi.positive ? "text-emerald-600" : "text-red-500"}`}>
                    {kpi.delta}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--foreground)]">{kpi.value}</p>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">{kpi.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Tab nav ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
          { key: "users", label: "Utilisateurs", icon: Users2 },
          { key: "flags", label: "Feature flags", icon: Sliders },
          { key: "config", label: "Configuration", icon: Wrench }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "border-[var(--brand-primary)] bg-[rgba(53,89,230,0.1)] text-[var(--brand-primary)]"
                  : "border-transparent text-[var(--foreground-muted)] hover:border-[var(--border)] hover:bg-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Recent activity */}
          <Card>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[rgba(109,94,244,0.12)] p-2.5 text-[var(--brand-primary)]">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Activité récente</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">Derniers événements système</p>
                  </div>
                </div>
                <Badge>Live</Badge>
              </div>
              <div className="space-y-2">
                {activityFeed.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-2xl bg-[var(--card-muted)] px-4 py-3"
                    >
                      <div className={`mt-0.5 rounded-lg p-1.5 ${event.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${event.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.message}</p>
                        <p className="mt-0.5 text-xs text-[var(--foreground-subtle)]">{event.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* System health */}
          <div className="space-y-4">
            <Card>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Santé système</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">Infrastructure et services</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "API Next.js", status: "ok", latency: "82 ms" },
                    { label: "Supabase DB", status: "ok", latency: "24 ms" },
                    { label: "PDF renderer", status: "ok", latency: "340 ms" },
                    { label: "Stripe webhook", status: "degraded", latency: "—" }
                  ].map((svc) => (
                    <div key={svc.label} className="flex items-center justify-between rounded-2xl bg-[var(--card-muted)] px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {svc.status === "ok" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-sm font-medium">{svc.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--foreground-subtle)]">{svc.latency}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            svc.status === "ok" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {svc.status === "ok" ? "Opérationnel" : "Dégradé"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,240,255,0.92))]">
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Base de données</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">Supabase PostgreSQL</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Foyers", value: "389" },
                    { label: "Membres", value: "1 024" },
                    { label: "Tâches", value: "18 432" },
                    { label: "Exports", value: "2 741" }
                  ].map((row) => (
                    <div key={row.label} className="rounded-2xl bg-[var(--card-muted)] px-3 py-3 text-center">
                      <p className="text-xl font-bold text-[var(--foreground)]">{row.value}</p>
                      <p className="text-xs text-[var(--foreground-subtle)]">{row.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Users tab ── */}
      {activeTab === "users" && (
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
                  <Users2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Gestion des utilisateurs</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">{filteredUsers.length} utilisateurs affichés</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2.5">
                  <Search className="h-4 w-4 text-[var(--foreground-subtle)]" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 bg-transparent text-sm outline-none placeholder:text-[var(--foreground-subtle)]"
                  />
                </div>
                <Button variant="secondary" size="sm">
                  Exporter CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--card-muted)]">
                    <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Utilisateur</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Foyer</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Plan</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Statut</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Inscrit le</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-[var(--border)] transition hover:bg-[var(--card-muted)] ${
                        index === filteredUsers.length - 1 ? "border-0" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D5EF4,#00a9ff)] text-xs font-bold text-white">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-[var(--foreground-subtle)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[var(--foreground-muted)]">{user.household}</td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${planColors[user.plan]}`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[user.status]}`}>
                          {user.status === "active" ? "Actif" : "Suspendu"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[var(--foreground-muted)]">{user.joined}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-xl bg-[var(--card-muted)] px-3 py-1.5 text-xs font-semibold hover:bg-[rgba(53,89,230,0.1)] hover:text-[var(--brand-primary)] transition"
                          >
                            Voir
                          </button>
                          <button
                            type="button"
                            className="rounded-xl bg-[var(--card-muted)] px-3 py-1.5 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition"
                          >
                            {user.status === "active" ? "Suspendre" : "Réactiver"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-violet-600" />
                  <p className="font-semibold text-violet-800">Réinitialisation mdp</p>
                </div>
                <p className="text-sm text-violet-700">Envoyer un lien de reset à l'email de l'utilisateur sélectionné.</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold text-blue-800">Notification manuelle</p>
                </div>
                <p className="text-sm text-blue-700">Envoyer un message push ou email à un segment d'utilisateurs.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <p className="font-semibold text-emerald-800">Upgrade manuel</p>
                </div>
                <p className="text-sm text-emerald-700">Passer un utilisateur en plan supérieur sans paiement.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Feature flags tab ── */}
      {activeTab === "flags" && (
        <Card>
          <div className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[rgba(109,94,244,0.12)] p-2.5 text-[var(--brand-primary)]">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Feature flags</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Activer ou désactiver des modules sans redéploiement
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {featureFlags.map((flag) => (
                <div
                  key={flag.key}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-4 transition ${
                    flags[flag.key]
                      ? "border-[rgba(53,89,230,0.3)] bg-[linear-gradient(135deg,rgba(53,89,230,0.06),rgba(0,169,255,0.04))]"
                      : "border-[var(--border)] bg-white/60"
                  }`}
                >
                  <div className="mr-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{flag.label}</p>
                      <span className="rounded-full bg-[var(--card-muted)] px-2 py-0.5 text-xs text-[var(--foreground-subtle)]">
                        {flag.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">{flag.description}</p>
                  </div>
                  <Toggle enabled={flags[flag.key]} onChange={() => toggleFlag(flag.key)} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Config tab ── */}
      {activeTab === "config" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Paramètres globaux</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">Branding, langue, région</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Nom de l'application", value: "Planille" },
                  { label: "URL publique", value: "planille.app" },
                  { label: "Langue par défaut", value: "Français (fr)" },
                  { label: "Devise par défaut", value: "EUR €" },
                  { label: "Fuseau horaire", value: "Europe/Paris" }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-[var(--card-muted)] px-4 py-3">
                    <span className="text-sm text-[var(--foreground-muted)]">{item.label}</span>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-pink-100 p-2.5 text-pink-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Textes et messages</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">Contenu éditable en production</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Message de bienvenue", value: "Bienvenue dans votre foyer connecté" },
                  { label: "Texte bannière", value: "—" },
                  { label: "Email expéditeur", value: "hello@planille.app" },
                  { label: "Footer légal", value: "Planille SAS, Paris" }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-[var(--card-muted)] px-4 py-3">
                    <p className="text-xs font-semibold text-[var(--foreground-subtle)]">{item.label}</p>
                    <p className="mt-1 text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Plans et tarifs</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">Configuration des abonnements</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { plan: "free", price: "0 €/mois", features: "Accès basique, 1 foyer, 15 tâches" },
                  { plan: "plus", price: "4,99 €/mois", features: "Foyer illimité, PDF, assistant IA" },
                  { plan: "family-pro", price: "9,99 €/mois", features: "Tout Plus + alertes, export avancé" }
                ].map((plan) => (
                  <div key={plan.plan} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${planColors[plan.plan]}`}>
                        {plan.plan}
                      </span>
                      <span className="font-semibold">{plan.price}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--foreground-muted)]">{plan.features}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-2.5 text-red-600">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Actions système</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">Opérations critiques</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-left text-sm font-semibold hover:bg-[var(--card-muted)] transition"
                >
                  🔄 Vider le cache Redis
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-left text-sm font-semibold hover:bg-[var(--card-muted)] transition"
                >
                  📦 Exporter toutes les données (RGPD)
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-semibold text-amber-800 hover:bg-amber-100 transition"
                >
                  ⚠️ Passer en mode maintenance
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-left text-sm font-semibold hover:bg-[var(--card-muted)] transition"
                >
                  <BarChart3 className="mr-2 inline h-4 w-4 text-[var(--brand-primary)]" />
                  Voir analytics Posthog
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
