import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

// Synthetic .invalid identities exist only in this in-memory test database.
// PGlite runs the actual PostgreSQL migration/RLS; Auth and Storage service
// schemas are minimal platform stubs, not a hosted-Supabase integration test.
const ids = {
  alice: "10000000-0000-4000-8000-000000000001",
  bob: "10000000-0000-4000-8000-000000000002",
  admin: "10000000-0000-4000-8000-000000000003",
  unverified: "10000000-0000-4000-8000-000000000004",
  revoked: "10000000-0000-4000-8000-000000000005",
};
let db: PGlite;

async function assume(identity: keyof typeof ids | null, aal = "aal1", extra: Record<string, unknown> = {}) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims', $1, false)", [
    JSON.stringify({ ...(identity ? { sub: ids[identity] } : {}), aal, role: identity ? "authenticated" : "anon", ...extra }),
  ]);
  await db.exec(`set role ${identity ? "authenticated" : "anon"}`);
}

async function scalar<T>(sql: string): Promise<T> {
  return (await db.query<{ value: T }>(sql)).rows[0].value;
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create schema storage;
    grant usage on schema public, auth, storage to anon, authenticated, service_role;
    create table auth.users (
      id uuid primary key,
      email text unique,
      email_confirmed_at timestamptz,
      raw_user_meta_data jsonb default '{}'
    );
    create function auth.jwt() returns jsonb language sql stable as $$
      select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
    $$;
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(auth.jwt()->>'sub', '')::uuid;
    $$;
    create table storage.buckets (
      id text primary key, name text not null, public boolean default false,
      file_size_limit bigint, allowed_mime_types text[]
    );
    create table storage.objects (
      id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id),
      name text, owner_id text
    );
    alter table storage.buckets enable row level security;
    alter table storage.objects enable row level security;
    grant all on storage.buckets, storage.objects to anon, authenticated;
    -- The migration's restrictive policies must defeat permissive policies
    -- which a pre-existing project could already contain.
    create policy test_broad_bucket_policy on storage.buckets for all to anon, authenticated using (true) with check (true);
    create policy test_broad_object_policy on storage.objects for all to anon, authenticated using (true) with check (true);
  `);
  const migration = await readFile(resolve("supabase/migrations/20261025000100_phase1_foundation.sql"), "utf8");
  await db.exec(migration);
  for (const [name, id] of Object.entries(ids)) {
    await db.query("insert into public.private_access(email) values ($1)", [`${name}@example.invalid`]);
    await db.query(
      "insert into auth.users(id, email, email_confirmed_at, raw_user_meta_data) values ($1, $2, $3, $4)",
      [id, `${name}@example.invalid`, name === "unverified" ? null : "2026-10-25T00:00:00Z", { role: "admin" }],
    );
  }
  await db.query("update public.user_roles set role = 'admin' where user_id = $1", [ids.admin]);
  await db.exec("update public.private_access set active = false where email = 'revoked@example.invalid'");
  await db.query("insert into storage.objects(bucket_id, name, owner_id) values ('student-uploads-private', 'synthetic-fixture.png', $1)", [ids.alice]);
}, 30000);

afterEach(async () => {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims', '{}', false)");
});

afterAll(async () => {
  await db?.close();
});

describe("Phase 1 migration and database authorization", () => {
  it("enables RLS on every application table", async () => {
    const rows = (await db.query<{ relname: string; relrowsecurity: boolean }>(
      "select relname, relrowsecurity from pg_class where oid in ('public.profiles'::regclass, 'public.user_roles'::regclass, 'public.private_access'::regclass, 'public.audit_events'::regclass)",
    )).rows;
    expect(rows).toHaveLength(4);
    expect(rows.every((row) => row.relrowsecurity)).toBe(true);
  });

  it("blocks uninvited account creation at the database boundary", async () => {
    await expect(db.exec("insert into auth.users(id,email) values ('20000000-0000-4000-8000-000000000001','outsider@example.invalid')"))
      .rejects.toMatchObject({ code: "P0001" });
  });

  it("assigns student roles even when signup metadata claims admin", async () => {
    await assume("alice", "aal1", { user_metadata: { role: "admin" } });
    expect(await scalar("select role as value from public.user_roles")).toBe("student");
    expect(await scalar("select public.has_admin_access() as value")).toBe(false);
  });

  it("permits only the current verified member's profile and role", async () => {
    await assume("alice");
    expect(await scalar("select public.is_active_member() as value")).toBe(true);
    expect((await db.query("select user_id from public.profiles")).rows).toEqual([{ user_id: ids.alice }]);
    expect((await db.query("select user_id from public.user_roles")).rows).toEqual([{ user_id: ids.alice }]);
  });

  it("isolates a second independent member's data", async () => {
    await assume("bob");
    expect((await db.query("select user_id from public.profiles")).rows).toEqual([{ user_id: ids.bob }]);
    expect((await db.query("select user_id from public.user_roles")).rows).toEqual([{ user_id: ids.bob }]);
  });

  it("allows valid own-profile preferences and records an immutable audit event", async () => {
    await assume("alice");
    await db.exec("update public.profiles set display_name = 'Test fixture', language = 'bn', timezone = 'Asia/Dhaka', target_overall = 7.5, study_goal_minutes = 45");
    expect(await scalar("select language as value from public.profiles")).toBe("bn");
    await db.exec("reset role");
    const event = (await db.query<{ actor_id: string; entity_id: string; metadata_json: unknown }>(
      "select actor_id, entity_id, metadata_json from public.audit_events where action = 'profile_updated'",
    )).rows[0];
    expect(event).toEqual({ actor_id: ids.alice, entity_id: ids.alice, metadata_json: { source: "database_trigger" } });
  });

  it("silently excludes another member's profile from UPDATE", async () => {
    await assume("alice");
    const result = await db.query("update public.profiles set display_name = 'attack' where user_id = $1 returning user_id", [ids.bob]);
    expect(result.rows).toHaveLength(0);
    await db.exec("reset role");
    expect(await scalar(`select display_name as value from public.profiles where user_id = '${ids.bob}'`)).toBe("");
  });

  it("denies owner-ID and creation-time changes at column privilege level", async () => {
    await assume("alice");
    await expect(db.query("update public.profiles set user_id = $1 where user_id = $2", [ids.bob, ids.alice]))
      .rejects.toMatchObject({ code: "42501" });
    await expect(db.exec("update public.profiles set created_at = now()"))
      .rejects.toMatchObject({ code: "42501" });
  });

  it("rejects invalid profile fields at the database boundary", async () => {
    await assume("alice");
    for (const sql of [
      "update public.profiles set target_overall = 7.3",
      "update public.profiles set study_goal_minutes = 0",
      "update public.profiles set language = 'xx'",
      "update public.profiles set timezone = 'Not/A_Zone'",
    ]) await expect(db.exec(sql)).rejects.toMatchObject({ code: "23514" });
  });

  it("denies profile creation, deletion and self-promotion by authenticated clients", async () => {
    await assume("alice");
    for (const sql of [
      `insert into public.profiles(user_id) values ('${ids.alice}')`,
      "delete from public.profiles",
      "update public.user_roles set role = 'admin'",
      `insert into public.user_roles(user_id,role) values ('${ids.alice}','admin')`,
      "delete from public.user_roles",
    ]) await expect(db.exec(sql)).rejects.toMatchObject({ code: "42501" });
  });

  it("keeps the email allowlist unreadable and immutable to all browser users", async () => {
    for (const identity of ["alice", "admin"] as const) {
      await assume(identity, "aal2");
      await expect(db.exec("select * from public.private_access")).rejects.toMatchObject({ code: "42501" });
      await expect(db.exec("update public.private_access set active = true")).rejects.toMatchObject({ code: "42501" });
    }
  });

  it("blocks anonymous profile access and security event writes", async () => {
    await assume(null);
    expect(await scalar("select public.is_active_member() as value")).toBe(false);
    await expect(db.exec("select * from public.profiles")).rejects.toMatchObject({ code: "42501" });
    await expect(db.exec("select public.record_security_event('login')")).rejects.toMatchObject({ code: "42501" });
  });

  it("blocks unverified and revoked users even with authenticated tokens", async () => {
    for (const identity of ["unverified", "revoked"] as const) {
      await assume(identity, "aal2");
      expect(await scalar("select public.is_active_member() as value")).toBe(false);
      expect(await scalar("select count(*)::int as value from public.profiles")).toBe(0);
      expect(await scalar("select count(*)::int as value from public.user_roles")).toBe(0);
      await expect(db.exec("select public.record_security_event('login')")).rejects.toMatchObject({ code: "42501" });
    }
  });

  it("requires MFA for administrator audit reads", async () => {
    await assume("admin", "aal1");
    expect(await scalar("select public.has_admin_access() as value")).toBe(false);
    expect(await scalar("select count(*)::int as value from public.audit_events")).toBe(0);
    await assume("admin", "aal2");
    expect(await scalar("select public.has_admin_access() as value")).toBe(true);
    expect(await scalar<number>("select count(*)::int as value from public.audit_events")).toBeGreaterThan(0);
    expect(await scalar("select count(*)::int as value from public.profiles")).toBe(1);
  });

  it("does not promote a student with aal2 or user-editable admin metadata", async () => {
    await assume("bob", "aal2", { user_metadata: { role: "admin", is_admin: true } });
    expect(await scalar("select public.has_admin_access() as value")).toBe(false);
    expect(await scalar("select count(*)::int as value from public.audit_events")).toBe(0);
  });

  it("derives audit actor from auth.uid and bounds accepted events", async () => {
    await assume("alice");
    await db.exec("select public.record_security_event('login'); select public.record_security_event('login')");
    await expect(db.exec("select public.record_security_event('role_changed')")).rejects.toMatchObject({ code: "22023" });
    await expect(db.exec("select public.record_security_event('mfa_verified')")).rejects.toMatchObject({ code: "42501" });
    await db.exec("reset role");
    const rows = (await db.query("select actor_id, action, metadata_json from public.audit_events where action = 'login'")).rows;
    expect(rows).toEqual([{ actor_id: ids.alice, action: "login", metadata_json: { source: "authenticated_client" } }]);
  });

  it("keeps audit history immutable even for an MFA administrator", async () => {
    await assume("admin", "aal2");
    for (const sql of [
      "delete from public.audit_events",
      "update public.audit_events set action = 'tampered'",
      "insert into public.audit_events(action,entity_type) values ('forged','session')",
    ]) await expect(db.exec(sql)).rejects.toMatchObject({ code: "42501" });
  });

  it("reserves three private storage buckets with bounded file sizes", async () => {
    const rows = (await db.query<{ public: boolean; file_size_limit: number; allowed_mime_types: string[] }>(
      "select public, file_size_limit, allowed_mime_types from storage.buckets",
    )).rows;
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.public === false && Number(row.file_size_limit) <= 52428800 && row.allowed_mime_types.length > 0)).toBe(true);
  });

  it("denies reserved object reads and writes despite an existing broad storage policy", async () => {
    for (const identity of [null, "alice", "admin"] as const) {
      await assume(identity, "aal2");
      expect(await scalar("select count(*)::int as value from storage.objects")).toBe(0);
      expect(await scalar("select count(*)::int as value from storage.buckets")).toBe(0);
      await expect(db.exec("insert into storage.objects(bucket_id,name) values ('student-uploads-private','attack.png')"))
        .rejects.toMatchObject({ code: "42501" });
      expect((await db.query("update storage.objects set name = 'attack.png' returning id")).rows).toHaveLength(0);
      expect((await db.query("delete from storage.objects returning id")).rows).toHaveLength(0);
    }
  });

  it("does not expose trigger functions as callable browser operations", async () => {
    expect(await scalar("select has_function_privilege('authenticated','public.initialize_member_profile()','EXECUTE') as value")).toBe(false);
    expect(await scalar("select has_function_privilege('anon','public.record_security_event(text)','EXECUTE') as value")).toBe(false);
    expect(await scalar("select has_function_privilege('authenticated','public.audit_role_change()','EXECUTE') as value")).toBe(false);
  });
});
