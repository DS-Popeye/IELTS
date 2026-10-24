"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MfaForm({ initialFactorId }: { initialFactorId: string | null }) {
  const [factorId, setFactorId] = useState(initialFactorId);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function enroll() {
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      // Clean up only our own interrupted enrollment, never an already verified factor.
      const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw new Error("mfa");
      for (const factor of factors.all) {
        if (factor.status === "unverified" && factor.friendly_name === "Aster administrator") {
          const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
          if (error) throw new Error("mfa");
        }
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Aster administrator", issuer: "Aster" });
      if (error || !data) throw new Error("mfa");
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch {
      setMessage("Authenticator setup could not start. Refresh the page and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factorId || !/^\d{6}$/.test(code)) {
      setMessage("Enter the six-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
      if (error) throw new Error("mfa");
      const { data: allowed, error: accessError } = await supabase.rpc("has_admin_access");
      if (accessError || !allowed) throw new Error("mfa");
      await supabase.rpc("record_security_event", { event_name: "mfa_verified" });
      setSecret("");
      setQrCode("");
      window.location.assign("/admin");
    } catch {
      setCode("");
      setMessage("That code could not be verified. Check the current code and try again.");
      setBusy(false);
    }
  }

  return <div>
    {!factorId && <button className="button button-primary auth-submit" type="button" onClick={enroll} disabled={busy}>{busy ? "Starting setup…" : "Set up authenticator"}</button>}
    {qrCode && <><Image src={qrCode.startsWith("data:") ? qrCode : `data:image/svg+xml;utf-8,${encodeURIComponent(qrCode)}`} alt="Scan this code with your authenticator app" width={196} height={196} unoptimized className="auth-mfa-qr" /><details><summary>Enter the setup key manually</summary><code className="auth-mfa-secret">{secret}</code><p className="muted">Keep this key private. It is only displayed during this setup.</p></details></>}
    {factorId && <form onSubmit={verify} className="auth-form"><fieldset className="auth-fieldset" disabled={busy}><label className="field">Authenticator code<input className="input auth-mfa-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} type="text" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" required minLength={6} maxLength={6} /></label><button className="button button-primary auth-submit" type="submit">{busy ? "Verifying…" : "Verify and continue"}</button></fieldset></form>}
    {message && <p className="form-message form-error" role="alert">{message}</p>}
  </div>;
}
