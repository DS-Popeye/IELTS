import type { Metadata } from "next";
import { ModuleOverview } from "@/features/modules/module-overview";

export const metadata: Metadata = { title: "Speaking" };

export default function SpeakingPage() {
  return <ModuleOverview slug="speaking" />;
}
