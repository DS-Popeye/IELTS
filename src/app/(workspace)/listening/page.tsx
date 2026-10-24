import type { Metadata } from "next";
import { ModuleOverview } from "@/features/modules/module-overview";

export const metadata: Metadata = { title: "Listening" };

export default function ListeningPage() {
  return <ModuleOverview slug="listening" />;
}
