import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bookmark, BookOpen } from "lucide-react";
import "@/features/modules/modules.css";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return (
    <div className="phase-page">
      <div className="page-heading"><div><p className="eyebrow">Your learning space / Saved for later</p><h1>Keep the useful things close.</h1><p className="muted">A future home for the questions and ideas you want to revisit.</p></div><span className="tag tag-muted">Foundation preview</span></div>
      <section className="panel phase-empty"><span className="empty-icon"><Bookmark size={30} strokeWidth={1.5} aria-hidden="true" /></span><h2>Your collection begins here.</h2><p>Once practice content is available, you’ll be able to save questions to return to. There are no saved questions in this release.</p><Link href="/reading" className="button button-primary">Explore Reading <ArrowRight size={16} aria-hidden="true" /></Link></section>
      <section className="panel phase-explainer"><BookOpen size={25} strokeWidth={1.5} aria-hidden="true" /><div><h2>Save with purpose.</h2><p>Bookmarking will arrive alongside the practice engines. This page is a layout preview and does not create or store bookmarks.</p></div></section>
    </div>
  );
}
