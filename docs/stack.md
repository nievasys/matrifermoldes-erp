# Matrifer ERP — Stack Tecnológico

**Versión:** 1.2
**Fecha:** 15/11/2026
**Base:** ERS Matrifer Moldes **v1.1** (15/11/2026), que ya integra las correcciones y las decisiones de Matrifer
**Arquitectura:** web full-stack, monolito modular, server-first, con muy poco JavaScript en el cliente.
**Objetivo de infraestructura:** capas gratuitas o de muy bajo costo, y mínima complejidad operativa.

Documentos hermanos: `docs/ERS.md` (requisitos; la sección 3.8 trae las decisiones y valores por defecto), `docs/data-model.md` (modelo de datos), `docs/DESIGN.md` (UI), `CLAUDE.md` (reglas para el agente de código).

---

## Historial de cambios

**v1.2 (15/11/2026)**

- Base actualizada al ERS (la v1.1 del stack apuntaba al v0.1). Las correcciones al ERS y los valores por defecto de los puntos pendientes se integraron en el propio ERS, que pasó a la versión 1.1. Multimolde (RN-023): un parte tiene una o más líneas máquina/molde → §8 y `data-model.md`.
- SvelteKit 3 ya es estable (01/10/2026): se usa desde el inicio → §4.
- Sin librerías de componentes: componentes propios con HTML nativo y `DESIGN.md` → §5. Se elimina shadcn-svelte.
- Gráficos: SVG propio renderizado en servidor; Chart.js queda como plan B → §5.5.
- Animaciones: lo incorporado en Svelte y CSS; sin Lenis; GSAP solo si hace falta, limitado a una ruta → §5.6.
- Se agregan los requisitos que el ERS exige y la v1.1 no cubría: auditoría con triggers (RNF 3.5.7), bloqueo de períodos cerrados (RN-006/014), anulación lógica (RN-020), dinero exacto (RN-021/022), 2FA de Gerencia, auditoría de lecturas → §8 y §9.
- Facturación: se calcula en una vista SQL por fecha de producción y no se guarda importe por fila (reemplaza la propuesta de la v1.1, que fallaba si el precio se cargaba después) → §10.
- Autenticación con `getClaims()` en lugar de `getUser()` en cada request → §9.
- Todo el código con acceso a la base o a secretos vive en `lib/server/` → §6.
- Región de Supabase y Cloudflare: São Paulo, Smart Placement, plan Workers pago recomendado en producción → §13.
- Fases del MVP definidas; los roles Gerencia y Soporte quedan para la fase 2 → §20.
- Decisiones de Matrifer incorporadas (15/11/2026): precio por molde, sin maquinaria compartida (se elimina la distinción propia/compartida), cantidad 0 no permitida.

**v1.1 (30/09/2026):** autorización en el servidor con RLS como respaldo; conexión por pooler o Hyperdrive; migraciones con Supabase CLI y Drizzle como query builder; agregaciones en SQL; límites reales del plan gratuito; spike técnico.

---

## 1. Resumen

| Capa | Tecnología | Rol |
|---|---|---|
| Framework | **SvelteKit 3 + Svelte 5 + TypeScript** | App full-stack |
| Estilos | **Tailwind CSS v4** (tokens en CSS) | Diseño según `DESIGN.md` |
| Componentes | **Propios** (HTML nativo + Svelte) | Sin librerías de UI |
| Validación | **Zod** | Formularios y datos |
| Backend | **Form Actions + `load` del servidor** | Lógica de negocio |
| Base de datos | **PostgreSQL en Supabase** (región São Paulo) | Persistencia |
| Migraciones | **Supabase CLI (SQL)** | Schema, triggers, vistas, RLS |
| Acceso a datos | **Drizzle ORM** (query builder; schema generado) | Consultas tipadas |
| Auth | **Supabase Auth** (cookies con `@supabase/ssr`) | Login, sesiones, TOTP |
| Autorización | **Guards en servidor** + RLS deny-all de respaldo | Control de acceso |
| Hosting | **Cloudflare Workers** (`@sveltejs/adapter-cloudflare`) | SSR |
| Gráficos | **SVG propio en servidor** | Dashboard |
| Tests | **Vitest + Playwright + pgTAP** | Calidad |
| CI/CD | **GitHub Actions** | Checks y deploy |
| Backups | **pg_dump nocturno → Cloudflare R2** | RPO ≤ 24 h |
| Offline | **PWA con cola local (condicional)** | Solo si falla el test de conectividad |

