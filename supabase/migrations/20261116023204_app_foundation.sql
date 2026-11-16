-- Foundation of schema "app": roles, profiles and the audit trail.
-- Source: docs/data-model.md §3-4. Covered by supabase/tests/001_app_foundation.test.sql.

create schema if not exists app;

-- Nothing in "app" is reachable through the Data API roles.
revoke all on schema app from public, anon, authenticated;
alter default privileges in schema app revoke all on tables from public, anon, authenticated;
alter default privileges in schema app revoke all on sequences from public, anon, authenticated;
alter default privileges in schema app revoke all on functions from public, anon, authenticated;

create type app.app_role as enum ('ADMIN', 'OPERATOR', 'MANAGEMENT', 'SUPPORT');

-- Users -----------------------------------------------------------------------
create table app.profiles (
  id          uuid primary key references auth.users (id),
  full_name   text not null,
  role        app.app_role not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Audit -----------------------------------------------------------------------
create table app.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid,
  actor_role  text,
  action      text not null, -- insert | update | void | delete | close | reopen | login | login_failed | read
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  reason      text
);
create index audit_log_at_idx on app.audit_log (at desc);
create index audit_log_entity_idx on app.audit_log (entity, entity_id);

-- RLS deny-all: enabled, with no policies. Authorization lives in the server.
alter table app.profiles enable row level security;
alter table app.audit_log enable row level security;

-- Every write must run inside withActor(): the trigger reads the transaction-local
-- settings app.user_id / app.user_role and rejects the write when they are missing.
create or replace function app.audit_row() returns trigger
language plpgsql security definer set search_path = app, pg_temp as $$
declare
  v_user   uuid := nullif(current_setting('app.user_id', true), '')::uuid;
  v_role   text := nullif(current_setting('app.user_role', true), '');
  v_row    jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_action text := lower(tg_op);
begin
  if v_user is null then
    raise exception 'AUDIT_ACTOR_MISSING: toda escritura debe ejecutarse dentro de withActor()';
  end if;
  if tg_op = 'UPDATE' and to_jsonb(new)->>'status' = 'voided' and to_jsonb(old)->>'status' = 'active' then
    v_action := 'void';
  end if;
  insert into app.audit_log (actor_id, actor_role, action, entity, entity_id, before, after)
  values (v_user, v_role, v_action, tg_table_name, v_row->>'id',
          case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

create or replace function app.audit_log_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'AUDIT_LOG_IMMUTABLE';
end $$;

create trigger audit_log_no_update before update or delete on app.audit_log
  for each row execute function app.audit_log_immutable();
create trigger audit_log_no_truncate before truncate on app.audit_log
  for each statement execute function app.audit_log_immutable();
revoke update, delete, truncate on app.audit_log from public;

-- No physical delete on business tables (RN-020).
create or replace function app.no_delete() returns trigger
language plpgsql as $$
begin
  raise exception 'DELETE_FORBIDDEN: anular en lugar de borrar (RN-020)';
end $$;

-- Trigger names sort so guards run first: a_ (period guard), b_ (no delete), z_ (audit).
create trigger b_no_delete before delete on app.profiles
  for each row execute function app.no_delete();
create trigger z_audit after insert or update or delete on app.profiles
  for each row execute function app.audit_row();
