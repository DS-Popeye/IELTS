import { describe, expect, it } from "vitest";
import { getAuthConfiguration, isPublicSupabaseKey, validatedOrigin } from "../../src/lib/env";
import { profileSchema, passwordChangeSchema, safeReturnPath } from "../../src/lib/auth/validation";

describe("safe authentication redirects", () => {
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/%2f%2fevil.example", "/dashboard?next=https://evil.example", "/dashboard#outside", null, {}, "javascript:alert(1)"])("rejects unsafe or unrecognized next value %s", (input) => {
    expect(safeReturnPath(input)).toBe("/dashboard");
  });
  it.each(["/profile", "/admin", "/reset-password", "/reading"])("keeps approved route %s", (path) => expect(safeReturnPath(path)).toBe(path));
});

describe("authentication configuration fails closed", () => {
  const valid = { NEXT_PUBLIC_APP_MODE: "connected", NEXT_PUBLIC_SITE_URL: "https://aster.example", NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_only" };
  it("uses labeled demo mode only when selected or unset", () => {
    expect(getAuthConfiguration({}).mode).toBe("demo");
    expect(getAuthConfiguration({ NEXT_PUBLIC_APP_MODE: "demo" }).ready).toBe(false);
  });
  it("does not fall back to demo when connected configuration is missing", () => {
    expect(getAuthConfiguration({ NEXT_PUBLIC_APP_MODE: "connected" })).toMatchObject({ mode: "connected", ready: false });
    expect(getAuthConfiguration({ NEXT_PUBLIC_APP_MODE: "typo" })).toMatchObject({ mode: "connected", ready: false });
  });
  it("requires site origin and public key for connected operation", () => {
    expect(getAuthConfiguration(valid).ready).toBe(true);
    expect(getAuthConfiguration({ ...valid, NEXT_PUBLIC_SITE_URL: "" }).ready).toBe(false);
    expect(getAuthConfiguration({ ...valid, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_do_not_use" }).ready).toBe(false);
  });
  it("rejects server secrets including legacy service-role keys", () => {
    const token = (role: string) => `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ role }))}.example-signature`;
    expect(isPublicSupabaseKey(token("service_role"))).toBe(false);
    expect(isPublicSupabaseKey(token("anon"))).toBe(true);
    expect(isPublicSupabaseKey("not-a-key")).toBe(false);
  });
  it.each(["https://user:password@example.com", "https://example.com/path", "https://example.com?redirect=evil", "https://example.com#hash", "http://example.com", "javascript:alert(1)"])("rejects unsafe origin %s", (url) => expect(validatedOrigin(url)).toBeNull());
  it("supports local development origins", () => expect(validatedOrigin("http://localhost:3000")).toBe("http://localhost:3000"));
});

describe("profile and password validation", () => {
  const profile = { display_name: "Example learner", country: "", timezone: "Asia/Singapore", language: "en", target_overall: "", exam_date: "", study_goal_minutes: "30" };
  it("preserves absent goals as null instead of fabricating a band or date", () => {
    expect(profileSchema.parse(profile)).toMatchObject({ target_overall: null, exam_date: null, country: null, study_goal_minutes: 30 });
  });
  it("rejects impossible dates, invalid time zones and invalid half-band goals", () => {
    expect(profileSchema.safeParse({ ...profile, exam_date: "2026-02-30" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, timezone: "Not/AZone" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, target_overall: "7.3" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...profile, study_goal_minutes: "10000" }).success).toBe(false);
  });
  it("strips privilege fields rather than forwarding them to a profile update", () => {
    const result = profileSchema.parse({ ...profile, user_id: "another-user", role: "admin", updated_at: "forged" });
    expect(result).not.toHaveProperty("user_id");
    expect(result).not.toHaveProperty("role");
    expect(result).not.toHaveProperty("updated_at");
  });
  it("requires matching sufficiently long new passwords", () => {
    expect(passwordChangeSchema.safeParse({ password: "short", confirmation: "short" }).success).toBe(false);
    expect(passwordChangeSchema.safeParse({ password: "a-long-password-example", confirmation: "different" }).success).toBe(false);
  });
});
