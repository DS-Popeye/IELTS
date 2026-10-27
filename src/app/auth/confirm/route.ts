import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAuthConfiguration } from "@/lib/env";
import { safeReturnPath } from "@/lib/auth/validation";

const allowedTypes: EmailOtpType[] = ["signup", "email", "recovery", "invite"];

export async function GET(request: NextRequest) {
  const config = getAuthConfiguration();
  if (!config.ready || !config.siteUrl) return new Response("Account services are not configured.", { status: 503 });
  const destination = (path: string) => NextResponse.redirect(new URL(path, config.siteUrl!), {
    headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
  });
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  if (!token_hash || token_hash.length > 4096 || !type || !allowedTypes.includes(type)) return destination("/login?notice=auth-error");
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });
  if (error) return destination("/login?notice=auth-error");
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: active, error: accessError } = await supabase.rpc("is_active_member");
  if (userError || !user?.email_confirmed_at || accessError || !active) {
    await supabase.auth.signOut();
    return destination("/auth/access-denied");
  }
  return destination(type === "recovery" ? "/reset-password" : safeReturnPath(request.nextUrl.searchParams.get("next")));
}
