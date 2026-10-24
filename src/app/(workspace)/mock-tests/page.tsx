import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Mic, PenLine, ShieldCheck } from "lucide-react";
import { learningModules } from "@/features/modules/catalog";
import "@/features/modules/modules.css";

export const metadata: Metadata = { title: "Mock tests" };
const icons = { reading: BookOpen, listening: Headphones, writing: PenLine, speaking: Mic };

export default function MockTestsPage() {
  return (
    <div className="phase-page">
      <div className="page-heading">
        <div><p className="eyebrow">Your learning space / Exam preparation</p><h1>Mock tests</h1><p className="muted">Bring your preparation together, one focused session at a time.</p></div>
        <span className="tag tag-muted">Foundation preview</span>
      </div>
      <section className="panel phase-explainer">
        <ShieldCheck size={30} strokeWidth={1.5} aria-hidden="true" />
        <div><h2>Your exam space is taking shape.</h2><p>Timed mocks will bring together approved content, saved answers, and distraction-free practice. No tests are available in Phase 1. Explore the planned formats below while you set your learning goals.</p></div>
      </section>
      <div className="phase-card-grid">
        {learningModules.map((module) => {
          const Icon = icons[module.slug];
          return (
            <article className="phase-card" key={module.slug}>
              <div className="phase-card-top"><span className={`phase-card-icon module-tone-${module.color}`}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></span><span className="tag tag-muted">Planned · Phase {module.phase}</span></div>
              <div><h2>{module.eyebrow.replace("Academic ", "")}</h2><p>{module.description}</p></div>
              <div className="phase-card-footer"><span>{module.facts.slice(0, 2).map((fact) => `${fact.value} ${fact.label.replace("per full mock", "").replace("in the planned mock", "").replace("full mock duration", "").replace("shared writing time", "writing time")}`).join(" · ")}</span><Link href={`/${module.slug}`} className="text-link">View overview <ArrowRight size={14} aria-hidden="true" /></Link></div>
            </article>
          );
        })}
      </div>
      <p className="phase-inline-note">These are planned IELTS-style practice formats, not official exams. No attempts, scores, or question sets have been created.</p>
    </div>
  );
}
