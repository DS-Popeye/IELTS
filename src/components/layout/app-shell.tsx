"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ArrowUpRight, ChevronRight, CircleHelp, FlaskConical, Menu, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { accountNavigation, navigationGroups } from "@/lib/navigation";

type AppShellProps = { children: React.ReactNode; mode: "demo" | "connected"; displayName: string | null; role: "student" | "admin" | null };

export function AppShell({ children, mode, displayName, role }: AppShellProps) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const navigation = [...navigationGroups.flatMap(group => group.items), ...accountNavigation];
  const activeLabel = navigation.find(item => pathname === item.href)?.label ?? "Workspace";

  const sidebar = (mobile = false) => (
    <>
      <div className="sidebar-brand"><Brand />{mobile && <button className="icon-button" aria-label="Close navigation" onClick={() => drawer.current?.close()}><X size={20} /></button>}</div>
      <div className="workspace-label"><span className="status-dot" /> Academic workspace <span className="tiny-badge">01</span></div>
      <nav className="sidebar-nav" aria-label={mobile ? "Mobile navigation" : "Main navigation"}>
        {navigationGroups.map(group => <div className="nav-group" key={group.title}><p className="nav-label">{group.title}</p>{group.items.map(item => <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? "active" : ""}`} aria-current={pathname === item.href ? "page" : undefined} onClick={() => drawer.current?.close()}><item.icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{item.label}</span>{pathname === item.href && <span className="active-dot" />}</Link>)}</div>)}
        <div className="nav-group account-nav"><p className="nav-label">SETTINGS</p>{accountNavigation.filter(item => item.href !== "/admin" || mode === "demo" || role === "admin").map(item => <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? "active" : ""}`} aria-current={pathname === item.href ? "page" : undefined} onClick={() => drawer.current?.close()}><item.icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{item.label}</span></Link>)}</div>
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><Sparkles size={19} strokeWidth={1.5} /><strong>Built around your potential.</strong><p>Your learning journey starts with a little intention.</p><Link href="/profile" onClick={() => drawer.current?.close()}>Set your goals <ArrowUpRight size={15} /></Link></div><Link className="sidebar-help" href="/faq"><CircleHelp size={17} /> Help & getting started <ArrowUpRight size={15} /></Link></div>
    </>
  );

  return (
    <div className="workspace-shell">
      <aside className="sidebar">{sidebar()}</aside>
      <dialog className="mobile-drawer" ref={drawer} aria-label="Workspace navigation" onClick={event => { if (event.target === event.currentTarget) drawer.current?.close(); }}>{sidebar(true)}</dialog>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => drawer.current?.showModal()}><Menu size={21} /></button><span className="breadcrumb-root">Workspace</span><ChevronRight size={14} className="breadcrumb-root" /><span>{activeLabel}</span></div>
          <div className="workspace-topbar-actions"><span className="private-label"><ShieldCheck size={14} /> {mode === "demo" ? "Foundation preview" : "Private workspace"}</span><ThemeToggle /><span className="topbar-separator" /><Link href="/profile" className="account-button" aria-label={`${displayName || (mode === "demo" ? "Demo workspace" : "Your account")} ? open your profile`}><span className="avatar"><UserRound size={18} /></span><span className="account-name">{displayName || (mode === "demo" ? "Demo workspace" : "Your account")}</span></Link></div>
        </header>
        {mode === "demo" && <div className="demo-banner" role="status"><FlaskConical size={15} aria-hidden="true" /><span><strong>Demonstration workspace.</strong> Explore the foundation. No real questions, scores, or learner records.</span><Link href="/login">About sign-in <ChevronRight size={14} /></Link></div>}
        <main className="workspace-content" id="main-content">{children}</main>
        <footer className="workspace-footer"><span>Aster · IELTS Academic</span><span>Phase 1 foundation <span className="footer-dot">·</span> <Link href="/privacy">Privacy</Link> <span className="footer-dot">·</span> <Link href="/terms">Terms</Link></span></footer>
      </div>
    </div>
  );
}
