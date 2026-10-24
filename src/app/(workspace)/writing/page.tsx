import type { Metadata } from "next";
import { ModuleOverview } from "@/features/modules/module-overview";

export const metadata: Metadata = { title: "Writing" };

export default function WritingPage() {
  return <ModuleOverview slug="writing" />;
}
