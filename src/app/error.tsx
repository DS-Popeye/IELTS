"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="not-found-page" id="main-content"><p className="eyebrow">LET’S TRY THAT AGAIN</p><h1>This page couldn’t be loaded.</h1><p>Your connection or workspace configuration may need attention. Please retry or return home.</p><div className="button-row"><button className="button button-primary" onClick={reset}><RefreshCw size={16} /> Try again</button><Link className="button button-secondary" href="/">Return home</Link></div></main>;
}
