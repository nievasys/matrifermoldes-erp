-- Production tables: catalogs and reports
-- Source: docs/data-model.md

-- Catalogs -------------------------------------------------------------------

create table app.machines (
  id          bigint generated always as identity primary key,
  code        text not null unique,
  name        text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table app.molds (
  id          bigint generated always as identity primary key,
  code        text not null unique,
  name        text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table app.shifts (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  start_time  time,  -- null until shifts are configured
  end_time    time,
  active      boolean not null default true
);

create table app.downtime_reasons (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  active      boolean not null default true
);

-- Production -----------------------------------------------------------------

create type app.record_status as enum ('active', 'voided');

create table app.production_reports (
  id              bigint generated always as identity primary key,
  report_date     date not null,
  shift_id        bigint not null references app.shifts (id),
  operator_names  text not null,  -- raw names from form, normalized later
  operator_id     uuid references app.profiles (id),  -- linked after normalization
  submitted_at    timestamptz not null,
  status          app.record_status not null default 'active',
  created_at      timestamptz not null default now(),
  created_by      uuid references app.profiles (id)
);

create index production_reports_date_idx on app.production_reports (report_date desc);
-- Period queries use report_date directly; extract year/month in the query

create table app.production_lines (
  id              bigint generated always as identity primary key,
  report_id       bigint not null references app.production_reports (id),
  machine_id      bigint not null references app.machines (id),
  mold_id         bigint not null references app.molds (id),
  quantity        integer not null check (quantity >= 1),  -- RN: cantidad 0 no permitida
  quantity_hour   integer,  -- pieces per hour (optional)
  status          app.record_status not null default 'active',
  created_at      timestamptz not null default now()
);

create index production_lines_report_idx on app.production_lines (report_id);
create index production_lines_mold_idx on app.production_lines (mold_id);
create index production_lines_machine_idx on app.production_lines (machine_id);

create table app.production_downtimes (
  id              bigint generated always as identity primary key,
  line_id         bigint not null references app.production_lines (id),
  reason_id       bigint references app.downtime_reasons (id),
  reason_text     text,  -- free text from form
  created_at      timestamptz not null default now()
);

-- RLS deny-all ---------------------------------------------------------------
alter table app.machines enable row level security;
alter table app.molds enable row level security;
alter table app.shifts enable row level security;
alter table app.downtime_reasons enable row level security;
alter table app.production_reports enable row level security;
alter table app.production_lines enable row level security;
alter table app.production_downtimes enable row level security;

-- No physical deletes --------------------------------------------------------
create trigger b_no_delete before delete on app.machines
  for each row execute function app.no_delete();
create trigger b_no_delete before delete on app.molds
  for each row execute function app.no_delete();
create trigger b_no_delete before delete on app.shifts
  for each row execute function app.no_delete();
create trigger b_no_delete before delete on app.production_reports
  for each row execute function app.no_delete();
create trigger b_no_delete before delete on app.production_lines
  for each row execute function app.no_delete();

-- Audit trails ---------------------------------------------------------------
create trigger z_audit after insert or update on app.machines
  for each row execute function app.audit_row();
create trigger z_audit after insert or update on app.molds
  for each row execute function app.audit_row();
create trigger z_audit after insert or update on app.shifts
  for each row execute function app.audit_row();
create trigger z_audit after insert or update on app.production_reports
  for each row execute function app.audit_row();
create trigger z_audit after insert or update on app.production_lines
  for each row execute function app.audit_row();

-- Views for dashboard --------------------------------------------------------
create or replace view app.v_production_monthly as
select
  date_trunc('month', r.report_date)::date as period,
  count(distinct r.id) as report_count,
  sum(l.quantity) as total_pieces,
  count(distinct l.mold_id) as mold_count,
  count(distinct l.machine_id) as machine_count
from app.production_reports r
join app.production_lines l on l.report_id = r.id
where r.status = 'active' and l.status = 'active'
group by 1;

create or replace view app.v_production_by_machine as
select
  date_trunc('month', r.report_date)::date as period,
  m.id as machine_id,
  m.name as machine_name,
  sum(l.quantity) as total_pieces
from app.production_reports r
join app.production_lines l on l.report_id = r.id
join app.machines m on m.id = l.machine_id
where r.status = 'active' and l.status = 'active'
group by 1, 2, 3;

create or replace view app.v_production_by_mold as
select
  date_trunc('month', r.report_date)::date as period,
  mo.id as mold_id,
  mo.name as mold_name,
  sum(l.quantity) as total_pieces
from app.production_reports r
join app.production_lines l on l.report_id = r.id
join app.molds mo on mo.id = l.mold_id
where r.status = 'active' and l.status = 'active'
group by 1, 2, 3;
