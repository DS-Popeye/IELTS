import { AppShell } from "@/components/layout/app-shell";
import { getWorkspaceContext } from "@/lib/auth/context";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const context = await getWorkspaceContext();
  return <AppShell mode={context.mode} displayName={context.profile?.display_name ?? null} email={context.user?.email ?? null} role={context.role}>{children}</AppShell>;
}
