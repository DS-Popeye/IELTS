import Link from "next/link";
import { Brand } from "@/components/ui/brand";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-top"><Brand /><p>A little focus. A world of possibility.</p><nav aria-label="Footer navigation"><Link href="/faq">FAQs</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></div>
      <div className="footer-bottom"><span>Aster · Temporary project branding · Phase 1 preview</span><span>Independent preparation platform. Not affiliated with IELTS.</span></div>
    </footer>
  );
}
