import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ChartNoAxesCombined, Headphones, Mic, PenLine, Target } from "lucide-react";
import "@/features/modules/modules.css";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="phase-page">
      <div className="page-heading"><div><p className="eyebrow">Your learning space / Progress</p><h1>A clearer picture of progress.</h1><p className="muted">Your learning story will grow with every completed session.</p></div><span className="tag tag-muted">Foundation preview</span></div>
      <div className="analytics-placeholders" aria-label="Module result availability">
        {[{ name: "Reading", Icon: BookOpen }, { name: "Listening", Icon: Headphones }, { name: "Writing", Icon: PenLine }, { name: "Speaking", Icon: Mic }].map(({ name, Icon }) => (
          <section className="analytics-placeholder" key={name}><Icon size={21} strokeWidth={1.5} aria-hidden="true" /><p>{name}</p><strong aria-label="No estimated band">—</strong><span>Not enough data</span></section>
        ))}
      </div>
      <section className="panel phase-empty">
        <span className="empty-icon"><ChartNoAxesCombined size={30} strokeWidth={1.4} aria-hidden="true" /></span>
        <h2>Your progress starts with you.</h2><p>There are no practice results in this foundation release. Trends and estimated bands will appear only when supported by completed, evaluated sessions.</p><Link href="/profile" className="button button-primary">Set a learning goal <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
      <section className="panel phase-explainer"><Target size={25} strokeWidth={1.5} aria-hidden="true" /><div><h2>Useful insight, grounded in your work.</h2><p>Future reports will show module trends, practice history, and areas to revisit. A target band is your personal goal, not an assessment. Any future AI band estimate will be labeled experimental and non-official.</p></div></section>
    </div>
  );
}
