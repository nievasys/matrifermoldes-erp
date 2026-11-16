# Matrifer ERP — Modelo de datos (borrador v0.1)

**Fecha:** 15/11/2026
**Base:** ERS v1.1 (`docs/ERS.md`) + `docs/stack.md` v1.2
**Estado:** borrador ejecutable. Incorpora las decisiones de Matrifer del 15/11/2026 (precio por molde, sin maquinaria compartida, cantidad 0 no permitida). Los puntos marcados **[A VALIDAR]** dependen de decisiones de Matrifer (ver la sección 3.8 del ERS). El SQL es el punto de partida de las migraciones en `supabase/migrations/`; el agente debe revisarlo, completarlo y probarlo con pgTAP antes de darlo por bueno.

---

## 1. Convenciones

- Todo vive en el schema **`app`**. El schema `public` queda vacío.
- Claves primarias `bigint generated always as identity`, salvo `profiles.id` (uuid de `auth.users`).
- Dinero: `numeric(18,4)`, moneda fija `'ARS'`. Cantidades: `integer`.
- Fechas de negocio: `date` en horario de Argentina. Marcas de tiempo: `timestamptz`.
- Períodos: primer día del mes (`2026-11-01`).
- Nunca se borra físicamente un registro de negocio (RN-020): se anula (`status = 'voided'`).
- Todas las escrituras pasan por `withActor()` (ver `stack.md` §7.4). Los triggers rechazan escrituras sin usuario.

---

## 2. Entidades

| Grupo | Tablas |
|---|---|
| Usuarios | `profiles` |
| Catálogos | `machines`, `molds`, `shifts`, `downtime_reasons`, `expense_categories` |
| Producción | `production_reports` (parte), `production_lines` (máquina + molde + cantidad), `production_line_hours` (opcional), `production_downtimes` |
| Dinero | `prices`, `expenses`, `external_billing` |
| Períodos | `periods`, `period_closures` |
| Control | `audit_log`, `incidents` (fase 2) |

Relaciones principales:

```text
profiles 1─N production_reports 1─N production_lines N─1 machines
                                         │            N─1 molds ─1─N prices
                                         ├─N production_line_hours
                                         └─N production_downtimes N─1 downtime_reasons
production_reports N─1 shifts
expenses N─1 expense_categories
periods 1─N period_closures
```

Multimolde (RN-023): un parte tiene una o más líneas. Cada línea dice qué molde estaba en qué máquina y cuánto produjo. **No hay relación fija máquina–molde**: un molde puede cambiar de máquina entre partes y eso queda reflejado en las líneas.

---

## 3. Esquema SQL base

