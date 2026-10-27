"use client";

import { createBrowserClient } from "@supabase/ssr";
import { authCookieOptions, requireAuthConfiguration } from "@/lib/env";
import type { Database } from "@/types/database";

export function createClient() {
  const config = requireAuthConfiguration();
  return createBrowserClient<Database>(config.supabaseUrl, config.publishableKey, {
    cookieOptions: authCookieOptions(config.siteUrl),
  });
}
