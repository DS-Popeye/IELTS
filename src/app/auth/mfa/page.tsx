import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthSetupNotice, AuthShell } from "@/components/auth/auth-shell";
import { MfaForm } from "@/components/auth/mfa-form";
import { getWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Two-step verification" };
export default async function MfaPage() {
  const context = await getWorkspaceContext();
  if (context.mode === "demo") return <AuthShell title="An extra layer of care." description="Administrator access uses an authenticator app for two-step verification."><AuthSetupNotice mode="demo" /><Link className="button button-secondary" href="/dashboard">Back to the demo</Link></AuthShell>;
  if (context.role !== "admin") redirect("/auth/access-denied");
  const supabase = await createClient();
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === "aal2") redirect("/admin");
  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((item) => item.status === "verified");
  return <AuthShell title={factor ? "One more step." : "Protect your workspace."} description={factor ? "Enter the current six-digit code from your authenticator app to open the administrator area." : "Set up an authenticator app. Administrator access requires two-step verification on every session."}>
    {error ? <p className="form-message form-error" role="alert">Verification services could not be reached. Refresh to try again.</p> : <MfaForm initialFactorId={factor?.id ?? null} />}
    <p className="auth-alternate"><Link href="/dashboard">Return to dashboard</Link></p>
  </AuthShell>;
}
