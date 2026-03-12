import { NextRequest, NextResponse } from "next/server";

import { getSafeNextPath } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"), "/onboarding");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
  }

  const signInUrl = new URL("/auth/sign-in", requestUrl.origin);
  signInUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(signInUrl);
}
