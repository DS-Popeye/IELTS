import Link from "next/link";
import { Sparkle } from "lucide-react";

type BrandProps = {
  compact?: boolean;
  href?: "/" | "/dashboard";
  onClick?: () => void;
};

export function Brand({ compact = false, href = "/", onClick }: BrandProps) {
  const destinationLabel = href === "/dashboard" ? "dashboard" : "home";
  return (
    <Link className="brand" href={href} onClick={onClick} aria-label={`Aster. ${compact ? "" : "IELTS Academic "}${destinationLabel}`}>
      <span className="brand-mark"><Sparkle size={25} strokeWidth={1.7} aria-hidden="true" /></span>
      <span><span className="brand-name">aster<span className="brand-period">.</span></span>{!compact && <span className="brand-caption">IELTS ACADEMIC</span>}</span>
    </Link>
  );
}
