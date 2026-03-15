import type { AdminSetting, AdminStats, AdminUserRow, EmailTemplate, FeatureFlag, NewsletterCampaign, PromoCode, SiteContent, SubscriptionPlan, SubscriptionPlanConfig } from "@familyflow/shared";

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


export async function getAdminSettings(): Promise<AdminSetting[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_settings").select("*").order("section").order("key");
  if (error || !data) return [];
  return data.map((row) => ({
    key: row.key as string,
    label: row.label as string,
    value: row.value as string,
    section: row.section as string,
    isSecret: Boolean(row.is_secret)
  }));
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id as string,
    code: row.code as string,
    discountPercent: (row.discount_percent as number | null) ?? undefined,
    discountAmount: (row.discount_amount as number | null) ?? undefined,
    maxRedemptions: (row.max_redemptions as number | null) ?? undefined,
    redeemedCount: (row.redeemed_count as number) ?? 0,
    validUntil: (row.valid_until as string | null) ?? undefined,
    active: Boolean(row.active)
  }));
}

export async function getSubscriptionPlansConfig(): Promise<SubscriptionPlanConfig[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("subscription_plans").select("*").order("monthly_price_cents");
  if (error || !data) return [];
  return data.map((row) => ({
    key: row.key as string,
    label: row.label as string,
    stripePriceId: (row.stripe_price_id as string | null) ?? undefined,
    monthlyPriceCents: (row.monthly_price_cents as number) ?? 0,
    description: row.description as string,
    features: (row.features as string[]) ?? [],
    active: Boolean(row.active)
  }));
}


export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("email_templates").select("*").order("key");
  if (error || !data) return [];
  return data.map((row) => ({
    key: row.key as string,
    label: row.label as string,
    subject: row.subject as string,
    previewText: row.preview_text as string,
    htmlContent: row.html_content as string,
    updatedAt: row.updated_at as string
  }));
}

export async function getNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("newsletter_campaigns")
    .select("id, title, subject, preheader, html_content, status, recipient_count, sent_at, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    subject: row.subject as string,
    preheader: row.preheader as string,
    htmlContent: row.html_content as string,
    status: row.status as "draft" | "sent",
    recipientCount: (row.recipient_count as number) ?? 0,
    sentAt: (row.sent_at as string | null) ?? undefined,
    createdAt: row.created_at as string
  }));
}
