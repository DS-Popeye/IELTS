import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthSetupNotice, AuthShell } from "@/components/auth/auth-shell";
import { googleLoginAction } from "@/lib/auth/actions";
import { safeReturnPath } from "@/lib/auth/validation";
import { getAuthConfiguration } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };
const notices: Record<string, string> = {
  "configuration": "Sign-in is awaiting the workspace owner’s connection setup.",
  "verify-email": "Verify your email address before signing in.",
  "auth-error": "That sign-in link could not be completed. Please try again.",
  "password-updated": "Your password was updated. Sign in with your new password.",
  "password-updated-signout-error": "Your password was updated, but signing out could not be confirmed. Retry sign-out from your profile before leaving this device.",
  "signed-out": "You have signed out of this browser.",
  "signout-error": "Sign-out could not be confirmed. Please try again from your profile.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ notice?: string; next?: string }> }) {
  const params = await searchParams;
  const config = getAuthConfiguration();
  const next = safeReturnPath(params.next);
  return <AuthShell title="A fresh start, every day." description="Sign in to your private learning space and keep your preparation moving.">
    {!config.ready && <AuthSetupNotice mode={config.mode} />}
    {params.notice && notices[params.notice] && <p className="form-message" role="status">{notices[params.notice]}</p>}
    <form action={googleLoginAction}><input type="hidden" name="next" value={next} /><button type="submit" disabled={!config.ready} className="button button-secondary auth-google"><span className="auth-google-letter" aria-hidden="true">G</span> Continue with Google</button></form>
    <div className="auth-divider">OR WITH YOUR EMAIL</div>
    <AuthForm kind="login" enabled={config.ready} next={next} />
    <p className="auth-alternate">Have an approved email? <Link href="/register">Create your account</Link></p>
    <p className="auth-alternate">Private access · Account approval required</p>
  </AuthShell>;
}