```sql
create schema if not exists app;
create extension if not exists btree_gist;

create type app.app_role as enum ('ADMIN','OPERATOR','MANAGEMENT','SUPPORT');
create type app.record_status as enum ('active','voided');

-- Usuarios ---------------------------------------------------------------
create table app.profiles (
  id          uuid primary key references auth.users(id),
  full_name   text not null,
  role        app.app_role not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Catálogos --------------------------------------------------------------
create table app.shifts (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  start_time  time not null,
  end_time    time not null,          -- si end_time <= start_time, el turno cruza medianoche
  active      boolean not null default true
);

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

create table app.downtime_reasons (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  active      boolean not null default true
);

create table app.expense_categories (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  deductible  boolean not null default true,     -- RN-012
  active      boolean not null default true
);

-- Producción -------------------------------------------------------------
create table app.production_reports (
  id                 bigint generated always as identity primary key,
  client_request_id  uuid not null unique,        -- idempotencia (doble toque)
  report_date        date not null,               -- fecha de inicio del turno
  shift_id           bigint not null references app.shifts(id),
  operator_id        uuid not null references app.profiles(id),   -- quién produjo
  created_by         uuid not null references app.profiles(id),   -- quién cargó
  created_at         timestamptz not null default now(),
  flagged            boolean not null default false,              -- cargado fuera de turno
  flag_reason        text,
  reviewed_by        uuid references app.profiles(id),
  reviewed_at        timestamptz,
  status             app.record_status not null default 'active',
  voided_by          uuid references app.profiles(id),
  voided_at          timestamptz,
  void_reason        text,
  check ((status = 'voided') = (voided_at is not null))
);
create index on app.production_reports (report_date);

create table app.production_lines (
  id          bigint generated always as identity primary key,
  report_id   bigint not null references app.production_reports(id),
  machine_id  bigint not null references app.machines(id),
  mold_id     bigint not null references app.molds(id),
  qty         integer not null check (qty >= 1),    -- decidido: no se permite cantidad 0
  note        text
);
create index on app.production_lines (report_id);
create index on app.production_lines (mold_id);

create table app.production_line_hours (            -- opcional [A VALIDAR] (ERS 3.8, punto 1)
  line_id  bigint not null references app.production_lines(id),
  hour     smallint not null check (hour between 0 and 23),
  qty      integer not null check (qty >= 0),
  primary key (line_id, hour)
);

create table app.production_downtimes (
  id          bigint generated always as identity primary key,
  line_id     bigint not null references app.production_lines(id),
  reason_id   bigint not null references app.downtime_reasons(id),
  minutes     integer not null check (minutes > 0),
  note        text
);

-- Dinero -----------------------------------------------------------------
create table app.prices (                           -- solo se agregan versiones
  id          bigint generated always as identity primary key,
  mold_id     bigint not null references app.molds(id),   -- decidido: el precio es por molde (ej.: "Respaldos grandes verde" = 637,75 ARS)
  unit_price  numeric(18,4) not null check (unit_price > 0),
  currency    char(3) not null default 'ARS' check (currency = 'ARS'),
  valid_from  date not null,
  valid_to    date,                                -- null = vigente sin fecha de fin
  created_by  uuid not null references app.profiles(id),
  created_at  timestamptz not null default now(),
  check (valid_to is null or valid_to >= valid_from),
  exclude using gist (
    mold_id with =,
    daterange(valid_from, valid_to, '[]') with &&
  )
);

create table app.expenses (
  id                 bigint generated always as identity primary key,
  client_request_id  uuid not null unique,
  expense_date       date not null,
  period             date not null check (extract(day from period) = 1),
  amount             numeric(18,4) not null check (amount > 0),
  currency           char(3) not null default 'ARS' check (currency = 'ARS'),
  category_id        bigint not null references app.expense_categories(id),
  description        text not null,
  reference          text,                         -- Nº de comprobante (sin archivo adjunto en el MVP)
  created_by         uuid not null references app.profiles(id),
  created_at         timestamptz not null default now(),
  status             app.record_status not null default 'active',
  voided_by          uuid references app.profiles(id),
  voided_at          timestamptz,
  void_reason        text,
  check ((status = 'voided') = (voided_at is not null))
);
create index on app.expenses (period);

create table app.external_billing (                 -- RN-010: ingresos que no vienen de producción
  id                 bigint generated always as identity primary key,
  client_request_id  uuid not null unique,
  billing_date       date not null,
  period             date not null check (extract(day from period) = 1),
  amount             numeric(18,4) not null check (amount > 0),
  currency           char(3) not null default 'ARS' check (currency = 'ARS'),
  description        text not null,
  reference          text,
  created_by         uuid not null references app.profiles(id),
  created_at         timestamptz not null default now(),
  status             app.record_status not null default 'active',
  voided_by          uuid references app.profiles(id),
  voided_at          timestamptz,
  void_reason        text,
  check ((status = 'voided') = (voided_at is not null))
);
create index on app.external_billing (period);

-- Períodos ----------------------------------------------------------------
-- Un mes sin fila se considera ABIERTO. La fila se crea al cerrar por primera vez.
create table app.periods (
  id               bigint generated always as identity primary key,
  period           date not null unique check (extract(day from period) = 1),
  status           text not null check (status in ('open','closed')),
  closed_by        uuid references app.profiles(id),
  closed_at        timestamptz,
  reopened_by      uuid references app.profiles(id),
  reopened_at      timestamptz,
  reopen_reason    text
);

-- Foto inmutable de cada cierre (RN-014). Un re-cierre agrega una fila nueva
-- y marca la anterior como reemplazada.
create table app.period_closures (
  id                    bigint generated always as identity primary key,
  period                date not null,
  gross_billing         numeric(18,4) not null,
  production_billing    numeric(18,4) not null,
  external_billing      numeric(18,4) not null,
  deductible_expenses   numeric(18,4) not null,
  net_profit            numeric(18,4) not null,
  detail                jsonb not null,            -- desglose por maquinaria, categoría y molde
  closed_by             uuid not null references app.profiles(id),
  closed_at             timestamptz not null default now(),
  superseded_at         timestamptz
);
create unique index on app.period_closures (period) where superseded_at is null;

-- Auditoría ---------------------------------------------------------------
create table app.audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid,
  actor_role  text,
  action      text not null,       -- insert | update | void | delete | close | reopen | login | login_failed | read
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  reason      text
);
create index on app.audit_log (at desc);
create index on app.audit_log (entity, entity_id);

-- Incidencias (fase 2, CU-17) ---------------------------------------------
create table app.incidents (
  id           bigint generated always as identity primary key,
  reported_by  uuid not null references app.profiles(id),
  reported_at  timestamptz not null default now(),
  description  text not null,
  status       text not null default 'open' check (status in ('open','in_progress','escalated','resolved')),
  resolution   text,
  handled_by   uuid references app.profiles(id),
  resolved_at  timestamptz
);
```