---

## 2. Principios

1. **Server-first.** SSR, `load` del servidor y Form Actions. JavaScript en el cliente solo donde agrega interacción real.
2. **A medida.** El sistema cubre lo que dice el ERS y no crece más allá. Dos tipos de usuario reales: Administración (escritorio) y Operarios (tablet o PC de planta).
3. **Las reglas importantes viven en la base.** Auditoría, períodos cerrados, no borrar y dinero exacto se garantizan con triggers y restricciones, no solo con código de la aplicación.
4. **Componentes propios.** Sin librerías de componentes. La referencia visual está en `docs/DESIGN.md`.
5. **Medir antes de optimizar.** El spike (§19) valida los supuestos de infraestructura antes de construir.

---

## 3. Arquitectura

```text
Usuarios (Operario / Admin / Gerencia / Soporte)
        │ HTTPS
        ▼
Cloudflare Workers ── SvelteKit 3 (SSR + Form Actions)
        │
        ├── Supabase Auth      (login, sesión, TOTP)
        └── PostgreSQL         (vía Hyperdrive o pooler; Drizzle como rol postgres)
              └── schema "app": tablas, vistas, triggers de auditoría y de períodos
```

El navegador solo habla con Supabase Auth. Los datos pasan siempre por el servidor. Como Drizzle usa el rol `postgres` y omite RLS, **la autorización se resuelve en el servidor** (§9).

---

## 4. Versiones y arranque del proyecto

SvelteKit 3 salió estable el 01/10/2026. Se crea el proyecto con `npx sv create` y se usa lo que genera. No copiar configuración de tutoriales de SvelteKit 2.

Puntos de la versión 3 que importan (verificar en la documentación vigente):

- Requiere Node 22, TypeScript 6 y Vite 8.
- La configuración pasa a `vite.config.ts`.
- El alias `$lib` se reemplaza por `#lib`.
- `$app/stores` se reemplaza por `$app/state`.
- Svelte 5 con runes (`$state`, `$derived`, `$props`).

Todo el código nuevo usa runes y `$app/state`.

---

## 5. Frontend y UI

### 5.1 Decisión: componentes propios
No se usa ninguna librería de componentes (ni shadcn-svelte ni equivalentes). El agente de código construye los componentes a partir de `docs/DESIGN.md`, que define tokens visuales e inventario de componentes. Usar HTML nativo siempre que alcance:

| Necesidad | Solución |
|---|---|
| Modal | `<dialog>` con `showModal()` y `backdrop-filter` |
| Menús flotantes | atributo `popover` |
| Selects y autocompletar | `<select>`, `<datalist>` |
| Fechas | `<input type="date">` |
| Tablas | HTML; filtros, orden y paginación por parámetros de URL (renderizadas en el servidor) |
| Avisos con "Deshacer" | store pequeño en Svelte |

### 5.2 Estilos
Tailwind v4 con los tokens definidos en CSS (`@theme`) tomados de `DESIGN.md`. Fuentes autoalojadas (`@fontsource`), nunca desde un CDN externo.

### 5.3 Dos densidades de interfaz
- **Planta (Operario):** pantalla sobria y rápida, objetivos táctiles grandes, formulario de parte de producción en ≤ 60 s (RNF 3.5.4). Sin animaciones pesadas ni `backdrop-filter`.
- **Administración:** interfaz completa y densa según `DESIGN.md`, para escritorio.

### 5.4 Formulario del operario (ruta crítica)
- Funciona **sin JavaScript** (Form Action) y se mejora con `use:enhance`.
- Fecha de hoy por defecto, calculada en zona horaria `America/Argentina/Buenos_Aires`.
- Recuerda la última máquina, molde y turno usados en ese dispositivo.
- Campos numéricos con `inputmode="numeric"`.
- Cada envío lleva un `client_request_id` (UUID generado al abrir el formulario) para que un doble toque no duplique el parte.
- Accesible por teclado (RNF 3.5.14).

