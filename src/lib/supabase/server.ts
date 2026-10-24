import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireAuthConfiguration } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createClient() {
  const config = requireAuthConfiguration();
  const cookieStore = await cookies();
  return createServerClient<Database>(config.supabaseUrl, config.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. proxy.ts refreshes before rendering.
        }
      },
    },
  });
}
