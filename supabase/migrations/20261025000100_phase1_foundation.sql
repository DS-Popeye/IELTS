-- Phase 1 foundation only. No test content, attempts, AI or billing tables.
-- Apply to a dedicated Supabase project with the CLI or reviewed SQL Editor.

create table public.private_access (
  email text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint private_access_normalized_email check (
    email = lower(btrim(email)) and length(email) between 3 and 254 and position('@' in email) > 1
  )
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name) <= 80),
  country text check (country is null or length(country) between 1 and 80),
  timezone text not null default 'UTC' check (length(timezone) between 1 and 80),
  language text not null default 'en' check (language in ('en', 'bn')),
  target_overall numeric(2,1) check (
    target_overall is null or (target_overall between 1 and 9 and mod(target_overall * 10, 5) = 0)
  ),
  exam_date date,
  study_goal_minutes integer not null default 30 check (study_goal_minutes between 5 and 480),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin')),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb
);

create index audit_events_created_at_idx on public.audit_events(created_at desc);
create index audit_events_actor_action_idx on public.audit_events(actor_id, action, created_at desc);

alter table public.private_access enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_events enable row level security;

-- Revoke Supabase projects' possible automatic public-schema grants explicitly.
revoke all on public.private_access, public.profiles, public.user_roles, public.audit_events
  from public, anon, authenticated;
grant all on public.private_access, public.profiles, public.user_roles, public.audit_events to service_role;
grant select on public.profiles, public.user_roles, public.audit_events to authenticated;
grant update (display_name, country, timezone, language, target_overall, exam_date, study_goal_minutes)
  on public.profiles to authenticated;

-- Never authorize from client-editable user_metadata or a browser UI state.
-- Current DB membership is checked on every access, so revocation does not wait
-- for a JWT to expire. Unverified email users cannot access private app data.
create function public.is_active_member()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.private_access a on a.email = lower(btrim(u.email)) and a.active
    join public.user_roles r on r.user_id = u.id
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  );
$$;

create function public.has_admin_access()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.is_active_member()
    and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2'
    and exists (
      select 1 from public.user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'admin'
    );
$$;

revoke all on function public.is_active_member() from public, anon, authenticated;
revoke all on function public.has_admin_access() from public, anon, authenticated;
grant execute on function public.is_active_member() to anon, authenticated, service_role;
grant execute on function public.has_admin_access() to authenticated, service_role;

create policy profiles_select_own on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_member()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_member()))
  with check (user_id = (select auth.uid()) and (select public.is_active_member()));
create policy roles_select_own on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_member()));
create policy audit_select_admin_mfa on public.audit_events for select to authenticated
  using ((select public.has_admin_access()));
-- There are intentionally no browser policies/grants for private_access,
-- role mutation, profile creation/deletion, or direct audit mutation.

create function public.enforce_private_registration()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.email is null or not exists (
    select 1 from public.private_access
    where email = lower(btrim(new.email)) and active
  ) then
    raise exception 'Private access is not enabled for this account.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create function public.initialize_member_profile()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- Ignore user-supplied role metadata; all new accounts begin as students.
  insert into public.profiles(user_id) values (new.id);
  insert into public.user_roles(user_id, role) values (new.id, 'student');
  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata_json)
    values (new.id, 'account_created', 'profile', new.id, '{"source":"database_trigger"}'::jsonb);
  return new;
end;
$$;

create trigger enforce_private_registration before insert on auth.users
  for each row execute function public.enforce_private_registration();
create trigger initialize_member_profile after insert on auth.users
  for each row execute function public.initialize_member_profile();

create function public.touch_profile()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at then
    raise exception 'Profile identity is immutable.' using errcode = '42501';
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Unknown time zone.' using errcode = '23514';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create function public.audit_profile_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata_json)
    values (auth.uid(), 'profile_updated', 'profile', new.user_id, '{"source":"database_trigger"}'::jsonb);
  return new;
end;
$$;

create function public.audit_role_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata_json)
    values (
      auth.uid(), 'role_changed', 'user_role', new.user_id,
      jsonb_build_object('source', 'database_trigger', 'role', new.role)
    );
  return new;
