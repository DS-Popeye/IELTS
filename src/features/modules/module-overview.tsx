import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Headphones, Mic, PenLine, Sprout } from "lucide-react";
import { getLearningModule, type ModuleSlug } from "./catalog";
import "./modules.css";

const icons = { reading: BookOpen, listening: Headphones, writing: PenLine, speaking: Mic };

export function ModuleOverview({ slug }: { slug: ModuleSlug }) {
  const learningModule = getLearningModule(slug);
  const Icon = icons[slug];

  return (
    <div className="module-overview">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your learning space / {learningModule.eyebrow}</p>
          <h1>{learningModule.eyebrow.replace("Academic ", "")}</h1>
          <p className="muted">One skill. A little more confidence, every day.</p>
        </div>
        <span className="tag tag-muted">Foundation preview</span>
      </div>

      <section className={`module-detail-hero module-tone-${learningModule.color}`} aria-labelledby="module-title">
        <div className="module-detail-content">
          <span className="module-symbol"><Icon size={28} strokeWidth={1.6} aria-hidden="true" /></span>
          <p className="eyebrow">{learningModule.eyebrow}</p>
          <h2 id="module-title">{learningModule.title}</h2>
          <p>{learningModule.description}</p>
          <span className="module-release"><span aria-hidden="true" /> Coming in Phase {learningModule.phase}</span>
        </div>
        <div className="module-decor" aria-hidden="true">
          <div className="module-decor-ring" />
          <Icon size={104} strokeWidth={0.85} />
          <span className="module-decor-star">✦</span>
        </div>
      </section>

      <dl className="module-facts" aria-label="Planned mock format">
        {learningModule.facts.map((fact) => (
          <div className="module-fact" key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="module-lower-grid">
        <section className="panel" aria-labelledby="module-focus">
          <div className="panel-header"><h2 id="module-focus">A look at what’s ahead</h2><span className="tag tag-muted">Planned</span></div>
          <ul className="module-focus-list">
            {learningModule.focus.map((item, index) => (
              <li key={item.title}>
                <span className="module-focus-number">0{index + 1}</span>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel module-readiness" aria-labelledby="module-ready">
          <Sprout size={30} strokeWidth={1.4} aria-hidden="true" />
          <p className="eyebrow">Start with intention</p>
          <h2 id="module-ready">Your goal comes first.</h2>
          <p>You can set a target band, study goal, and exam date in your profile while your practice space takes shape.</p>
          <Link href="/profile" className="button button-primary">Set your learning goal <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/dashboard" className="text-link">Back to your dashboard</Link>
        </section>
      </div>

      <div className="roadmap-note module-availability" role="note">
        <CircleCheck size={18} aria-hidden="true" />
        <div><strong>{learningModule.preparation}</strong><p>{learningModule.note}</p></div>
      </div>
    </div>
  );
}
