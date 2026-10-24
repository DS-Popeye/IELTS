import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default function NotFound() {
  return <><PublicHeader /><main id="main-content" className="not-found-page"><Compass size={52} strokeWidth={1} /><p className="eyebrow">A SMALL DETOUR</p><h1>Let’s find your way back.</h1><p>This page isn’t part of your workspace.</p><Link href="/dashboard" className="button button-primary"><ArrowLeft size={17} /> Back to overview</Link></main><PublicFooter /></>;
}