end;
$$;

create function public.audit_private_access_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  access_email text;
  access_active boolean;
begin
  if tg_op = 'DELETE' then
    access_email := old.email;
    access_active := false;
  else
    access_email := new.email;
    access_active := new.active;
  end if;
  insert into public.audit_events(actor_id, action, entity_type, metadata_json)
    values (
      auth.uid(), 'private_access_changed', 'private_access',
      jsonb_build_object(
        'source', 'database_trigger', 'operation', tg_op, 'active', access_active,
        'email_sha256', encode(sha256(convert_to(access_email, 'UTF8')), 'hex')
      )
    );
  return coalesce(new, old);
end;
$$;

create trigger touch_profile before update on public.profiles
  for each row execute function public.touch_profile();
create trigger audit_profile_update after update on public.profiles
  for each row execute function public.audit_profile_update();
create trigger audit_role_change after insert or update on public.user_roles
  for each row execute function public.audit_role_change();
create trigger audit_private_access_change after insert or update or delete on public.private_access
  for each row execute function public.audit_private_access_change();

-- Supplementary session telemetry, not a substitute for Supabase's Auth audit
-- log. A client can report only an allowlisted action as its own verified user.
-- Trigger-generated profile/role/access events are authoritative DB events.
create function public.record_security_event(event_name text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_active_member() then
    raise exception 'Private membership required.' using errcode = '42501';
  end if;
  if event_name not in ('login', 'logout', 'password_updated', 'mfa_verified') or event_name is null then
    raise exception 'Unsupported security event.' using errcode = '22023';
  end if;
  if event_name = 'mfa_verified' and coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'Multi-factor verification required.' using errcode = '42501';
  end if;
  -- Serialize one user's event writes so concurrent requests cannot bypass the
  -- per-event minute cooldown by checking before either request has committed.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text, 0));
  if exists (
    select 1 from public.audit_events
    where actor_id = auth.uid() and action = event_name
      and created_at > now() - interval '60 seconds'
  ) then
    return;
  end if;
  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata_json)
    values (auth.uid(), event_name, 'session', auth.uid(), '{"source":"authenticated_client"}'::jsonb);
end;
$$;

revoke all on function public.enforce_private_registration() from public, anon, authenticated;
revoke all on function public.initialize_member_profile() from public, anon, authenticated;
revoke all on function public.touch_profile() from public, anon, authenticated;
revoke all on function public.audit_profile_update() from public, anon, authenticated;
revoke all on function public.audit_role_change() from public, anon, authenticated;
revoke all on function public.audit_private_access_change() from public, anon, authenticated;
revoke all on function public.record_security_event(text) from public, anon, authenticated;
grant execute on function public.record_security_event(text) to authenticated;

-- Reserved storage is PRIVATE. Phase 1 has no safe upload/serving pipeline.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('content-private', 'content-private', false, 52428800, array['image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/mp4','application/pdf']),
  ('student-uploads-private', 'student-uploads-private', false, 10485760, array['image/png','image/jpeg','image/webp']),
  ('speaking-recordings-private', 'speaking-recordings-private', false, 52428800, array['audio/webm','audio/ogg','audio/mp4','audio/wav'])
on conflict (id) do update set public = false,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Restrictive policies also defeat an accidentally broad permissive policy.
-- Replace through a reviewed later migration when scoped upload APIs exist.
create policy phase1_reserved_objects_deny on storage.objects
  as restrictive for all to anon, authenticated
  using (bucket_id not in ('content-private', 'student-uploads-private', 'speaking-recordings-private'))
  with check (bucket_id not in ('content-private', 'student-uploads-private', 'speaking-recordings-private'));
create policy phase1_reserved_buckets_deny on storage.buckets
  as restrictive for all to anon, authenticated
  using (id not in ('content-private', 'student-uploads-private', 'speaking-recordings-private'))
  with check (id not in ('content-private', 'student-uploads-private', 'speaking-recordings-private'));
