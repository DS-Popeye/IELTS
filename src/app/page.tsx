import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Compass, Leaf, LockKeyhole, Sparkle, Sprout } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { LearningIllustration } from "@/components/ui/learning-illustration";
import { learningModules } from "@/lib/navigation";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content">
        <section className="landing-hero landing-container" aria-labelledby="hero-title">
          <div className="hero-copy"><span className="hero-label"><span className="status-dot" /> A FRESH PERSPECTIVE ON IELTS ACADEMIC</span><h1 id="hero-title">Big ambitions.<br />A <em>clearer path.</em></h1><p>A calm, focused space for what comes next. Bring your IELTS Academic journey together, one purposeful step at a time.</p><div className="hero-actions"><Link className="button button-primary button-large" href="/dashboard">Explore your workspace <ArrowUpRight size={19} /></Link><a className="hero-secondary" href="#approach">Discover the approach <ArrowDown size={16} /></a></div><div className="hero-note"><span className="mini-spark"><Sprout size={17} /></span><span>Start with intention. Grow at your own pace.</span></div></div>
          <LearningIllustration />
        </section>
        <div className="foundation-strip"><span className="tag tag-green">PHASE 1 PREVIEW</span><p>The foundation is here. Explore the interface and set your direction. Practice and AI features come later.</p><Link href="/faq">What’s included <ArrowRight size={14} /></Link></div>
        <section id="modules" className="landing-container landing-skills" aria-labelledby="skills-title">
          <div className="landing-section-heading"><div><p className="eyebrow">A BALANCED APPROACH</p><h2 id="skills-title">Four skills. <em>One connected journey.</em></h2></div><p>Give every part of your preparation<br className="desktop-break" /> a place to grow.</p></div>
          <div className="landing-skill-grid">{learningModules.map(module => <Link href={module.href} className="landing-skill" key={module.title}><span className={`skill-icon ${module.color}`}><module.icon size={25} strokeWidth={1.5} /></span><h3>{module.title}</h3><p>{module.description}</p><span className="landing-skill-link">Explore the space <ArrowUpRight size={16} /></span></Link>)}</div>
        </section>
        <section id="approach" className="approach-section" aria-labelledby="approach-title"><div className="landing-container approach-grid"><div className="approach-visual"><div className="approach-paper"><span className="paper-eyebrow"><Leaf size={16} /> A LITTLE INTENTION</span><span className="paper-title">Your future<br />is worth<br /><em>preparing for.</em></span><div className="paper-line" /><span className="paper-footnote">Make space for what matters.</span><Sparkle className="paper-star" size={43} strokeWidth={1} /></div><div className="approach-caption"><span>01 /</span> A more thoughtful way forward.</div></div><div className="approach-copy"><p className="eyebrow">DESIGNED AROUND YOU</p><h2 id="approach-title">A little structure.<br /><em>A lot of possibility.</em></h2><p className="approach-intro">Less noise, more direction. Aster is taking shape as a workspace where your goals guide the journey.</p><div className="approach-step"><span>01</span><div><h3>Start with your destination</h3><p>Set your target band, exam date and a daily study intention in your profile.</p></div></div><div className="approach-step"><span>02</span><div><h3>Find your focus</h3><p>Explore the four skill spaces and see how your future practice will fit together.</p></div></div><div className="approach-step"><span>03</span><div><h3>Let your work tell the story</h3><p>Progress insights will grow from actual completed practice, when the exam engines are ready.</p></div></div></div></div></section>
        <section className="landing-container principles-section"><div className="principle"><LockKeyhole size={23} strokeWidth={1.4} /><div><h3>Personal by design</h3><p>A private workspace with account boundaries built into the foundation.</p></div></div><div className="principle"><Compass size={24} strokeWidth={1.4} /><div><h3>Clear about what’s next</h3><p>Practice and AI capabilities are introduced in deliberate, validated phases.</p></div></div><div className="principle"><Check size={24} strokeWidth={1.4} /><div><h3>Grounded in your work</h3><p>No invented bands, progress charts or promises of an official IELTS score.</p></div></div></section>
        <section className="landing-container"><div className="landing-cta"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><h2>Begin with a little <em>clarity.</em></h2><p>Your learning space is ready to explore.</p><Link className="button button-light" href="/dashboard">Step into your workspace <ArrowUpRight size={18} /></Link></div><Sparkle size={150} strokeWidth={.6} aria-hidden="true" /></div></section>
      </main>
      <PublicFooter />
    </>
  );
}
