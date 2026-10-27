import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions, getAuthConfiguration } from "@/lib/env";
import type { Database } from "@/types/database";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getAuthConfiguration();

  if (config.ready && config.supabaseUrl && config.siteUrl) {
    const pendingCookies = new Map<string, { value: string; options: CookieOptions }>();
    const supabase = createServerClient<Database>(config.supabaseUrl, config.publishableKey, {
      cookieOptions: authCookieOptions(config.siteUrl),
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            pendingCookies.set(name, { value, options });
          });
          response = NextResponse.next({ request });
          // A refresh may perform more than one cookie update. Preserve every
          // write (including deletion chunks), not just the final batch.
          pendingCookies.forEach(({ value, options }, name) => response.cookies.set(name, value, options));
        },
      },
    });
    // Refresh cookie sessions here. Every protected server render separately verifies getUser + membership.
    await supabase.auth.getClaims();
  }

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)"],
};
