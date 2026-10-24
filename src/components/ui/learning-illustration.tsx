import { BookOpen, Compass, Headphones, Mic, PenLine, Sparkle } from "lucide-react";

export function LearningIllustration() {
  return (
    <div className="learning-illustration" aria-label="Illustration of the four IELTS Academic skills">
      <div className="illustration-orbit orbit-outer" /><div className="illustration-orbit orbit-inner" />
      <span className="orbit-star star-one"><Sparkle size={34} strokeWidth={1.2} /></span><span className="orbit-star star-two"><Sparkle size={18} strokeWidth={1.5} /></span>
      <div className="compass-core"><span className="compass-cross" /><Compass size={80} strokeWidth={.8} /><span>Find your direction.</span></div>
      <div className="orbit-skill orbit-reading"><span className="skill-icon sage"><BookOpen size={22} strokeWidth={1.6} /></span><div><strong>Reading</strong><span>See the bigger picture</span></div></div>
      <div className="orbit-skill orbit-listening"><span className="skill-icon blue"><Headphones size={22} strokeWidth={1.6} /></span><div><strong>Listening</strong><span>Discover the details</span></div></div>
      <div className="orbit-skill orbit-writing"><span className="skill-icon peach"><PenLine size={22} strokeWidth={1.6} /></span><div><strong>Writing</strong><span>Shape your ideas</span></div></div>
      <div className="orbit-skill orbit-speaking"><span className="skill-icon lilac"><Mic size={22} strokeWidth={1.6} /></span><div><strong>Speaking</strong><span>Find your voice</span></div></div>
      <span className="illustration-caption">FOUR SKILLS. ONE PERSONAL JOURNEY.</span>
    </div>
  );
}