### 5.5 Gráficos
SVG propio renderizado en el servidor: sparklines, líneas y áreas con degradé, barras y barras de progreso. El ERP necesita pocos tipos de gráfico y el estilo de `DESIGN.md` se logra con más fidelidad en SVG que configurando una librería. Tooltips mínimos con mejora progresiva. **Plan B:** Chart.js solo si una vista exige interacción compleja, cargado únicamente en esa ruta.

### 5.6 Animaciones
- Usar lo incorporado en Svelte: `transition:`, `in:`/`out:`, `animate:flip`, `tweened` y `spring`.
- Transición entre páginas con la API View Transitions (`onNavigate`).
- **GSAP** (no depende de ningún framework) solo si más adelante hay una secuencia compleja; importarlo en esa ruta únicamente.
- **No usar Lenis** ni scroll suave: perjudica tablas largas, paneles con scroll propio, teclado y tablets.
- Respetar `prefers-reduced-motion`. Las animaciones van al final del trabajo de UI.

---

## 6. Backend

### 6.1 Flujo
```text
Route → Action → Guard de rol → Validación Zod → Service (si hay reglas) → Query Drizzle → PostgreSQL
```

- El CRUD simple (máquinas, moldes, categorías) llama a la query desde la action, sin service.
- Un service existe solo cuando hay reglas de negocio (producción, precios, cierre de período).
- Server Routes (`+server.ts`) solo para exportaciones, `/health` y webhooks.

### 6.2 Estructura
Todo lo que toca la base o secretos va bajo `lib/server/`, porque SvelteKit impide importar esa carpeta desde código de cliente.

```text
src/
├── routes/
│   ├── (auth)/login/
│   ├── (app)/
│   │   ├── dashboard/  produccion/  gastos/  precios/  facturacion/
│   │   ├── maquinas/  moldes/  turnos/  periodos/  usuarios/  auditoria/
│   └── health/
├── lib/                        # importado como #lib
│   ├── components/             # UI propia (ver DESIGN.md)
│   ├── charts/                 # SVG propio
│   ├── validations/            # schemas Zod compartidos
│   ├── format/                 # moneda es-AR, fechas
│   └── server/
│       ├── db/                 # client.ts (por request), schema.ts (generado), tx.ts (withActor)
│       ├── auth/               # sesión, getClaims, MFA
│       ├── guards/             # require-role.ts, permissions.ts (matriz única)
│       ├── services/           # production, periods, prices
│       ├── queries/            # Drizzle por dominio y lectura de vistas
│       ├── calculations/       # funciones puras (dinero con big.js)
│       └── audit/              # registro de lecturas
├── hooks.server.ts
└── app.d.ts
supabase/ { migrations/  tests/  config.toml }
tests/ { unit/  e2e/ }
docs/  CLAUDE.md  wrangler.jsonc  vite.config.ts  drizzle.config.ts
```

---

## 7. Base de datos

### 7.1 Supabase
- **Región São Paulo (`sa-east-1`)**, la más cercana a Moreno.
- Todas las tablas, vistas y funciones viven en el schema **`app`**. El schema `public` queda vacío. Así la Data API (PostgREST) no expone nada. Si es posible, desactivar la Data API en el panel.
- RLS habilitado en todas las tablas, sin políticas para `anon` ni `authenticated` (deny-all). Es un respaldo; la autorización real está en el servidor.
- Las vistas se crean con `security_invoker = true` y se revoca todo acceso a `anon` y `authenticated`.
- Storage no se usa en el MVP (los comprobantes quedan fuera, ver ERS 3.8, punto 9).

### 7.2 Migraciones y Drizzle
- **La fuente de verdad son las migraciones SQL de Supabase CLI** (`supabase/migrations/`): tablas, restricciones, triggers, vistas, RLS.
- `lib/server/db/schema.ts` se genera con `drizzle-kit pull` (filtrando el schema `app`) y no se edita a mano.
- Un solo sistema de migraciones.

