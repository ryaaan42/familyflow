"use server";

import type { SubscriptionPlan } from "@familyflow/shared";

import { createSupabaseServerClient } from "./server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!data?.is_admin) throw new Error("Accès refusé — rôle admin requis");
  return supabase;
}

export async function updateUserPlan(userId: string, plan: SubscriptionPlan) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("users")
    .update({ plan })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("users")
    .update({ is_admin: isAdmin })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function updateSiteContent(key: string, value: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("site_content")
    .update({ value })
    .eq("key", key);
  if (error) throw new Error(error.message);
}

export async function toggleFeatureFlag(key: string, enabled: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled })
    .eq("key", key);
  if (error) throw new Error(error.message);
}

export async function exportAllDataGdpr(): Promise<string> {
  const supabase = await requireAdmin();

  const [usersResult, householdsResult, tasksResult] = await Promise.all([
    supabase.from("users").select("id, email, display_name, plan, created_at"),
    supabase.from("households").select("id, name, owner_user_id, created_at").is("deleted_at", null),
    supabase.from("tasks").select("id, household_id, title, category, status, created_at").is("deleted_at", null)
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    users: usersResult.data ?? [],
    households: householdsResult.data ?? [],
    tasks: tasksResult.data ?? []
  };

  return JSON.stringify(exportData, null, 2);
}
