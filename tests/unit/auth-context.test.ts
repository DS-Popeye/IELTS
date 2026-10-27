import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: vi.fn(), client: vi.fn(), user: vi.fn(), rpc: vi.fn(), from: vi.fn(), assurance: vi.fn(),
  redirect: vi.fn((path: string): never => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ getAuthConfiguration: mocks.config }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { getWorkspaceContext, requireAdmin } from "../../src/lib/auth/context";

const account = { id: "synthetic-user-a", email_confirmed_at: "2026-10-25T00:00:00Z" };
let currentRole: "student" | "admin" = "student";
let profileAvailable = true;

beforeEach(() => {
  vi.clearAllMocks();
  currentRole = "student";
  profileAvailable = true;
  mocks.config.mockReturnValue({ mode: "connected", ready: true });
  mocks.user.mockResolvedValue({ data: { user: account }, error: null });
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  mocks.assurance.mockResolvedValue({ data: { currentLevel: "aal1" }, error: null });
  mocks.from.mockImplementation((table: string) => ({
    select: () => ({ eq: () => ({ single: async () => table === "user_roles"
      ? { data: { role: currentRole }, error: null }
      : { data: profileAvailable ? { user_id: account.id, display_name: "" } : null, error: profileAvailable ? null : { message: "denied" } } }) }),
  }));
  mocks.client.mockResolvedValue({ auth: { getUser: mocks.user, mfa: { getAuthenticatorAssuranceLevel: mocks.assurance } }, rpc: mocks.rpc, from: mocks.from });
});

describe("server workspace authorization", () => {
  it("returns an empty preview without a provider session in demo mode", async () => {
    mocks.config.mockReturnValue({ mode: "demo", ready: false });
    expect(await getWorkspaceContext()).toEqual({ mode: "demo", user: null, profile: null, role: null });
    expect(mocks.client).not.toHaveBeenCalled();
  });

  it("fails closed when connected configuration is missing", async () => {
    mocks.config.mockReturnValue({ mode: "connected", ready: false });
    await expect(getWorkspaceContext()).rejects.toThrow("REDIRECT:/login?notice=configuration");
    expect(mocks.client).not.toHaveBeenCalled();
  });

  it("requires a verified provider session before checking private rows", async () => {
    mocks.user.mockResolvedValue({ data: { user: null }, error: null });
    await expect(getWorkspaceContext()).rejects.toThrow("REDIRECT:/login");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("refuses an email-unverified session", async () => {
    mocks.user.mockResolvedValue({ data: { user: { ...account, email_confirmed_at: null } }, error: null });
    await expect(getWorkspaceContext()).rejects.toThrow("REDIRECT:/login?notice=verify-email");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("refuses revoked membership before querying profile and roles", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    await expect(getWorkspaceContext()).rejects.toThrow("REDIRECT:/auth/access-denied");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("fails closed if profile retrieval or its row policies reject the read", async () => {
    profileAvailable = false;
    await expect(getWorkspaceContext()).rejects.toThrow("REDIRECT:/auth/access-denied");
  });
});

describe("administrator authorization", () => {
  it("does not treat a signed-in student as an administrator", async () => {
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/auth/access-denied");
    expect(mocks.assurance).not.toHaveBeenCalled();
  });

  it("requires a second factor for an administrator", async () => {
    currentRole = "admin";
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/auth/mfa");
  });

  it("checks current database authorization even after MFA passes", async () => {
    currentRole = "admin";
    mocks.assurance.mockResolvedValue({ data: { currentLevel: "aal2" }, error: null });
    mocks.rpc.mockImplementation((name: string) => Promise.resolve({ data: name === "is_active_member", error: null }));
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/auth/access-denied");
    expect(mocks.rpc).toHaveBeenCalledWith("has_admin_access");
  });

  it("allows only a verified active administrator with aal2 and database approval", async () => {
    currentRole = "admin";
    mocks.assurance.mockResolvedValue({ data: { currentLevel: "aal2" }, error: null });
    expect(await requireAdmin()).toMatchObject({ mode: "connected", role: "admin", user: account });
  });
});
