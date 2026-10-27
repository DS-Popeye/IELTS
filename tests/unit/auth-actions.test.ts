import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  client: vi.fn(),
  redirect: vi.fn((path: string): never => { throw new Error(`REDIRECT:${path}`); }),
  revalidate: vi.fn(),
  getUser: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetEmail: vi.fn(),
  updateUser: vi.fn(),
  oauth: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ getAuthConfiguration: mocks.config }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

import { forgotPasswordAction, googleLoginAction, loginAction, logoutAction, registerAction, resetPasswordAction } from "../../src/lib/auth/actions";
import { updateProfileAction } from "../../src/features/profile/actions";

const initial = { status: "idle" as const, message: "" };
const confirmedUser = { id: "synthetic-user-a", email: "learner@example.test", email_confirmed_at: "2026-10-25T00:00:00Z" };
const form = (fields: Record<string, string>) => {
  const result = new FormData();
  Object.entries(fields).forEach(([key, value]) => result.set(key, value));
  return result;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.config.mockReturnValue({ ready: true, mode: "connected", siteUrl: "https://aster.example" });
  mocks.getUser.mockResolvedValue({ data: { user: confirmedUser }, error: null });
  mocks.signIn.mockResolvedValue({ data: { user: confirmedUser, session: { access_token: "synthetic" } }, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.signUp.mockResolvedValue({ data: { user: null, session: null }, error: null });
  mocks.resetEmail.mockResolvedValue({ error: null });
  mocks.updateUser.mockResolvedValue({ error: null });
  mocks.oauth.mockResolvedValue({ data: { url: "https://project.supabase.co/auth/v1/authorize" }, error: null });
  mocks.rpc.mockImplementation((name: string) => Promise.resolve({ data: name === "is_active_member" ? true : null, error: null }));
  mocks.single.mockResolvedValue({ data: { user_id: confirmedUser.id }, error: null });
  mocks.select.mockReturnValue({ single: mocks.single });
  mocks.eq.mockReturnValue({ select: mocks.select });
  mocks.update.mockReturnValue({ eq: mocks.eq });
  mocks.from.mockReturnValue({ update: mocks.update });
  mocks.client.mockResolvedValue({
    auth: { getUser: mocks.getUser, signInWithPassword: mocks.signIn, signUp: mocks.signUp, signOut: mocks.signOut, resetPasswordForEmail: mocks.resetEmail, updateUser: mocks.updateUser, signInWithOAuth: mocks.oauth },
    rpc: mocks.rpc,
    from: mocks.from,
  });
});

describe("server authentication boundaries", () => {
  it("never creates a provider client or reports success in demo/unconfigured mode", async () => {
    mocks.config.mockReturnValue({ ready: false, mode: "demo", siteUrl: null });
    for (const action of [loginAction, registerAction, forgotPasswordAction, resetPasswordAction]) {
      expect((await action(initial, form({}))).status).toBe("error");
    }
    expect(mocks.client).not.toHaveBeenCalled();
  });

  it("rejects an unverified account and clears the provider session", async () => {
    mocks.signIn.mockResolvedValue({ data: { user: { ...confirmedUser, email_confirmed_at: null }, session: {} }, error: null });
    const result = await loginAction(initial, form({ email: confirmedUser.email, password: "example-password" }));
    expect(result.status).toBe("error");
    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("clears sessions for revoked or unauthorized membership", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    expect((await loginAction(initial, form({ email: confirmedUser.email, password: "example-password" }))).status).toBe("error");
    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("requires active membership before recording sign-in and ignores external return URLs", async () => {
    await expect(loginAction(initial, form({ email: confirmedUser.email, password: "example-password", next: "//evil.example" }))).rejects.toThrow("REDIRECT:/dashboard");
    expect(mocks.rpc).toHaveBeenCalledWith("is_active_member");
    expect(mocks.rpc).toHaveBeenCalledWith("record_security_event", { event_name: "login" });
  });

  it("uses the configured origin and an allowed relative path for Google callbacks", async () => {
    await expect(googleLoginAction(form({ next: "https://evil.example" }))).rejects.toThrow("REDIRECT:https://project.supabase.co/auth/v1/authorize");
    expect(mocks.oauth).toHaveBeenCalledWith({ provider: "google", options: { redirectTo: "https://aster.example/auth/callback?next=%2Fdashboard", skipBrowserRedirect: true } });
  });

  it("gives the same registration response for rejected and accepted private addresses", async () => {
    const credentials = form({ email: confirmedUser.email, password: "long-enough-example-password" });
    const accepted = await registerAction(initial, credentials);
    mocks.signUp.mockResolvedValue({ data: { user: null, session: null }, error: { message: "private registration denied" } });
    const rejected = await registerAction(initial, credentials);
    expect(accepted).toEqual(rejected);
    expect(rejected.message).not.toContain("private registration denied");
  });

  it("does not expose reset-email provider errors or account existence", async () => {
    const credentials = form({ email: confirmedUser.email });
    const accepted = await forgotPasswordAction(initial, credentials);
    mocks.resetEmail.mockResolvedValue({ error: { message: "account does not exist" } });
    expect(await forgotPasswordAction(initial, credentials)).toEqual(accepted);
  });

  it("cannot change a password without a verified provider user and membership", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await resetPasswordAction(initial, form({ password: "new-example-password", confirmation: "new-example-password", user_id: "victim" }));
    expect(result.status).toBe("error");
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("changes only the current session password and signs out all sessions afterward", async () => {
    await expect(resetPasswordAction(initial, form({ password: "new-example-password", confirmation: "new-example-password", user_id: "victim", email: "victim@example.test" }))).rejects.toThrow("REDIRECT:/login?notice=password-updated");
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: "new-example-password" });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "global" });
  });

  it("signs out the current device, revalidates the workspace, and redirects after success", async () => {
    await expect(logoutAction()).rejects.toThrow("REDIRECT:/login?notice=signed-out");
    expect(mocks.rpc).toHaveBeenCalledWith("record_security_event", { event_name: "logout" });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(mocks.revalidate).toHaveBeenCalledWith("/", "layout");
  });

  it("does not report a successful sign-out when the provider reports failure", async () => {
    mocks.signOut.mockResolvedValue({ error: { message: "network unavailable" } });
    await expect(logoutAction()).rejects.toThrow("REDIRECT:/login?notice=signout-error");
  });

  it("reports password success separately when a following global sign-out fails", async () => {
    mocks.signOut.mockResolvedValue({ error: { message: "network unavailable" } });
    await expect(resetPasswordAction(initial, form({ password: "new-example-password", confirmation: "new-example-password" }))).rejects.toThrow("REDIRECT:/login?notice=password-updated-signout-error");
    expect(mocks.updateUser).toHaveBeenCalledOnce();
  });
});

describe("connected profile writes", () => {
  const fields = { display_name: "Synthetic example", country: "", timezone: "Asia/Singapore", language: "en", target_overall: "", exam_date: "", study_goal_minutes: "25" };

  it("uses the verified user identity and never forwards privilege/owner fields", async () => {
    const result = await updateProfileAction(initial, form({ ...fields, user_id: "victim", role: "admin" }));
    expect(result.status).toBe("success");
    expect(mocks.eq).toHaveBeenCalledWith("user_id", confirmedUser.id);
    expect(mocks.update.mock.calls[0][0]).not.toHaveProperty("user_id");
    expect(mocks.update.mock.calls[0][0]).not.toHaveProperty("role");
    expect(mocks.update.mock.calls[0][0]).toMatchObject({ target_overall: null, study_goal_minutes: 25 });
  });

  it("does not write for inactive users or after a failed membership lookup", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "unavailable" } });
    expect((await updateProfileAction(initial, form(fields))).status).toBe("error");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("does not claim success when row-level security rejects the update", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { message: "row denied" } });
    expect((await updateProfileAction(initial, form(fields))).status).toBe("error");
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
