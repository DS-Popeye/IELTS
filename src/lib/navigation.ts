import { BookOpen, Headphones, PenLine, Mic, LayoutDashboard, ChartNoAxesCombined, CalendarDays, Bookmark, UserRound, ShieldCheck, ClipboardCheck } from "lucide-react";

export const navigationGroups = [
  { title: "YOUR WORKSPACE", items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }] },
  { title: "BUILD YOUR SKILLS", items: [
    { label: "Reading", href: "/reading", icon: BookOpen, color: "sage" },
    { label: "Listening", href: "/listening", icon: Headphones, color: "blue" },
    { label: "Writing", href: "/writing", icon: PenLine, color: "peach" },
    { label: "Speaking", href: "/speaking", icon: Mic, color: "lilac" },
  ] },
  { title: "YOUR JOURNEY", items: [
    { label: "Mock tests", href: "/mock-tests", icon: ClipboardCheck },
    { label: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
    { label: "Study planner", href: "/planner", icon: CalendarDays },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  ] },
];

export const accountNavigation = [
  { label: "Profile & goals", href: "/profile", icon: UserRound },
  { label: "Administration", href: "/admin", icon: ShieldCheck },
];

export const learningModules = [
  { title: "Reading", href: "/reading", icon: BookOpen, color: "sage", description: "Find meaning. Read with purpose.", detail: "Passages · comprehension · strategy", phase: "Phase 2" },
  { title: "Listening", href: "/listening", icon: Headphones, color: "blue", description: "Tune in to the details that matter.", detail: "Audio · understanding · accuracy", phase: "Phase 2" },
  { title: "Writing", href: "/writing", icon: PenLine, color: "peach", description: "Give your ideas a stronger voice.", detail: "Task 1 · Task 2 · clear expression", phase: "Phase 3" },
  { title: "Speaking", href: "/speaking", icon: Mic, color: "lilac", description: "Build confidence, one thought at a time.", detail: "Fluency · vocabulary · expression", phase: "Phase 6" },
];
