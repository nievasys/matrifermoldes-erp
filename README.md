# Matrifer ERP

ERP a medida para **Matrifer Moldes** (planta en Moreno, Buenos Aires). Administración carga precios y gastos,
cierra períodos y consulta el dashboard; los operarios cargan partes de producción desde una tablet o PC de planta.
Stack: SvelteKit 3 + Svelte 5 + TypeScript sobre Cloudflare Workers, PostgreSQL en Supabase (schema `app`).

## Documentación

Leer en este orden:

1. [`CLAUDE.md`](CLAUDE.md) — reglas del proyecto que no se negocian.
2. [`docs/ERS.md`](docs/ERS.md) — especificación de requisitos v1.1, fuente de verdad del negocio.
3. [`docs/stack.md`](docs/stack.md) — stack, arquitectura y decisiones técnicas.
4. [`docs/data-model.md`](docs/data-model.md) — esquema SQL, triggers y vistas.
5. [`docs/DESIGN.md`](docs/DESIGN.md) — lenguaje visual y componentes.

Además: [`docs/commits.md`](docs/commits.md) — convención de commits (en español, Conventional Commits).

## Requisitos

- Node.js >= 22
- pnpm
- Docker (para levantar Supabase en local)

## Puesta en marcha local

1. `pnpm install`
2. `cp .env.example .env`
3. `pnpm db:start` — levanta Supabase en Docker. La primera vez descarga las imágenes y tarda.
   Studio queda en http://127.0.0.1:54323 y PostgreSQL en `127.0.0.1:54322`.
4. `pnpm dev`
5. Verificá http://localhost:5173/health (responde 200 si la app llega a la base).

## Scripts

| Script                  | Qué hace                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm dev`              | Servidor de desarrollo de Vite.                                                                    |
| `pnpm build`            | Genera los tipos de Wrangler y compila para Cloudflare Workers.                                    |
| `pnpm preview`          | Sirve el build con `wrangler dev` en el puerto 4173.                                               |
| `pnpm prepare`          | `svelte-kit sync` (corre solo después de `pnpm install`).                                          |
| `pnpm typecheck`        | Genera tipos, sincroniza SvelteKit y corre `svelte-check`.                                         |
| `pnpm lint`             | Prettier en modo verificación y ESLint.                                                            |
| `pnpm format`           | Formatea todo con Prettier.                                                                        |
| `pnpm test:unit`        | Tests unitarios con Vitest (`tests/unit`).                                                         |
| `pnpm test:db`          | Tests pgTAP de `supabase/tests` contra la base local.                                              |
| `pnpm test:integration` | Tests de integración con Vitest contra la base local (`tests/integration`).                        |
| `pnpm test`             | Unitarios + pgTAP + integración. Necesita la base local levantada (`pnpm db:start`).               |
| `pnpm test:e2e`         | Tests end-to-end con Playwright. La primera vez: `pnpm exec playwright install`.                   |
| `pnpm db:start`         | Levanta Supabase local (Docker).                                                                   |
| `pnpm db:stop`          | Detiene Supabase local.                                                                            |
| `pnpm db:reset`         | Recrea la base local y aplica todas las migraciones.                                               |
| `pnpm db:pull`          | Regenera `src/lib/server/db/schema.ts` desde la base. Ese archivo es generado: no se edita a mano. |
| `pnpm gen`              | Genera `worker-configuration.d.ts` (tipos de Wrangler). Está en `.gitignore`.                      |

## Estructura del repositorio

```text
docs/                     ERS, stack, modelo de datos, diseño y convención de commits
odd/tasks/                seguimiento de tareas de desarrollo
scripts/                  db-pull.mjs (genera schema.ts)
src/
  env.ts                  variables de entorno declaradas y validadas con Zod
  hooks.server.ts
  lib/server/db/          client.ts, tx.ts (withActor), schema.ts (generado)
  routes/health/          endpoint /health
supabase/
  migrations/             migraciones SQL: única fuente de verdad del esquema
  tests/                  tests pgTAP
tests/
  unit/                   Vitest
  integration/            Vitest contra la base local
  e2e/                    Playwright
```

## Flujo de trabajo de base de datos

1. `pnpm exec supabase migration new <nombre>` — crea la migración en `supabase/migrations/`.
2. Escribí su test pgTAP en `supabase/tests/` (cada migración trae su prueba, en el mismo commit).
3. `pnpm db:reset` — aplica las migraciones sobre una base limpia.
4. `pnpm test:db` — corre los tests pgTAP.
5. `pnpm db:pull` — regenera `src/lib/server/db/schema.ts`.

Toda escritura pasa por `withActor` (`src/lib/server/db/tx.ts`): los triggers rechazan escrituras sin usuario.

## Qué tenés que configurar

Nada de esto está hecho todavía:

- [ ] **Identidad de git.** Confirmá la que se usa para commitear; hoy está configurada en el repo como
      `nievasys <nievasys@users.noreply.github.com>`.
- [ ] **Repositorio en GitHub.** Crealo y agregá el remoto (`git remote add origin ...`). Hacer push es decisión tuya.
- [ ] **Supabase.** Dos proyectos (staging y producción) en la región São Paulo (`sa-east-1`):
  - activá las claves asimétricas de firma de JWT;
  - desactivá la Data API si es posible;
  - anotá la cadena de conexión del pooler en modo transacción (puerto 6543) para `DATABASE_URL`;
  - más adelante, cuando se implemente la autenticación: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
    y `SUPABASE_SECRET_KEY`. **El código todavía no lee estas tres variables.**
- [ ] **Cloudflare.** Cuenta, `pnpm exec wrangler login` y el secreto de la base con
      `pnpm exec wrangler secret put DATABASE_URL`. Hyperdrive es opcional. Para producción se recomienda el plan pago
      de Workers.
- [ ] **Monitoreo.** UptimeRobot (o similar) consultando `/health` una vez desplegado.
- [ ] **Backups.** Bucket de R2 para los backups nocturnos (fase 1e).
- [ ] **Decisión de negocio pendiente de Matrifer:** horarios de los turnos (ERS 3.8, punto 19).

## Estado

El bootstrap del repositorio está hecho (scaffold, base local con la migración inicial, `withActor`, `/health`, tests).
El spike técnico de la fase 0 ([`docs/stack.md`](docs/stack.md) §19) todavía no empezó. El estado de implementación de
cada requisito se registra en el Anexo A de [`docs/ERS.md`](docs/ERS.md).
