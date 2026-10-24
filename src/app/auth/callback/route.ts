import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthConfiguration } from "@/lib/env";
import { safeReturnPath } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  const config = getAuthConfiguration();
  if (!config.ready || !config.siteUrl) return new Response("Account services are not configured.", { status: 503 });
  const destination = (path: string) => NextResponse.redirect(new URL(path, config.siteUrl!), {
    headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
  });
  const code = request.nextUrl.searchParams.get("code");
  if (!code || code.length > 4096) return destination("/login?notice=auth-error");
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return destination("/login?notice=auth-error");
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: active, error: accessError } = await supabase.rpc("is_active_member");
  if (userError || !user?.email_confirmed_at || accessError || !active) {
    await supabase.auth.signOut();
    return destination("/auth/access-denied");
  }
  await supabase.rpc("record_security_event", { event_name: "login" });
  return destination(safeReturnPath(request.nextUrl.searchParams.get("next")));
}
