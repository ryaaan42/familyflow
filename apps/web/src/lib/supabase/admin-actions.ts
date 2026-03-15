"use server";

import type { SubscriptionPlan } from "@familyflow/shared";

import { createSupabaseServerClient, createSupabaseServiceClient } from "./server";

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


export async function clearApplicationCache() {
  await requireAdmin();
  // NOTE: This project relies on the `pages/` router, where `next/cache`
  // invalidation APIs (`revalidatePath` / `revalidateTag`) are not supported.
  // The admin UI does a client-side refresh after this action.
  return { ok: true };
}
export async function updateAdminSetting(key: string, value: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("site_settings").update({ value }).eq("key", key);
  if (error) throw new Error(error.message);
}

export async function createPromoCode(input: {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  maxRedemptions?: number;
  validUntil?: string;
}) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("promo_codes").insert({
    code: input.code.toUpperCase(),
    discount_percent: input.discountPercent ?? null,
    discount_amount: input.discountAmount ?? null,
    max_redemptions: input.maxRedemptions ?? null,
    valid_until: input.validUntil ?? null
  });
  if (error) throw new Error(error.message);
}

export async function togglePromoCode(id: string, active: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("promo_codes").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateSubscriptionPlanConfig(
  key: string,
  updates: { monthlyPriceCents?: number; stripePriceId?: string; description?: string; features?: string[]; active?: boolean }
) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("subscription_plans").update({
    monthly_price_cents: updates.monthlyPriceCents,
    stripe_price_id: updates.stripePriceId,
    description: updates.description,
    features: updates.features,
    active: updates.active
  }).eq("key", key);
  if (error) throw new Error(error.message);
}


export async function updateEmailTemplate(input: { key: string; subject: string; previewText: string; htmlContent: string }) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("email_templates")
    .update({
      subject: input.subject,
      preview_text: input.previewText,
      html_content: input.htmlContent
    })
    .eq("key", input.key);

  if (error) throw new Error(error.message);
}

export async function saveNewsletterCampaign(input: {
  id?: string;
  title: string;
  subject: string;
  preheader: string;
  htmlContent: string;
}) {
  const supabase = await requireAdmin();

  if (input.id) {
    const { error } = await supabase
      .from("newsletter_campaigns")
      .update({
        title: input.title,
        subject: input.subject,
        preheader: input.preheader,
        html_content: input.htmlContent
      })
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { data: authData } = await supabase.auth.getUser();
  const { error } = await supabase.from("newsletter_campaigns").insert({
    title: input.title,
    subject: input.subject,
    preheader: input.preheader,
    html_content: input.htmlContent,
    created_by: authData.user?.id ?? null
  });

  if (error) throw new Error(error.message);
}

export async function sendNewsletterCampaign(id: string) {
  const supabase = await requireAdmin();

  const { data: campaign, error: campaignError } = await supabase
    .from("newsletter_campaigns")
    .select("id, title, subject, preheader, html_content, status")
    .eq("id", id)
    .maybeSingle();

  if (campaignError || !campaign) throw new Error(campaignError?.message ?? "Campagne introuvable");
  if (campaign.status === "sent") throw new Error("Campagne déjà envoyée");

  const service = createSupabaseServiceClient();
  const { data: recipients, error: recipientsError } = await service
    .from("users")
    .select("email, display_name")
    .eq("newsletter_opt_in", true);

  if (recipientsError) throw new Error(recipientsError.message);

  const recipientCount = recipients?.length ?? 0;

  const { error: updateError } = await supabase
    .from("newsletter_campaigns")
    .update({
      status: "sent",
      recipient_count: recipientCount,
      sent_at: new Date().toISOString()
    })
    .eq("id", id);

  if (updateError) throw new Error(updateError.message);

  // TODO: brancher un provider email (Resend/Postmark/Brevo) pour l'envoi réel.
  return {
    campaign: {
      id: campaign.id as string,
      subject: campaign.subject as string,
      title: campaign.title as string
    },
    recipientCount
  };
}
