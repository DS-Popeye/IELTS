"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button className="icon-button theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle light or dark theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      <Moon size={19} className="theme-light-icon" aria-hidden="true" />
      <Sun size={19} className="theme-dark-icon" aria-hidden="true" />
    </button>
  );
}
