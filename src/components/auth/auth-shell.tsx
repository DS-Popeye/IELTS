import Link from "next/link";
import { ArrowUpRight, AudioLines, BookOpen, Check, Feather, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import "./auth.css";

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="auth-page" id="main-content">
    <aside className="auth-story" aria-label="About Aster">
      <Link href="/" className="auth-brand"><span className="auth-brand-mark"><Sparkles size={22} aria-hidden="true" /></span> aster<span className="auth-brand-period">.</span></Link>
      <div className="auth-story-copy"><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h1>Big ambitions.<br />A little focus,<br /><em>every day.</em></h1><p>A calm space to prepare for IELTS Academic, one meaningful step at a time.</p></div>
      <div className="auth-art" aria-hidden="true"><span className="auth-art-orbit" /><div className="auth-art-card"><span><BookOpen size={21} /> Read with purpose</span><i /><i /><i /><div className="auth-art-footer"><span><Check size={13} /> Your own pace</span><ArrowUpRight size={17} /></div></div><div className="auth-art-note"><Feather size={23} /><span>Room to grow.</span></div><div className="auth-art-audio"><AudioLines size={28} /></div></div>
      <p className="auth-story-foot">Independent preparation. Thoughtfully built.</p>
    </aside>
    <section className="auth-panel">
      <Link href="/" className="auth-back">← Back to Aster</Link>
      <div className="auth-card"><p className="eyebrow">IELTS ACADEMIC</p><h2>{title}</h2><p className="auth-description">{description}</p>{children}</div>
      <p className="auth-legal">By continuing, you acknowledge the <Link href="/terms">terms</Link> and <Link href="/privacy">privacy notice</Link>. Aster is not affiliated with IELTS.</p>
    </section>
  </main>;
}

export function AuthSetupNotice({ mode }: { mode: "demo" | "connected" }) {
  return <div className="notice auth-setup"><strong>{mode === "demo" ? "You’re viewing the foundation preview." : "Account services need configuration."}</strong><p>{mode === "demo" ? "Sign-in is not connected in this demonstration. Explore the workspace without creating an account." : "The workspace owner needs to finish the Supabase connection before sign-in becomes available."}</p>{mode === "demo" && <Link href="/dashboard">Explore the demo <ArrowUpRight size={15} aria-hidden="true" /></Link>}</div>;
}
