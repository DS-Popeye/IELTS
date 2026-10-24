import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthSetupNotice, AuthShell } from "@/components/auth/auth-shell";
import { getAuthConfiguration } from "@/lib/env";

export const metadata: Metadata = { title: "Reset your password" };
export default function ForgotPasswordPage() {
  const config = getAuthConfiguration();
  return <AuthShell title="Let’s get you back in." description="Enter your account email. We’ll send a secure link if password recovery is available for your account.">
    {!config.ready && <AuthSetupNotice mode={config.mode} />}
    <AuthForm kind="forgot" enabled={config.ready} />
    <p className="auth-alternate"><Link href="/login">Back to sign in</Link></p>
  </AuthShell>;
}
