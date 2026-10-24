"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthConfiguration } from "@/lib/env";
import { emailSchema, formString, loginSchema, passwordChangeSchema, registrationSchema, safeReturnPath } from "./validation";

export type AuthActionState = { status: "idle" | "error" | "success"; message: string };
const unavailable: AuthActionState = { status: "error", message: "Sign-in is not connected yet. You can explore the demonstration workspace without an account." };

export async function loginAction(_previous: AuthActionState, form: FormData): Promise<AuthActionState> {
  if (!getAuthConfiguration().ready) return unavailable;
  const parsed = loginSchema.safeParse({ email: formString(form, "email"), password: formString(form, "password") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user?.email_confirmed_at) {
    if (data.session) await supabase.auth.signOut();
    return { status: "error", message: "Unable to sign in. Check your details and verify your email, then try again." };
  }
  const { data: active, error: accessError } = await supabase.rpc("is_active_member");
  if (accessError || !active) {
    await supabase.auth.signOut();
    return { status: "error", message: "This private workspace is available to approved accounts only." };
  }
  await supabase.rpc("record_security_event", { event_name: "login" });
  revalidatePath("/", "layout");
  redirect(safeReturnPath(formString(form, "next")));
}

export async function registerAction(_previous: AuthActionState, form: FormData): Promise<AuthActionState> {
  const config = getAuthConfiguration();
  if (!config.ready || !config.siteUrl) return unavailable;
  const parsed = registrationSchema.safeParse({ email: formString(form, "email"), password: formString(form, "password") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${config.siteUrl}/auth/callback` },
  });
  // The database rejects addresses outside the private allowlist. Use the same response
  // for denied/duplicate/accepted addresses so this form cannot enumerate membership.
  if (data.session) await supabase.auth.signOut();
  return { status: "success", message: "If your address is approved and registration is available, you will receive a verification email. Otherwise, contact the workspace owner." };
}

export async function googleLoginAction(form: FormData): Promise<void> {
  const config = getAuthConfiguration();
  if (!config.ready || !config.siteUrl) redirect("/login?notice=configuration");
  const supabase = await createClient();
  const next = safeReturnPath(formString(form, "next"));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${config.siteUrl}/auth/callback?next=${encodeURIComponent(next)}`, skipBrowserRedirect: true },
  });
  if (error || !data.url) redirect("/login?notice=auth-error");
  redirect(data.url);
}

export async function forgotPasswordAction(_previous: AuthActionState, form: FormData): Promise<AuthActionState> {
  const config = getAuthConfiguration();
  if (!config.ready || !config.siteUrl) return unavailable;
  const parsed = emailSchema.safeParse(formString(form, "email"));
  if (!parsed.success) return { status: "error", message: "Enter a valid email address." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${config.siteUrl}/auth/callback?next=/reset-password` });
  return { status: "success", message: "If an eligible account exists and email delivery is available, a password reset link will arrive shortly. Check your inbox and spam folder." };
}

export async function resetPasswordAction(_previous: AuthActionState, form: FormData): Promise<AuthActionState> {
  if (!getAuthConfiguration().ready) return unavailable;
  const parsed = passwordChangeSchema.safeParse({ password: formString(form, "password"), confirmation: formString(form, "confirmation") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: active } = await supabase.rpc("is_active_member");
  if (!user || !active) return { status: "error", message: "Open a valid reset link from your email before changing your password." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: "Your password could not be updated. Request a new reset link or verify your authenticator if your account uses two-step verification." };
  await supabase.rpc("record_security_event", { event_name: "password_updated" });
  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect("/login?notice=password-updated");
}

export async function logoutAction(): Promise<void> {
  if (getAuthConfiguration().ready) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.rpc("record_security_event", { event_name: "logout" });
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) redirect("/login?notice=signout-error");
  }
  revalidatePath("/", "layout");
  redirect("/login?notice=signed-out");
}
