-- Run with `supabase test db` against a LOCAL or disposable staging database.
-- These .invalid users are synthetic test fixtures, never product seed data.
begin;
create extension if not exists pgtap with schema extensions;
grant usage on schema extensions to anon, authenticated;
set search_path = public, extensions;
select no_plan();

insert into public.private_access(email) values
  ('rls-alice@example.invalid'), ('rls-bob@example.invalid'),
  ('rls-admin@example.invalid'), ('rls-unverified@example.invalid');

insert into auth.users(id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('30000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'rls-alice@example.invalid', now(), '{"provider":"email","providers":["email"]}', '{"role":"admin"}', now(), now()),
  ('30000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'rls-bob@example.invalid', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('30000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'rls-admin@example.invalid', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('30000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'rls-unverified@example.invalid', null, '{"provider":"email","providers":["email"]}', '{}', now(), now());

update public.user_roles set role = 'admin' where user_id = '30000000-0000-4000-8000-000000000003';

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles enables RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.user_roles'::regclass), 'user_roles enables RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.private_access'::regclass), 'private_access enables RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.audit_events'::regclass), 'audit_events enables RLS');
select is((select count(*)::integer from storage.buckets where id in ('content-private','student-uploads-private','speaking-recordings-private') and public = false), 3, 'all reserved buckets are private');
select throws_ok(
  $$insert into auth.users(id,email) values ('30000000-0000-4000-8000-000000000099','rls-outsider@example.invalid')$$,
  'P0001', 'Private access is not enabled for this account.', 'uninvited signup is rejected'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"30000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1","user_metadata":{"role":"admin"}}', true);
select ok(public.is_active_member(), 'verified allowlisted student is active');
select is((select count(*)::integer from public.profiles), 1, 'Alice sees one own profile');
select is((select user_id::text from public.profiles), '30000000-0000-4000-8000-000000000001', 'Alice sees her own ID');
select is((select role from public.user_roles), 'student', 'admin metadata did not affect assigned role');
select is(public.has_admin_access(), false, 'student cannot access admin');
select lives_ok($$update public.profiles set display_name='Synthetic test fixture', timezone='Asia/Dhaka', target_overall=7.5, study_goal_minutes=45$$, 'own allowed profile fields are editable');
select is((select display_name from public.profiles), 'Synthetic test fixture', 'own update persisted');
select is((with changed as (update public.profiles set display_name='attack' where user_id='30000000-0000-4000-8000-000000000002' returning user_id) select count(*)::integer from changed), 0, 'cross-user update touches no rows');
select throws_ok($$update public.profiles set user_id='30000000-0000-4000-8000-000000000002'$$, '42501', null, 'profile ownership cannot change');
select throws_ok($$update public.profiles set created_at=now()$$, '42501', null, 'creation timestamp cannot change');
select throws_ok($$update public.profiles set language='xx'$$, '23514', null, 'unsupported locale rejected');
select throws_ok($$update public.profiles set target_overall=7.3$$, '23514', null, 'target band requires half steps');
select throws_ok($$update public.profiles set timezone='Not/A_Zone'$$, '23514', null, 'unknown timezone rejected');
select throws_ok($$update public.profiles set study_goal_minutes=0$$, '23514', null, 'invalid daily goal rejected');
select throws_ok($$delete from public.profiles$$, '42501', null, 'browser cannot delete profiles directly');
select throws_ok($$insert into public.profiles(user_id) values ('30000000-0000-4000-8000-000000000002')$$, '42501', null, 'browser cannot insert profiles');
select throws_ok($$update public.user_roles set role='admin'$$, '42501', null, 'student cannot promote themselves');
select throws_ok($$delete from public.user_roles$$, '42501', null, 'student cannot delete role rows');
select throws_ok($$select * from public.private_access$$, '42501', null, 'allowlist is not readable');
select throws_ok($$update public.private_access set active=true$$, '42501', null, 'allowlist is not writable');
select is((select count(*)::integer from public.audit_events), 0, 'student cannot read audit events');
select lives_ok($$select public.record_security_event('login')$$, 'student can report an own session event');
select lives_ok($$select public.record_security_event('login')$$, 'repeated event is safely deduplicated');
select throws_ok($$select public.record_security_event('role_changed')$$, '22023', 'Unsupported security event.', 'cannot forge privileged audit action');
select throws_ok($$select public.record_security_event('mfa_verified')$$, '42501', 'Multi-factor verification required.', 'aal1 cannot report verified MFA');

select set_config('request.jwt.claims', '{"sub":"30000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal2","user_metadata":{"role":"admin"}}', true);
select is((select user_id::text from public.profiles), '30000000-0000-4000-8000-000000000002', 'Bob independently sees only his own profile');
select is((select display_name from public.profiles), '', 'cross-user update did not alter Bob');
select is(public.has_admin_access(), false, 'aal2 does not promote a student');

select set_config('request.jwt.claims', '{"sub":"30000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal1"}', true);
select is(public.has_admin_access(), false, 'admin without MFA cannot access admin operations');
select is((select count(*)::integer from public.audit_events), 0, 'admin without MFA cannot read audits');
select set_config('request.jwt.claims', '{"sub":"30000000-0000-4000-8000-000000000003","role":"authenticated","aal":"aal2"}', true);
select ok(public.has_admin_access(), 'MFA admin is authorized');
select ok((select count(*) from public.audit_events) > 0, 'MFA admin can read audit events');
select is((select count(*)::integer from public.audit_events where actor_id='30000000-0000-4000-8000-000000000001' and action='login'), 1, 'event cooldown prevented duplicate writes');
select is((select count(*)::integer from public.profiles), 1, 'admin does not gain blanket profile reads');
select throws_ok($$delete from public.audit_events$$, '42501', null, 'MFA admin cannot delete audit history');
select throws_ok($$update public.audit_events set action='tampered'$$, '42501', null, 'MFA admin cannot rewrite audit history');
select throws_ok($$insert into public.audit_events(action,entity_type) values ('forged','session')$$, '42501', null, 'direct audit insert is denied');
select throws_ok($$select * from public.private_access$$, '42501', null, 'MFA admin cannot query private allowlist through client role');

select set_config('request.jwt.claims', '{"sub":"30000000-0000-4000-8000-000000000004","role":"authenticated","aal":"aal1"}', true);
select is(public.is_active_member(), false, 'unverified email account has no active membership');
select is((select count(*)::integer from public.profiles), 0, 'unverified account cannot read private profile');

reset role;
select set_config('request.jwt.claims', '{}', true);
update public.private_access set active=false where email='rls-alice@example.invalid';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"30000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}', true);
select is(public.is_active_member(), false, 'revocation takes effect without waiting for JWT expiry');
select is((select count(*)::integer from public.profiles), 0, 'revoked account cannot read profile');
select throws_ok($$select public.record_security_event('login')$$, '42501', 'Private membership required.', 'revoked account cannot append events');

reset role;
select set_config('request.jwt.claims', '{}', true);
set local role anon;
select is(public.is_active_member(), false, 'anonymous request is not a member');
select throws_ok($$select * from public.profiles$$, '42501', null, 'anonymous profile access is denied');
select throws_ok($$select public.record_security_event('login')$$, '42501', null, 'anonymous audit RPC is denied');

reset role;
select set_config('request.jwt.claims', '{}', true);
delete from public.user_roles where user_id='30000000-0000-4000-8000-000000000002';
select is((select count(*)::integer from public.audit_events where action='role_changed' and entity_id='30000000-0000-4000-8000-000000000002' and metadata_json->>'operation'='DELETE'), 1, 'trusted role removal is audited');
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"30000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal2"}', true);
select is(public.is_active_member(), false, 'role removal immediately removes membership');
reset role;
select set_config('request.jwt.claims', '{}', true);
insert into public.user_roles(user_id) values ('30000000-0000-4000-8000-000000000002');

-- Simulate a legacy broad Storage policy to prove the restrictive guards hold.
create policy phase1_test_broad_object on storage.objects for all to anon, authenticated using (true) with check (true);
create policy phase1_test_broad_bucket on storage.buckets for all to anon, authenticated using (true) with check (true);
insert into storage.objects(bucket_id,name) values ('student-uploads-private','phase1-synthetic-test.png');
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"30000000-0000-4000-8000-000000000002","role":"authenticated","aal":"aal1"}', true);
select is((select count(*)::integer from storage.objects where bucket_id='student-uploads-private'), 0, 'private objects are hidden even with broad permissive policy');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('student-uploads-private','forged.png')$$, '42501', null, 'unvalidated browser upload is blocked');
select is((with changed as (update storage.objects set name='forged.png' where bucket_id='student-uploads-private' returning id) select count(*)::integer from changed), 0, 'private object update is blocked');
select is((with removed as (delete from storage.objects where bucket_id='student-uploads-private' returning id) select count(*)::integer from removed), 0, 'private object deletion is blocked');
select is((select count(*)::integer from storage.buckets where id in ('content-private','student-uploads-private','speaking-recordings-private')), 0, 'reserved bucket rows are hidden from browser roles');
select is((with changed as (update storage.buckets set public=true where id='student-uploads-private' returning id) select count(*)::integer from changed), 0, 'browser cannot make a reserved bucket public');

reset role;
select is(has_function_privilege('authenticated','public.initialize_member_profile()','EXECUTE'), false, 'internal profile initializer is not callable by browser');
select is(has_function_privilege('authenticated','public.audit_role_change()','EXECUTE'), false, 'internal privileged audit trigger is not callable by browser');
select * from finish();
rollback;
