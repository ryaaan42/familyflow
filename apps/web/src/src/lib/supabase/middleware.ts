import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSafeNextPath } from "@/lib/auth";

type CookieMutation = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieMutation[]) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.startsWith("/app");
  const isAuthRoute = pathname.startsWith("/auth");
  const canStayOnAuthRoute =
    pathname.startsWith("/auth/callback") || pathname.startsWith("/auth/update-password");

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    redirectUrl.searchParams.set(
      "next",
      getSafeNextPath(`${pathname}${request.nextUrl.search}`, "/app")
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute && !canStayOnAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getSafeNextPath(request.nextUrl.searchParams.get("next"), "/app");
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
};