### 7.3 Conexión desde Workers
- Hyperdrive de Cloudflare o pooler de Supabase en modo transacción (puerto 6543). Con Hyperdrive, usar la cadena de conexión directa de Supabase (verificar en el spike).
- Con el pooler transaccional: `prepare: false` en `postgres.js`.
- **El cliente se crea dentro del request** (en `hooks.server.ts`, guardado en `event.locals`). Workers no permite abrir conexiones en el scope global.
- Pool chico (1 a 5 conexiones).
- Plan B si Drizzle sobre TCP da problemas persistentes: `supabase-js` por HTTP para las consultas.

### 7.4 Escrituras: siempre dentro de `withActor`
Como Drizzle se conecta como `postgres`, los triggers de auditoría no saben qué usuario hizo el cambio. Toda escritura pasa por `withActor(userId, role, fn)` (`lib/server/db/tx.ts`), que abre una transacción y ejecuta `select set_config('app.user_id', ..., true)` y `app.user_role` antes de la operación. Los triggers leen esos valores y **rechazan la escritura si no están presentes**. Funciona con pooler transaccional porque el ajuste es local a la transacción.

---

## 8. Reglas que viven en la base de datos

Detalle y SQL base en `docs/data-model.md`.

| Regla (ERS) | Implementación |
|---|---|
| Auditoría de operaciones críticas, sin borrar eventos (RNF 3.5.7, RN-007, 3.4.8.3-4) | Tabla `audit_log` solo de inserción, llenada por triggers (antes/después en JSON, usuario, rol, fecha/hora). Sin `UPDATE` ni `DELETE` posibles. |
| Períodos cerrados inmutables (RN-006, RN-014, RF 3.4.2.12, 3.4.5.6, 3.4.6.6) | Trigger que rechaza insertar, modificar o borrar datos cuyo mes figure como cerrado en `periods`. Considera la fecha vieja y la nueva al mover un registro. |
| Anulación lógica, sin borrado físico (RN-020) | Columnas `status`, `voided_by`, `voided_at`, `void_reason`. Trigger que rechaza `DELETE` en tablas de negocio. |
| Dinero exacto (RN-021, RN-022) | `numeric(18,4)`, `currency` fijo en `'ARS'`. Los cálculos en SQL. En TypeScript, `big.js`, solo en servidor. Se muestra con 2 decimales vía `Intl.NumberFormat('es-AR')`. Nunca `float`. |
| Precios con vigencia sin solaparse (RN-008/009) | Tabla `prices` de solo agregar versiones, con restricción de exclusión por molde y rango de fechas. |
| Multimolde (RN-023) | Parte con encabezado y N líneas (máquina, molde, cantidad). No hay relación fija máquina–molde: la línea registra qué molde estaba en qué máquina en ese momento. |
| Un envío duplicado no duplica el parte | `client_request_id` único en producción, gastos y facturación externa. |
| Fechas locales | Fechas de negocio como `date` (zona Argentina). Turno nocturno que cruza medianoche: la fecha del parte es la de inicio del turno. Nunca usar `new Date()` del Worker para "hoy" sin zona horaria. |

---

## 9. Autenticación y autorización

### 9.1 Autenticación
- Supabase Auth con sesión en cookies (`@supabase/ssr`) resuelta en `hooks.server.ts`.
- Verificar la sesión con **`getClaims()`**, que valida el JWT localmente cuando el proyecto usa claves de firma asimétricas (habilitarlas). No usar `getUser()` en cada request: es una llamada de red cada vez.
- Después de `getClaims()`, una consulta a `profiles` (indexada) para obtener `role` y `active`. Se consulta en cada request para que desactivar a un usuario tenga efecto inmediato.
- Usuarios operarios: el Administrador los crea con la API de administración (clave secreta), con **email sintético** (`usuario@matrifer.internal`, `email_confirm: true`) y contraseña. No se envían mails. El Administrador restablece contraseñas.
- Tablet compartida: cada operario tiene su cuenta (hace falta `created_by`). La sesión persiste y la pantalla tiene un botón claro de "cambiar operario". Ver ERS 3.8, punto 20.

### 9.2 Roles
`ADMIN`, `OPERATOR`, `MANAGEMENT`, `SUPPORT` (los cuatro del ERS) en el enum desde el inicio y en la matriz de permisos. El rol se guarda en `profiles.role`, **nunca** en metadata editable por el usuario.

- **Fase 1 (MVP):** solo `ADMIN` y `OPERATOR` tienen interfaz.
- **Fase 2:** `MANAGEMENT` y `SUPPORT`.

