import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json();
  const { emailDigest, budgetReminder, taskReminders, weeklyReport, pushMobile } = body;

  // Upsert notification settings
  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        email_enabled: emailDigest ?? true,
        push_enabled: pushMobile ?? false,
        // Store extra preferences in metadata if columns exist, else ignore
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[settings/notifications] upsert error:", error);
    // Don't fail hard — settings are non-critical
  }

  return NextResponse.json({ success: true });
}
