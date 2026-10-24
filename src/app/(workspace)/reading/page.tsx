import type { Metadata } from "next";
import { ModuleOverview } from "@/features/modules/module-overview";

export const metadata: Metadata = { title: "Reading" };

export default function ReadingPage() {
  return <ModuleOverview slug="reading" />;
}