### 9.3 Autorización en el servidor
- `hooks.server.ts` carga `locals.user` y `locals.role`.
- `requireRole(...)` se llama al inicio de **cada** `load`, action y endpoint. Un guard en `+layout.server.ts` no protege las form actions.
- La matriz de permisos vive en un único archivo (`permissions.ts`), derivada de la matriz 3.2.3 del ERS v1.1, y se prueba con tests. Se prueba la action directamente, no solo que el botón esté oculto.
- Permisos configurables por constante, con su valor por defecto documentado (por ejemplo `operatorCanEditOwn = false`).

### 9.4 Gerencia: 2FA y auditoría de lecturas (fase 2)
- TOTP de Supabase (gratuito). Para `MANAGEMENT`, exigir nivel de aseguramiento `aal2` en el guard.
- El ERS pide "historial de auditoría de consultas" de Gerencia, y la auditoría de accesos de Soporte a datos de negocio. Los triggers no registran lecturas: se registra en el servidor (`audit/read.ts`) con `action = 'read'` en las rutas financieras para esos dos roles.

---

## 10. Cálculos y dashboard

- **La facturación derivada de producción no se guarda por fila.** Se calcula en la vista `app.v_production_billing`: cantidad × precio vigente del molde en la **fecha del parte**. Así, un precio cargado después, o un cambio de precio a mitad de mes, queda bien sin recalcular nada, y todas las pantallas coinciden (RN-017).
- Parte sin precio vigente: la vista lo marca (`price_missing`) y el dashboard avisa "hay N líneas sin precio". Nunca muestra un total silenciosamente incompleto (CU-12, flujo alternativo 1). Un período con líneas sin precio no se puede cerrar (ERS 3.8, punto 21).
- Ganancia neta = facturación computable − gastos deducibles (RN-013). La fórmula existe **solo** en la vista `v_net_profit_monthly` y se documenta en `docs/business-rules.md`.
- **Períodos cerrados:** el resultado se lee de `period_closures` (foto inmutable tomada al cerrar). Las cifras de un período cerrado no cambian aunque cambien los precios (RN-008, RN-014).
- Las agregaciones se hacen en PostgreSQL, no en JavaScript, por el límite de CPU de Workers. Las consultas independientes de una página van con `Promise.all`.
- Trazabilidad (RNF 3.5.15): cada KPI enlaza a una vista de detalle con sus registros de origen.
- Actualización: el dashboard muestra "actualizado hace X". Se refresca al volver a la pestaña y cada 60 s mientras está visible. Solo el dashboard, y no los operarios. Ajustable cuando Matrifer defina "inmediatez" (ERS 3.8, punto 13).

---

## 11. Seguridad

- HTTPS, cookies `httpOnly`/`secure`/`sameSite`, protección CSRF por origen de SvelteKit activa.
- Cabeceras de seguridad y CSP con `kit.csp`.
- Validación Zod en el servidor siempre; la del navegador es solo comodidad.
- Autorización por rol en cada action y endpoint, con tests.
- RLS deny-all, schema `app` fuera de la Data API y vistas con `security_invoker`.
- Secretos solo en Cloudflare y `.env` local; nada con prefijo `PUBLIC_` que sea secreto.
- Auditoría por triggers (§8) y de lecturas (§9.4).

---

## 12. Testing

- **Vitest:** cálculos, validaciones, reglas de negocio, permisos por rol. Casos mínimos de dinero: redondeo, límite de mes, cambio de precio a mitad de mes, parte sin precio, cierre y reapertura.
- **pgTAP (`supabase/tests/`):** triggers de auditoría, bloqueo de períodos cerrados, rechazo de `DELETE`, exclusión de precios solapados, vistas de facturación y ganancia neta.
- **Playwright:** flujo operario (login → parte en ≤ 60 s) y flujo admin (gasto → precio → dashboard → cierre de período).
- RNF 3.5.10: las reglas de facturación, costos, ganancia neta y cierres tienen pruebas automáticas.

---

## 13. Cloudflare Workers

