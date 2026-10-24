import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/dm-serif-display/latin-400.css";
import "@fontsource/dm-serif-display/latin-400-italic.css";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: { default: "Aster — A clearer path to IELTS Academic", template: "%s | Aster" },
  description: "Your thoughtful IELTS Academic workspace. A private learning platform foundation for Reading, Listening, Writing and Speaking.",
  applicationName: "Aster",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><a href="#main-content" className="skip-link">Skip to content</a>{children}</ThemeProvider></body></html>;
}
