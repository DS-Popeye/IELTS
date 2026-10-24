import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { logoutAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Private workspace" };
export default function AccessDeniedPage() {
  return <AuthShell title="This space is private." description="Your account does not have access to this area, or the workspace connection is not ready. Contact the workspace owner if you believe you should have access.">
    <div className="auth-compact-actions"><form action={logoutAction}><button className="button button-primary" type="submit">Return to sign in</button></form><Link href="/" className="button button-secondary">Go to homepage</Link></div>
  </AuthShell>;
}
