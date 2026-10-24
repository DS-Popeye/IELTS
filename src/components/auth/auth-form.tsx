"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, loginAction, registerAction, resetPasswordAction, type AuthActionState } from "@/lib/auth/actions";

type FormKind = "login" | "register" | "forgot" | "reset";
const initialState: AuthActionState = { status: "idle", message: "" };
const actions = { login: loginAction, register: registerAction, forgot: forgotPasswordAction, reset: resetPasswordAction };
const labels = { login: "Sign in", register: "Create approved account", forgot: "Send reset link", reset: "Update password" };

export function AuthForm({ kind, enabled, next = "/dashboard" }: { kind: FormKind; enabled: boolean; next?: string }) {
  const [state, action, pending] = useActionState(actions[kind], initialState);
  const needsPassword = kind !== "forgot";
  return (
    <form action={action} className="auth-form">
      <input type="hidden" name="next" value={next} />
      <fieldset disabled={!enabled || pending} className="auth-fieldset">
        {kind !== "reset" && <label className="field">Email address
          <input className="input" type="email" name="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" />
        </label>}
        {needsPassword && <label className="field">{kind === "reset" ? "New password" : "Password"}
          <input className="input" type="password" name="password" autoComplete={kind === "login" ? "current-password" : "new-password"} required minLength={kind === "login" ? 1 : 12} maxLength={128} placeholder={kind === "login" ? "Enter your password" : "At least 12 characters"} />
        </label>}
        {kind === "reset" && <label className="field">Confirm new password
          <input className="input" type="password" name="confirmation" autoComplete="new-password" required minLength={12} maxLength={128} />
        </label>}
        {kind === "login" && <Link href="/forgot-password" className="auth-forgot">Forgot password?</Link>}
        <button className="button button-primary auth-submit" type="submit">{pending ? "Please wait…" : labels[kind]}</button>
      </fieldset>
      {state.message && <p className={`form-message ${state.status === "error" ? "form-error" : "form-success"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
    </form>
  );
}
