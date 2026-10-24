import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAuthConfiguration, type AppMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type WorkspaceContext = {
  mode: AppMode;
  user: User | null;
  profile: Profile | null;
  role: "student" | "admin" | null;
};

export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext> => {
  const config = getAuthConfiguration();
  if (config.mode === "demo") return { mode: "demo", user: null, profile: null, role: null };
  if (!config.ready) redirect("/login?notice=configuration");

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/login?notice=verify-email");

  const { data: active, error: accessError } = await supabase.rpc("is_active_member");
  if (accessError || !active) redirect("/auth/access-denied");

  const [profileResult, roleResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).single(),
  ]);
  if (profileResult.error || roleResult.error || !profileResult.data || !roleResult.data) {
    redirect("/auth/access-denied");
  }
  return { mode: "connected", user, profile: profileResult.data, role: roleResult.data.role };
});

export async function requireAdmin(): Promise<WorkspaceContext> {
  const context = await getWorkspaceContext();
  // Demo is an empty navigation preview, never an authenticated or privileged session.
  if (context.mode === "demo") return context;
  if (context.role !== "admin") redirect("/auth/access-denied");
  const supabase = await createClient();
  const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || assurance?.currentLevel !== "aal2") redirect("/auth/mfa");
  const { data: allowed, error: accessError } = await supabase.rpc("has_admin_access");
  if (accessError || !allowed) redirect("/auth/access-denied");
  return context;
}
