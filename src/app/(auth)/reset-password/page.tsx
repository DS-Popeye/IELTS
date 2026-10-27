import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthSetupNotice, AuthShell } from "@/components/auth/auth-shell";
import { getAuthConfiguration } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a new password" };
export default async function ResetPasswordPage() {
  const config = getAuthConfiguration();
  let verifiedSession = false;
  if (config.ready) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const { data: active, error: accessError } = await supabase.rpc("is_active_member");
    verifiedSession = !userError && !!user?.email_confirmed_at && !accessError && !!active;
  }
  return <AuthShell title="A new password. A fresh start." description="Use a unique password of at least 12 characters. Changing it signs you out so you can sign in again securely.">
    {!config.ready && <AuthSetupNotice mode={config.mode} />}
    {config.ready && !verifiedSession && <div className="notice auth-setup"><p>Open the reset link in your email first, or sign in to change your own account password.</p><Link href="/forgot-password">Request a new reset link</Link></div>}
    <AuthForm kind="reset" enabled={config.ready && verifiedSession} />
    <p className="auth-alternate"><Link href="/login">Back to sign in</Link></p>
  </AuthShell>;
}
