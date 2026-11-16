begin;
select plan(17);

-- Fixtures ------------------------------------------------------------------
insert into auth.users (id, email)
values ('00000000-0000-0000-0000-0000000000a1', 'admin@matrifer.internal'),
       ('00000000-0000-0000-0000-0000000000b2', 'operator@matrifer.internal');

-- Exposure ------------------------------------------------------------------
select has_schema('app');
select ok(not has_schema_privilege('anon', 'app', 'usage'), 'anon cannot use schema app');
select ok(
  not has_schema_privilege('authenticated', 'app', 'usage'),
  'authenticated cannot use schema app'
);
select is(
  (select count(*) from pg_tables where schemaname = 'public'),
  0::bigint,
  'schema public holds no tables'
);
select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'app' and c.relkind = 'r' and not c.relrowsecurity),
  0::bigint,
  'every table in schema app has RLS enabled'
);
select is(
  (select count(*) from pg_policies where schemaname = 'app'),
  0::bigint,
  'schema app has no RLS policies (deny-all)'
);

-- Writes require an actor -----------------------------------------------------
select throws_like(
  $$ insert into app.profiles (id, full_name, role)
     values ('00000000-0000-0000-0000-0000000000a1', 'Admin', 'ADMIN') $$,
  'AUDIT_ACTOR_MISSING%',
  'a write without app.user_id is rejected'
);

select set_config('app.user_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.user_role', 'ADMIN', true);

select lives_ok(
  $$ insert into app.profiles (id, full_name, role)
     values ('00000000-0000-0000-0000-0000000000a1', 'Admin', 'ADMIN') $$,
  'a write with an actor succeeds'
);

-- Audit trail -----------------------------------------------------------------
select results_eq(
  $$ select actor_id::text, actor_role, action, entity, entity_id, before is null, after->>'full_name'
       from app.audit_log $$,
  $$ values ('00000000-0000-0000-0000-0000000000a1', 'ADMIN', 'insert', 'profiles',
             '00000000-0000-0000-0000-0000000000a1', true, 'Admin') $$,
  'insert is audited with actor, role, entity and the new row'
);

update app.profiles set full_name = 'Admin Renamed'
 where id = '00000000-0000-0000-0000-0000000000a1';

select results_eq(
  $$ select action, before->>'full_name', after->>'full_name'
       from app.audit_log order by id desc limit 1 $$,
  $$ values ('update', 'Admin', 'Admin Renamed') $$,
  'update is audited with before and after'
);

select is((select count(*) from app.audit_log), 2::bigint, 'one audit row per write');

-- audit_log is append-only ------------------------------------------------------
select throws_ok(
  $$ update app.audit_log set reason = 'tampered' $$,
  'P0001', 'AUDIT_LOG_IMMUTABLE', 'audit_log rejects UPDATE'
);
select throws_ok(
  $$ delete from app.audit_log $$,
  'P0001', 'AUDIT_LOG_IMMUTABLE', 'audit_log rejects DELETE'
);
select throws_ok(
  $$ truncate app.audit_log $$,
  'P0001', 'AUDIT_LOG_IMMUTABLE', 'audit_log rejects TRUNCATE'
);
select is((select count(*) from app.audit_log), 2::bigint, 'audit_log is unchanged after rejections');

-- No physical delete (RN-020) -----------------------------------------------------
select throws_like(
  $$ delete from app.profiles where id = '00000000-0000-0000-0000-0000000000a1' $$,
  'DELETE_FORBIDDEN%',
  'profiles rejects DELETE'
);
select is((select count(*) from app.profiles), 1::bigint, 'the profile still exists');

select * from finish();
rollback;
