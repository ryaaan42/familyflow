"use client";

import { useState, useTransition } from "react";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";
import type { AdminUserRow, SubscriptionPlan } from "@familyflow/shared";

import { toggleUserAdmin, updateUserPlan } from "@/lib/supabase/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const PLANS: SubscriptionPlan[] = ["free", "plus", "family-pro"];

const planColors: Record<string, string> = {
  "family-pro": "bg-violet-100 text-violet-700",
  plus: "bg-blue-100 text-blue-700",
  free: "bg-gray-100 text-gray-600"
};

const planLabels: Record<string, string> = {
  free: "Gratuit",
  plus: "Plus",
  "family-pro": "Family Pro"
};

interface Props {
  users: AdminUserRow[];
}

export function AdminUsersView({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<SubscriptionPlan | "all">("all");
  const [isPending, startTransition] = useTransition();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.householdName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || u.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  function handlePlanChange(userId: string, plan: SubscriptionPlan) {
    startTransition(async () => {
      await updateUserPlan(userId, plan);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan } : u)));
      setEditingPlan(null);
    });
  }

  function handleToggleAdmin(userId: string, currentIsAdmin: boolean) {
    startTransition(async () => {
      await toggleUserAdmin(userId, !currentIsAdmin);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isAdmin: !currentIsAdmin } : u))
      );
    });
  }

  return (
    <Card>
      <div className="space-y-5 p-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-[var(--foreground-subtle)] shrink-0" />
            <input
              type="text"
              placeholder="Nom, email ou foyer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 bg-transparent text-sm outline-none placeholder:text-[var(--foreground-subtle)]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", ...PLANS] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilterPlan(p)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  filterPlan === p
                    ? "border-[var(--brand-primary)] bg-[rgba(53,89,230,0.1)] text-[var(--brand-primary)]"
                    : "border-[var(--border)] text-[var(--foreground-muted)] hover:bg-white"
                }`}
              >
                {p === "all" ? "Tous les plans" : planLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--card-muted)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Utilisateur</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Foyer</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Plan</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Admin</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Inscrit le</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--foreground-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--foreground-subtle)]">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-[var(--border)] transition hover:bg-[var(--card-muted)] ${
                    i === filtered.length - 1 ? "border-0" : ""
                  }`}
                >
                  {/* User */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6D5EF4,#00a9ff)] text-xs font-bold text-white">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{user.displayName}</p>
                        <p className="text-xs text-[var(--foreground-subtle)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Household */}
                  <td className="px-4 py-3.5 text-[var(--foreground-muted)]">
                    {user.householdName ?? <span className="text-[var(--foreground-subtle)]">—</span>}
                  </td>
                  {/* Plan */}
                  <td className="px-4 py-3.5">
                    {editingPlan === user.id ? (
                      <div className="flex items-center gap-1.5">
                        {PLANS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            disabled={isPending}
                            onClick={() => handlePlanChange(user.id, p)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold border transition ${
                              user.plan === p
                                ? planColors[p] + " border-current"
                                : "border-[var(--border)] text-[var(--foreground-muted)] hover:bg-white"
                            }`}
                          >
                            {planLabels[p]}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setEditingPlan(null)}
                          className="text-xs text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingPlan(user.id)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${planColors[user.plan]} hover:opacity-80 transition`}
                        title="Cliquer pour modifier"
                      >
                        {planLabels[user.plan] ?? user.plan}
                      </button>
                    )}
                  </td>
                  {/* Admin badge */}
                  <td className="px-4 py-3.5">
                    {user.isAdmin ? (
                      <Badge className="bg-amber-100 text-amber-700 shadow-none">Admin</Badge>
                    ) : (
                      <span className="text-xs text-[var(--foreground-subtle)]">—</span>
                    )}
                  </td>
                  {/* Created at */}
                  <td className="px-4 py-3.5 text-[var(--foreground-muted)]">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                      title={user.isAdmin ? "Retirer le rôle admin" : "Passer admin"}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--card-muted)]"
                    >
                      {user.isAdmin ? (
                        <ShieldOff className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 text-violet-500" />
                      )}
                      {user.isAdmin ? "Retirer admin" : "Rendre admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
