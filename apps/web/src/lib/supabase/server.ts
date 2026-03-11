import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // The current V1 does not persist auth mutations from server components yet.
        setAll: () => {}
      }
    }
  );
};