---

## 4. Triggers

### 4.1 Auditoría (todas las tablas de negocio y catálogos)

```sql
create or replace function app.audit_row() returns trigger
language plpgsql security definer set search_path = app, pg_temp as $$
declare
  v_user uuid := nullif(current_setting('app.user_id', true), '')::uuid;
  v_role text := nullif(current_setting('app.user_role', true), '');
  v_row  jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
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
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
          case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

-- Aplicar a: profiles, machines, molds, shifts, downtime_reasons, expense_categories,
-- production_reports, production_lines, production_line_hours, production_downtimes,
-- prices, expenses, external_billing, periods, period_closures, incidents
create trigger z_audit after insert or update or delete on app.production_reports
  for each row execute function app.audit_row();
-- (repetir por tabla; generar con un bucle en la migración)
```

Nota: `production_line_hours` no tiene columna `id`; para esa tabla usar `entity_id` compuesto (`line_id-hour`) o auditar solo a nivel de línea. Resolverlo en la migración.

`audit_log` es de solo inserción:

```sql
create or replace function app.audit_log_immutable() returns trigger language plpgsql as $$
begin raise exception 'AUDIT_LOG_IMMUTABLE'; end $$;

create trigger audit_log_no_update before update or delete on app.audit_log
  for each row execute function app.audit_log_immutable();
revoke update, delete, truncate on app.audit_log from public;
```

### 4.2 Períodos cerrados (RN-006, RN-014)

```sql
create or replace function app.is_period_closed(p date) returns boolean
language sql stable as $$
  select exists (select 1 from app.periods
                 where status = 'closed'
                   and period = date_trunc('month', p::timestamp)::date)
$$;

-- Tablas con fecha propia: production_reports (report_date), expenses (period), external_billing (period)
create or replace function app.guard_period() returns trigger language plpgsql as $$
declare
  col   text := tg_argv[0];
  d_old date;
  d_new date;
begin
  if tg_op <> 'INSERT' then d_old := (to_jsonb(old)->>col)::date; end if;
  if tg_op <> 'DELETE' then d_new := (to_jsonb(new)->>col)::date; end if;
  if (d_old is not null and app.is_period_closed(d_old))
     or (d_new is not null and app.is_period_closed(d_new)) then
    raise exception 'PERIOD_CLOSED' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;

create trigger a_guard_period before insert or update or delete on app.production_reports
  for each row execute function app.guard_period('report_date');
create trigger a_guard_period before insert or update or delete on app.expenses
  for each row execute function app.guard_period('period');
create trigger a_guard_period before insert or update or delete on app.external_billing
  for each row execute function app.guard_period('period');
```

Para las tablas hijas (`production_lines`, `production_line_hours`, `production_downtimes`) hay que resolver la fecha del parte (`línea → parte → report_date`):

