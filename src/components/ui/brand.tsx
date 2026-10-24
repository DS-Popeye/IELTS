import Link from "next/link";
import { Sparkle } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Aster home">
      <span className="brand-mark"><Sparkle size={25} strokeWidth={1.7} aria-hidden="true" /></span>
      <span><span className="brand-name">aster<span className="brand-period">.</span></span>{!compact && <span className="brand-caption">IELTS ACADEMIC</span>}</span>
    </Link>
  );
}
