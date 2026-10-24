import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Brand />
        <nav className="public-nav" aria-label="Website navigation">
          <Link href="/#approach">The approach</Link>
          <Link href="/#modules">Explore skills</Link>
          <Link href="/faq">FAQs</Link>
        </nav>
        <div className="header-actions"><ThemeToggle /><Link className="sign-in-link" href="/login">Sign in</Link><Link className="button button-primary button-small" href="/dashboard">Explore workspace <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </div>
    </header>
  );
}
