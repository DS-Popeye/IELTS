"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import { Save } from "lucide-react";
import type { Profile } from "@/lib/auth/context";
import { profileSchema, type ProfileValues } from "@/lib/auth/validation";
import { updateProfileAction, type ProfileActionState } from "./actions";
import "@/components/auth/auth.css";

const DEMO_KEY = "aster.demo-profile.v1";
const initialState: ProfileActionState = { status: "idle", message: "" };
const defaults: ProfileValues = { display_name: "", country: null, timezone: "UTC", language: "en", target_overall: null, exam_date: null, study_goal_minutes: 30 };

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("aster-demo-profile", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("aster-demo-profile", callback); };
}
function getSnapshot() {
  try { return window.localStorage.getItem(DEMO_KEY) ?? ""; } catch { return ""; }
}
function savedDemoValues(snapshot: string): ProfileValues {
  if (!snapshot) return defaults;
  try {
    const input = JSON.parse(snapshot);
    const parsed = profileSchema.safeParse({ ...input, country: input.country ?? "", target_overall: input.target_overall ?? "", exam_date: input.exam_date ?? "" });
    return parsed.success ? parsed.data : defaults;
  } catch { return defaults; }
}

export function ProfileForm({ mode, profile }: { mode: "demo" | "connected"; profile: Profile | null }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const values = mode === "connected" && profile ? profile : savedDemoValues(snapshot);
  const [state, action, pending] = useActionState(updateProfileAction, initialState);
  const [demoMessage, setDemoMessage] = useState<ProfileActionState>(initialState);
  const message = mode === "demo" ? demoMessage : state;

  function saveDemo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = profileSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) { setDemoMessage({ status: "error", message: parsed.error.issues[0].message }); return; }
    try {
      window.localStorage.setItem(DEMO_KEY, JSON.stringify(parsed.data));
      window.dispatchEvent(new Event("aster-demo-profile"));
      setDemoMessage({ status: "success", message: "Demo preferences saved on this browser only. No account or online profile was created." });
    } catch {
      setDemoMessage({ status: "error", message: "Your browser could not save these demo preferences. Check its storage settings." });
    }
  }

  function clearDemo() {
    try {
      window.localStorage.removeItem(DEMO_KEY);
      window.dispatchEvent(new Event("aster-demo-profile"));
      setDemoMessage({ status: "success", message: "Demo preferences cleared from this browser." });
    } catch { setDemoMessage({ status: "error", message: "Your browser could not clear its demo preferences." }); }
  }

  return <form className="profile-form" action={mode === "connected" ? action : undefined} onSubmit={mode === "demo" ? saveDemo : undefined}>
    {mode === "demo" && <div className="profile-demo-note"><strong>Demonstration preferences</strong><br />Anything you enter is saved only in this browser, separate from real accounts. Use example details when exploring.</div>}
    <div className="form-grid" key={mode === "demo" ? snapshot : profile?.user_id}>
      <label className="field">Display name<input className="input" name="display_name" autoComplete="nickname" maxLength={80} defaultValue={values.display_name} placeholder="How should we address you?" /></label>
      <label className="field">Country or region<input className="input" name="country" autoComplete="country-name" maxLength={80} defaultValue={values.country ?? ""} placeholder="Your country or region" /></label>
      <label className="field">Time zone<input className="input" name="timezone" required list="aster-timezones" maxLength={100} defaultValue={values.timezone} /><datalist id="aster-timezones"><option value="UTC" /><option value="Asia/Singapore" /><option value="Asia/Dhaka" /><option value="Asia/Kolkata" /><option value="Europe/London" /><option value="America/New_York" /><option value="Australia/Sydney" /></datalist><small>Use an IANA time zone, such as Asia/Singapore.</small></label>
      <label className="field">Preferred interface language<select className="input" name="language" defaultValue={values.language}><option value="en">English</option><option value="bn">বাংলা · Bengali</option></select><small>This saves your preference. Full interface translation is planned; exam content stays in English.</small></label>
      <label className="field">Target overall band<select className="input" name="target_overall" defaultValue={values.target_overall ?? ""}><option value="">Not set yet</option>{Array.from({ length: 17 }, (_, i) => 1 + i * .5).map((band) => <option key={band} value={band}>{band.toFixed(1)}</option>)}</select><small>A personal goal, not an assessed result.</small></label>
      <label className="field">Planned exam date<input className="input" name="exam_date" type="date" defaultValue={values.exam_date ?? ""} /><small>Optional. Set a date when you are ready.</small></label>
      <label className="field">Daily study goal (minutes)<input className="input" type="number" name="study_goal_minutes" min={5} max={480} step={1} required defaultValue={values.study_goal_minutes} /><small>A manageable goal helps you build a steady routine.</small></label>
    </div>
    {message.message && <p className={`form-message profile-form-status ${message.status === "error" ? "form-error" : "form-success"}`} role={message.status === "error" ? "alert" : "status"}>{message.message}</p>}
    <div className="profile-form-footer"><p>{mode === "demo" ? "Demo preferences stay on this device. You can clear them at any time." : "Your settings are private and belong to your account."}</p><div className="auth-compact-actions">{mode === "demo" && <button type="button" className="button button-secondary" onClick={clearDemo}>Clear demo data</button>}<button type="submit" className="button button-primary" disabled={pending}><Save size={16} aria-hidden="true" />{pending ? "Saving…" : mode === "demo" ? "Save demo preferences" : "Save changes"}</button></div></div>
  </form>;
}
