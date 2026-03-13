import type { AdminStats, AdminUserRow, FeatureFlag, SiteContent, SubscriptionPlan } from "@familyflow/shared";

import { createSupabaseServerClient } from "./server";

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createSupabaseServerClient();

  const [usersResult, householdsResult, tasksResult, exportsResult] = await Promise.all([
    supabase.from("users").select("plan"),
    supabase.from("households").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("tasks").select("id", { count: "exact", head: true }),
    supabase.from("pdf_exports").select("id", { count: "exact", head: true })
  ]);

  const users = usersResult.data ?? [];
  const planBreakdown: Record<SubscriptionPlan, number> = { free: 0, plus: 0, "family-pro": 0 };
  for (const u of users) {
    const p = u.plan as SubscriptionPlan;
    if (p in planBreakdown) planBreakdown[p]++;
  }

  return {
    totalUsers: users.length,
    totalHouseholds: householdsResult.count ?? 0,
    totalTasks: tasksResult.count ?? 0,
    totalExports: exportsResult.count ?? 0,
    planBreakdown
  };
}

export async function getAllUsers(): Promise<AdminUserRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, display_name, plan, is_admin, created_at")
    .order("created_at", { ascending: false });

  if (error || !users) return [];

  // Fetch households owned by each user
  const userIds = users.map((u) => u.id as string);
  const { data: households } = await supabase
    .from("households")
    .select("owner_user_id, name")
    .in("owner_user_id", userIds)
    .is("deleted_at", null);

  const householdMap = new Map<string, string>();
  for (const h of households ?? []) {
    householdMap.set(h.owner_user_id as string, h.name as string);
  }

  return users.map((u) => ({
    id: u.id as string,
    email: u.email as string,
    displayName: u.display_name as string,
    plan: u.plan as SubscriptionPlan,
    isAdmin: (u.is_admin as boolean) ?? false,
    createdAt: u.created_at as string,
    householdName: householdMap.get(u.id as string)
  }));
}

export async function getSiteContent(): Promise<SiteContent[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .order("section")
    .order("key");

  if (error || !data) return [];

  return data.map((row) => ({
    key: row.key as string,
    label: row.label as string,
    value: row.value as string,
    section: row.section as string,
    updatedAt: row.updated_at as string
  }));
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("feature_flags")
    .select("*")
    .order("category")
    .order("key");

  if (error || !data) return [];

  return data.map((row) => ({
    key: row.key as string,
    label: row.label as string,
    description: row.description as string,
    category: row.category as string,
    enabled: row.enabled as boolean,
    updatedAt: row.updated_at as string
  }));
}
