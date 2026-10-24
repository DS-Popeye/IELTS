import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sprout } from "lucide-react";
import "@/features/modules/modules.css";

export const metadata: Metadata = { title: "Study planner" };

export default function PlannerPage() {
  return (
    <div className="phase-page">
      <div className="page-heading"><div><p className="eyebrow">Your learning space / Make a plan</p><h1>A little structure. More focus.</h1><p className="muted">Build a study rhythm that fits your life.</p></div><span className="tag tag-muted">Planned · Phase 7</span></div>
      <section className="panel phase-empty"><span className="empty-icon"><CalendarDays size={30} strokeWidth={1.5} aria-hidden="true" /></span><h2>Room for your next small step.</h2><p>Your study planner will live here in a later release. For now, choose a daily study goal and exam date in your profile.</p><Link href="/profile" className="button button-primary">Choose your study goal <ArrowRight size={16} aria-hidden="true" /></Link></section>
      <section className="panel phase-explainer"><Sprout size={28} strokeWidth={1.4} aria-hidden="true" /><div><h2>A plan that starts with your priorities.</h2><p>Scheduled practice, reminders, and personalized recommendations are planned for Phase 7. No calendar events, reminders, or study activities are created by this preview.</p></div></section>
    </div>
  );
}