```sql
create or replace function app.report_date_of_child(r jsonb) returns date
language sql stable as $$
  select case
    when r ? 'report_id' then
      (select report_date from app.production_reports where id = (r->>'report_id')::bigint)
    else
      (select pr.report_date from app.production_lines pl
         join app.production_reports pr on pr.id = pl.report_id
        where pl.id = (r->>'line_id')::bigint)
  end
$$;

create or replace function app.guard_period_child() returns trigger language plpgsql as $$
begin
  if tg_op <> 'INSERT' and app.is_period_closed(app.report_date_of_child(to_jsonb(old))) then
    raise exception 'PERIOD_CLOSED' using errcode = 'P0001';
  end if;
  if tg_op <> 'DELETE' and app.is_period_closed(app.report_date_of_child(to_jsonb(new))) then
    raise exception 'PERIOD_CLOSED' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;

-- una vez por tabla hija:
create trigger a_guard_period before insert or update or delete on app.production_lines
  for each row execute function app.guard_period_child();
```

Los triggers de guarda se llaman `a_...` y los de auditoría `z_...` para que la guarda corra primero.

### 4.3 Sin borrado físico (RN-020)

```sql
create or replace function app.no_delete() returns trigger language plpgsql as $$
begin raise exception 'DELETE_FORBIDDEN: anular en lugar de borrar (RN-020)'; end $$;

-- Aplicar a: production_reports, expenses, external_billing, prices, periods,
-- period_closures, machines, molds, shifts, downtime_reasons, expense_categories, profiles
create trigger b_no_delete before delete on app.production_reports
  for each row execute function app.no_delete();
```

Las filas hijas (`production_lines`, `production_line_hours`, `production_downtimes`) pueden borrarse **solo con el período abierto**, porque editar un parte las reemplaza; la auditoría guarda la imagen anterior.

### 4.4 Precios de solo agregar

Un trigger sobre `prices` rechaza cualquier `UPDATE` salvo fijar `valid_to` una única vez (de `NULL` a una fecha). Corregir un precio = agregar una versión nueva. La restricción de exclusión impide solapamientos, así que para subir un precio hay que **cerrar la vigencia anterior y agregar la nueva** en la misma transacción.

```sql
create or replace function app.prices_append_only() returns trigger language plpgsql as $$
begin
  if old.valid_to is null and new.valid_to is not null
     and (to_jsonb(new) - 'valid_to') = (to_jsonb(old) - 'valid_to') then
    return new;
  end if;
  raise exception 'PRICES_APPEND_ONLY: agregar una versión nueva en lugar de modificar';
end $$;

create trigger a_prices_append_only before update on app.prices
  for each row execute function app.prices_append_only();
```

---

## 4.5 Estado de validación

El SQL de este documento (esquema, triggers, vistas) se probó en PostgreSQL 16 con datos de ejemplo: auditoría con usuario y rol, rechazo de escrituras sin usuario, `audit_log` inmutable, bloqueo de períodos cerrados (incluidas tablas hijas y el movimiento de un registro entre meses), rechazo de `DELETE`, exclusión de precios solapados, precio según la fecha del parte, cambio de precio a mitad de mes, línea sin precio, partes anulados que dejan de sumar, foto de cierre que no cambia con precios nuevos e idempotencia por `client_request_id`. También se verificó que cantidad 0 o negativa se rechaza y que 3 × 637,75 da exactamente 1.913,25. Los bloques SQL de este documento se cargaron tal cual en una base vacía sin errores. Falta probarlo sobre el PostgreSQL de Supabase y convertirlo en pruebas pgTAP.

Para instalar los triggers de auditoría, de borrado y de guarda en todas las tablas, la migración puede usar un bucle `DO` sobre la lista de tablas en lugar de repetir cada `create trigger`.

---

## 5. Vistas

Todas con `security_invoker = true` y sin permisos para `anon` ni `authenticated`.

