import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthSetupNotice, AuthShell } from "@/components/auth/auth-shell";
import { getAuthConfiguration } from "@/lib/env";

export const metadata: Metadata = { title: "Create your account" };
export default function RegisterPage() {
  const config = getAuthConfiguration();
  return <AuthShell title="Your space to grow." description="Create an account with the email approved by your workspace owner. Registration is private.">
    {!config.ready && <AuthSetupNotice mode={config.mode} />}
    <AuthForm kind="register" enabled={config.ready} />
    <p className="auth-alternate">Already have an account? <Link href="/login">Sign in</Link></p>
  </AuthShell>;
}
