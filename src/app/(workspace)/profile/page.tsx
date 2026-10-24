import type { Metadata } from "next";
import { LogOut, ShieldCheck } from "lucide-react";
import { getWorkspaceContext } from "@/lib/auth/context";
import { logoutAction } from "@/lib/auth/actions";
import { ProfileForm } from "@/features/profile/profile-form";

export const metadata: Metadata = { title: "Profile & learning goals" };

export default async function ProfilePage() {
  const { mode, profile, user } = await getWorkspaceContext();
  return <div className="profile-page"><div className="page-heading"><div><p className="eyebrow">MAKE THIS SPACE YOUR OWN</p><h1>Your journey. Your direction.</h1><p className="muted">A few details to bring your learning goals into focus.</p></div><span className="tag tag-green"><ShieldCheck size={13} /> {mode === "demo" ? "Local demonstration" : "Private profile"}</span></div><ProfileForm mode={mode} profile={profile} />{mode === "connected" && <section className="panel account-session"><div><h2>Your session</h2><p className="muted">Signed in as {user?.email}</p></div><form action={logoutAction}><button className="button button-secondary" type="submit"><LogOut size={16} /> Sign out</button></form></section>}</div>;
}