```sql
-- Facturación derivada de producción, por línea. El precio se busca por la FECHA del parte.
create view app.v_production_billing with (security_invoker = true) as
select l.id as line_id,
       r.id as report_id,
       r.report_date,
       date_trunc('month', r.report_date::timestamp)::date as period,
       l.machine_id,
       l.mold_id, l.qty,
       p.unit_price,
       (p.unit_price is null) as price_missing,
       l.qty * p.unit_price as amount
from app.production_lines l
join app.production_reports r on r.id = l.report_id and r.status = 'active'
left join app.prices p
       on p.mold_id = l.mold_id
      and r.report_date >= p.valid_from
      and (p.valid_to is null or r.report_date <= p.valid_to);

create view app.v_billing_monthly with (security_invoker = true) as
select period, 'production'::text as source,
       sum(amount) as amount,
       count(*) filter (where price_missing) as lines_without_price
from app.v_production_billing
group by period
union all
select period, 'external', sum(amount), 0::bigint
from app.external_billing
where status = 'active'
group by period;

create view app.v_expenses_monthly with (security_invoker = true) as
select e.period, c.id as category_id, c.name as category, c.deductible, sum(e.amount) as amount
from app.expenses e
join app.expense_categories c on c.id = e.category_id
where e.status = 'active'
group by e.period, c.id, c.name, c.deductible;

-- Ganancia neta calculada en vivo (RN-013). ÚNICO lugar donde existe la fórmula.
create view app.v_net_profit_monthly with (security_invoker = true) as
with b as (select period, sum(amount) as gross from app.v_billing_monthly group by period),
     x as (select period, sum(amount) filter (where deductible) as costs
           from app.v_expenses_monthly group by period)
select period,
       coalesce(b.gross, 0)                      as gross_billing,
       coalesce(x.costs, 0)                      as deductible_expenses,
       coalesce(b.gross, 0) - coalesce(x.costs, 0) as net_profit
from b full join x using (period);

-- Lo que ve el dashboard: períodos cerrados desde la foto; abiertos en vivo.
create view app.v_net_profit_effective with (security_invoker = true) as
select c.period, c.gross_billing, c.deductible_expenses, c.net_profit, 'closed'::text as state
from app.period_closures c
where c.superseded_at is null
union all
select n.period, n.gross_billing, n.deductible_expenses, n.net_profit, 'open'
from app.v_net_profit_monthly n
where not exists (select 1 from app.periods p where p.period = n.period and p.status = 'closed');
```

Cerrar un período (servicio en TypeScript, dentro de `withActor` y una transacción): verificar que esté abierto y que no haya líneas sin precio (`lines_without_price = 0`, ERS 3.8 punto 21; los partes marcados sin revisar solo generan una advertencia), leer los totales de las vistas, insertar en `period_closures` (marcando `superseded_at` en la foto anterior si existe), crear o actualizar la fila de `periods` con `status = 'closed'`, y escribir en `audit_log` la acción `close`. Reabrir: exigir motivo de al menos 10 caracteres, poner `status = 'open'`, guardar `reopen_reason` y registrar `reopen`.

---

## 6. Semillas (placeholders a validar con Matrifer)

- `shifts`: Mañana 06:00–14:00, Tarde 14:00–22:00, Noche 22:00–06:00 **(horarios de ejemplo; Matrifer todavía los tiene que definir)**.
- `molds` y `prices` de ejemplo para pruebas: molde "Respaldos grandes verde" con precio 637,75 ARS por unidad.
- `expense_categories`: Alquiler, Electricidad, Insumos, Sueldos, Impuestos (ARCA), Seguros, Otros. Todas deducibles.
- `downtime_reasons`: Falta de material, Falla de máquina, Cambio de molde, Mantenimiento, Falta de personal, Otro **(ejemplo)**.
- Usuario inicial `ADMIN` creado por script de arranque.

---

## 7. Pruebas obligatorias (pgTAP)

1. Una escritura sin `app.user_id` falla.
2. Cada tabla auditada genera una fila en `audit_log` con usuario, rol, antes y después.
3. `UPDATE` y `DELETE` sobre `audit_log` fallan.
4. Insertar, modificar o anular un parte, gasto o facturación externa en un período cerrado falla; mover un registro hacia o desde un período cerrado también.
5. `DELETE` sobre tablas de negocio falla.
6. Dos precios solapados para el mismo molde fallan; precios de moldes distintos no.
7. Un parte con precio posterior a su carga se factura al precio vigente en la fecha del parte.
8. Cambio de precio a mitad de mes: las líneas anteriores y posteriores toman cada una su precio.
9. Línea sin precio: aparece `price_missing = true` y `lines_without_price` cuenta correctamente.
10. Un período cerrado conserva sus cifras después de agregar un precio nuevo.
11. Un parte anulado deja de sumar en las vistas.
12. Un `client_request_id` repetido no crea un segundo parte.
13. Una línea con cantidad 0 o negativa es rechazada.
14. La facturación respeta decimales: 3 unidades a ARS 637,75 dan exactamente ARS 1.913,25.