- Adaptador `@sveltejs/adapter-cloudflare`. Configuración en `wrangler.jsonc` (formato recomendado hoy) con `nodejs_compat`. Verificar en la documentación vigente si se despliega como Workers con assets (recomendado para proyectos nuevos).
- **Smart Placement** evaluable en el spike: acerca el Worker a la base cuando cada request hace varias consultas.
- El plan gratuito alcanza para el spike. **Para producción se recomienda el plan pago de Workers (alrededor de USD 5/mes):** el límite gratuito de 10 ms de CPU por request es ajustado para renderizar páginas con tablas y SVG. Se mide en el spike.

| Restricción | Valor (verificar vigente) | Implicancia |
|---|---|---|
| Requests (gratis) | 100.000/día | Suficiente con pocos usuarios; sin polling excesivo |
| CPU por request (gratis) | 10 ms (cuenta CPU, no espera de red) | Agregaciones en SQL; paginar; sin `.xlsx` en el Worker |
| Runtime | No es Node completo | Evitar librerías que usen `fs` |
| I/O global | No permitido | Clientes de base dentro del request |
| Estado de módulo | Compartido entre requests | No guardar datos de usuario en variables de módulo |
| Hyperdrive (gratis) | 100.000 consultas/día | Cada página hace pocas consultas |

---

## 14. Variables de entorno

```env
# Públicas
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Solo servidor
DATABASE_URL=            # Hyperdrive o pooler transaccional (6543)
SUPABASE_SECRET_KEY=     # solo para crear usuarios y tareas de administración
```

Credenciales distintas por ambiente. Verificar los nombres vigentes de las claves en el panel de Supabase. Nunca prefijo `PUBLIC_` en secretos.

---

## 15. CI/CD y ambientes

- GitHub Actions por PR: lint, typecheck, Vitest, pgTAP (con `supabase start`), build. Deploy de producción solo desde `main`.
- Ramas: `main` + `feature/*`.
- Ambientes: **local** (`supabase start`), **staging** (segundo proyecto Supabase con datos de prueba), **producción**. Las migraciones se aplican con `supabase db push` desde CI con aprobación manual.

---

## 16. Costos, backups y operación

| Servicio | Límite relevante | Riesgo | Mitigación |
|---|---|---|---|
| Supabase Free | 500 MB; pausa tras una semana sin actividad; sin backups | Pausa en cierres de planta; sin respaldo propio | Endpoint `/health` + UptimeRobot; backup propio |
| Supabase Pro (ref.) | ~USD 25/mes, backups diarios con 7 días | Costo | **Recomendado en producción** con datos financieros reales |
| Cloudflare Workers | ver §13 | CPU / requests | Plan pago |

Verificar los términos de uso comercial de cada plan gratuito antes de operar el negocio en él.

**Backups**
- GitHub Actions ejecuta `pg_dump` cada noche hacia un bucket privado de R2, con credenciales en secretos de GitHub. Retención propuesta: 30 diarios y 12 mensuales.
- Usar la conexión de sesión del pooler de Supabase (el host directo es IPv6 y los runners de GitHub son IPv4). La versión de `pg_dump` debe coincidir con la del servidor.
- Un backup nocturno deja el RPO justo en 24 h (RNF 3.5.11): si una noche falla, se incumple. Por eso se recomienda Supabase Pro además del backup propio.
- **Probar la restauración en staging periódicamente** y medir el RTO (objetivo ≤ 4 h).

**Pausa por inactividad (plan gratuito):** `/health` con `SELECT 1`, consultado por UptimeRobot.

**Monitoreo:** UptimeRobot, logs de Cloudflare (atención a errores por exceso de CPU), Sentry opcional.

---

## 17. Conectividad de planta y modo offline

La estabilidad de la conexión en la planta no está verificada.

**Test de conectividad:** página mínima en Cloudflare abierta en un dispositivo real de planta, con un latido por minuto durante los turnos, guardando latencia y fallos en Supabase staging, durante una semana completa y en los lugares físicos donde se carga la producción.

**Criterios propuestos (a ajustar):** ≥ 99 % de latidos exitosos en horario de turno, latencia p95 < 1,5 s, ninguna interrupción mayor a 5 minutos en horas de carga.

Si se cumplen, se mantiene server-first sin offline. Si no, se agrega **PWA con cola local**: partes en IndexedDB con UUID del cliente (idempotencia, ya presente por `client_request_id`), reintento al recuperar conexión y al abrir la app, indicador de "pendiente de sincronizar", solo altas offline.

