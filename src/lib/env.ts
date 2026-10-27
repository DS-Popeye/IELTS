export type AppMode = "demo" | "connected";

type PublicEnvironment = {
  NEXT_PUBLIC_APP_MODE?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

function publicEnvironment(): PublicEnvironment {
  // Keep explicit references: Next.js only substitutes statically named public variables.
  return {
    NEXT_PUBLIC_APP_MODE: process.env.NEXT_PUBLIC_APP_MODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

export function validatedOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return null;
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isPublicSupabaseKey(value: string | undefined): boolean {
  if (!value || value.startsWith("sb_secret_")) return false;
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) return true;
  // Legacy anon keys are still supported. The Next.js configuration also checks
  // this before a build so an accidental NEXT_PUBLIC secret cannot be bundled.
  try {
    const parts = value.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "anon";
  } catch {
    return false;
  }
}

export function getAuthConfiguration(environment = publicEnvironment()) {
  const selected = environment.NEXT_PUBLIC_APP_MODE ?? "demo";
  const mode: AppMode = selected === "demo" ? "demo" : "connected";
  const supabaseUrl = validatedOrigin(environment.NEXT_PUBLIC_SUPABASE_URL);
  const siteUrl = validatedOrigin(environment.NEXT_PUBLIC_SITE_URL);
  const key = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ready = selected === "connected" && !!supabaseUrl && !!siteUrl && isPublicSupabaseKey(key);
  return { mode, ready, supabaseUrl, siteUrl, publishableKey: key ?? "" };
}

export function getAppMode(): AppMode {
  return getAuthConfiguration().mode;
}

export function authCookieOptions(siteUrl: string) {
  // Supabase SSR's browser client must read/write session cookies. HttpOnly
  // would break refresh and MFA; keep the cookies same-site and HTTPS-only on
  // deployed origins instead. Local HTTP development remains supported.
  return { path: "/", sameSite: "lax" as const, secure: siteUrl.startsWith("https://") };
}

export function requireAuthConfiguration() {
  const config = getAuthConfiguration();
  if (!config.ready || !config.supabaseUrl || !config.siteUrl) {
    throw new Error("Authentication is not configured. Set the public environment variables for connected mode.");
  }
  return { ...config, supabaseUrl: config.supabaseUrl, siteUrl: config.siteUrl };
}
