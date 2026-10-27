import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ logout: vi.fn(), pending: false, context: vi.fn() }));
vi.mock("@/lib/auth/actions", () => ({ logoutAction: mocks.logout }));
vi.mock("@/lib/auth/context", () => ({ getWorkspaceContext: mocks.context }));
vi.mock("react-dom", async importOriginal => ({
  ...await importOriginal<typeof import("react-dom")>(),
  useFormStatus: () => ({ pending: mocks.pending }),
}));

import { AccountMenu, type AccountMenuProps } from "../../src/components/layout/account-menu";
import WorkspaceLayout from "../../src/app/(workspace)/layout";

const student: AccountMenuProps = {
  mode: "connected", displayName: "Test Learner", email: "learner@example.invalid", role: "student",
};
const renderMenu = (props: Partial<AccountMenuProps> = {}) => renderToStaticMarkup(createElement(AccountMenu, { ...student, ...props }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.pending = false;
});

describe("account identity and privileged menu actions", () => {
  it("passes only the verified profile, email, and database role from the server layout", async () => {
    mocks.context.mockResolvedValue({
      mode: "connected", role: "student", profile: { display_name: "Verified profile name" },
      user: { email: "verified@example.invalid", user_metadata: { role: "admin", full_name: "Untrusted role claim" } },
    });
    const layout = await WorkspaceLayout({ children: null });
    expect(layout.props).toMatchObject({
      mode: "connected", displayName: "Verified profile name", email: "verified@example.invalid", role: "student",
    });
  });

  it("shows the member identity and sign-out action without administrator controls", () => {
    const html = renderMenu();
    expect(html).toContain("Test Learner");
    expect(html).toContain("learner@example.invalid");
    expect(html).toContain('href="/profile"');
    expect(html).toContain("Sign Out");
    expect(html).not.toContain('href="/admin"');
    expect(html).not.toContain("Administrator");
  });

  it("shows administrator controls only for a connected database admin", () => {
    const html = renderMenu({ role: "admin" });
    expect(html).toContain("Administrator");
    expect(html).toContain("Administration");
    expect(html).toContain('href="/admin"');
  });

  it("never grants a demo account administrator UI or pretends it has a session", () => {
    const html = renderMenu({ mode: "demo", role: "admin" });
    expect(html).toContain("Demo workspace");
    expect(html).toContain("Explore without an account");
    expect(html).toContain('href="/login"');
    expect(html).not.toContain("learner@example.invalid");
    expect(html).not.toContain("Administrator");
    expect(html).not.toContain('href="/admin"');
    expect(html).not.toContain("Sign Out");
  });

  it("does not invent an identity when the profile name or email is missing", () => {
    const html = renderMenu({ displayName: "  ", email: null, role: null });
    expect(html).toContain("Your account");
    expect(html).toContain("Signed-in account");
    expect(html).not.toContain('href="/admin"');
  });

  it("escapes display names and email instead of interpreting account data as markup", () => {
    const html = renderMenu({ displayName: '<img src=x onerror="alert(1)">', email: "<svg>@example.invalid" });
    expect(html).toContain("&lt;img");
    expect(html).toContain("&lt;svg&gt;@example.invalid");
    expect(html).not.toContain("<img");
  });

  it("disables duplicate sign-out submissions while the existing action is pending", () => {
    mocks.pending = true;
    const html = renderMenu();
    expect(html).toContain("Signing out…");
    expect(html).toMatch(/<button[^>]*role="menuitem"[^>]*disabled=""[^>]*aria-busy="true"/);
    expect(mocks.logout).not.toHaveBeenCalled();
  });
});