---

## 18. Importación y exportación

- **Importación histórica:** script único desde una máquina local que lee CSV de las planillas actuales, usa los mismos schemas Zod, carga primero en staging, es idempotente y reporta filas rechazadas. Se concilian los totales por mes contra las planillas.
- **Exportación (RNF 3.5.13):** CSV generado en el servidor; `.xlsx` en el navegador con SheetJS bajo demanda. Nunca `.xlsx` en el Worker.

---

## 19. Spike técnico de validación (antes del MVP)

Despliegue en Cloudflare (gratis) contra Supabase staging, en uno o dos días. Pasan los ocho puntos:

1. Login con Supabase Auth y cookies vía `hooks.server.ts`, con una ruta protegida y `getClaims()` verificando localmente.
2. Una form action que escribe con Drizzle por pooler (`prepare: false`) o Hyperdrive, **dentro de `withActor`**, repetida decenas de veces para detectar fallos intermitentes.
3. El trigger de auditoría registra usuario y rol; una escritura sin `withActor` es rechazada.
4. Un guard de rol: un `OPERATOR` no puede ejecutar acciones de `ADMIN`, probando la action directamente.
5. Una vista SQL de agregación en una página, midiendo tiempo y **CPU del request** en Cloudflare.
6. RLS deny-all: una consulta a la API REST con la clave publicable no devuelve datos (o la Data API está desactivada).
7. Una migración con Supabase CLI, `drizzle-kit pull` y los tests corriendo en CI.
8. El latido de conectividad (§17) corriendo en la planta.

Alternativas si algo falla: Hyperdrive, luego `supabase-js` por HTTP; si el CPU se excede, mover agregaciones a SQL o pasar al plan pago de Workers.

---

## 20. Fases

| Fase | Contenido |
|---|---|
| **0** | Spike (§19) y test de conectividad |
| **1a** | Esquema base: perfiles, catálogos, `audit_log`, `periods`, triggers; login y guards |
| **1b** | Formulario del operario (multimolde, paradas, idempotencia) y consulta de producción |
| **1c** | Administración: máquinas, moldes, turnos, motivos de parada, precios, gastos, categorías, facturación externa |
| **1d** | Vistas de facturación y ganancia neta; dashboard con trazabilidad |
| **1e** | Cierre y reapertura de período con foto; exportación CSV; backups; importación |
| **2** | Gerencia con 2FA y auditoría de lecturas; Soporte e incidencias (CU-17); PWA si el test lo exige |

---

## 21. Decisiones

| Decisión | Elección |
|---|---|
| Arquitectura | Monolito modular, server-first |
| Framework | SvelteKit 3 + Svelte 5 + TypeScript |
| UI | Componentes propios + Tailwind v4 + `DESIGN.md` |
| Gráficos | SVG propio en servidor (Chart.js plan B) |
| Animaciones | Svelte + CSS + View Transitions; sin Lenis |
| Base de datos | PostgreSQL en Supabase, región São Paulo, schema `app` |
| Migraciones | SQL con Supabase CLI |
| Acceso a datos | Drizzle (query builder) vía Hyperdrive o pooler |
| Auth | Supabase Auth, `getClaims()` |
| Autorización | Guards en servidor; RLS deny-all |
| Reglas críticas | Triggers: auditoría, períodos, no borrar |
| Dinero | `numeric(18,4)`, ARS, `big.js` en servidor |
| Facturación | Vista SQL por fecha de producción; foto al cerrar |
| Hosting | Cloudflare Workers (plan pago en producción) |
| Backups | `pg_dump` a R2 + Supabase Pro |
| Offline | Condicional al test de conectividad |

---

## 22. Pendientes que bloquean decisiones de negocio

Ver la sección 3.8 del ERS v1.1: los 13 puntos originales y ocho nuevos, cada uno con su estado y el valor por defecto adoptado para poder programar. Matrifer ya resolvió tres: el precio es por molde, no existe maquinaria compartida y no se permite cantidad 0. Queda pendiente definir los horarios de los turnos (punto 19), que se cargan desde el catálogo sin tocar código.
