# CLAUDE.md — Matrifer ERP

ERP a medida para **Matrifer Moldes** (planta en Moreno, Buenos Aires). Dos tipos de usuario reales: **Administración** (carga precios, gastos y cierra períodos; ve el dashboard) y **Operarios** (cargan partes de producción desde una tablet o PC de planta). El sistema **no crece más allá del ERS**. Si algo no está en los documentos, no lo inventes: preguntá.

## Documentos (leer en este orden)

1. `docs/ERS.md` — **especificación de requisitos v1.1: fuente de verdad del negocio.** Ya incluye las correcciones y las decisiones de Matrifer. La sección 3.8 lista, punto por punto, qué está decidido, qué es un valor por defecto a validar y qué sigue pendiente; el historial de versiones del comienzo resume los cambios.
2. `docs/stack.md` — stack, arquitectura y decisiones técnicas (v1.2).
3. `docs/data-model.md` — esquema SQL, triggers y vistas.
4. `docs/DESIGN.md` — lenguaje visual y componentes.

## Reglas que no se negocian

**Arquitectura**
- SvelteKit 3 + Svelte 5 (runes) + TypeScript. Crear el proyecto con `npx sv create`. Alias `#lib`, `$app/state`, configuración en `vite.config.ts`.
- Server-first: SSR, `load` del servidor y Form Actions. Los formularios deben funcionar sin JavaScript y mejorarse con `use:enhance`.
- **Sin librerías de componentes.** Componentes propios con HTML nativo (`<dialog>`, `popover`, `<select>`, `<input type="date">`), guiados por `docs/DESIGN.md`.
- Gráficos con SVG propio renderizado en servidor. Sin Lenis. GSAP solo si hace falta y limitado a una ruta.
- Todo lo que toca la base de datos o secretos va en `src/lib/server/`.

**Datos**
- Todo vive en el schema `app` de PostgreSQL. La fuente de verdad son las migraciones SQL de Supabase CLI. `lib/server/db/schema.ts` se genera con `drizzle-kit pull`; **no se edita a mano**.
- **Toda escritura pasa por `withActor(userId, role, fn)`.** Los triggers rechazan escrituras sin usuario.
- Nunca `DELETE` sobre datos de negocio: se anula (`status = 'voided'`) con motivo.
- Dinero: `numeric(18,4)`, ARS. Cálculos en SQL; en TypeScript usar `big.js`, solo en servidor. **Nunca `float` ni `number` para importes.** Mostrar con `Intl.NumberFormat('es-AR')`.
- La facturación se calcula en la vista por **fecha del parte**; no se guarda importe por fila. La fórmula de ganancia neta existe **solo** en `v_net_profit_monthly`.
- Un período cerrado es inmutable. Las cifras de un cierre salen de `period_closures`.
- Fechas de negocio como `date` en horario de Argentina (`America/Argentina/Buenos_Aires`). No usar `new Date()` del Worker para "hoy" sin zona horaria.

**Seguridad**
- Verificar la sesión con `getClaims()`, no con `getUser()` en cada request. Después, leer `role` y `active` de `profiles`.
- `requireRole(...)` al inicio de **cada** `load`, action y endpoint. Un guard en el layout no alcanza.
- La matriz de permisos vive en `lib/server/guards/permissions.ts` y se prueba con tests sobre las actions.
- RLS deny-all en todas las tablas; vistas con `security_invoker = true`; nada en el schema `public`.
- Ningún secreto con prefijo `PUBLIC_`.

**Calidad**
- Zod en el servidor siempre.
- Tests: Vitest (cálculos, permisos), pgTAP (triggers, vistas, períodos), Playwright (flujos del operario y del administrador).
- Cada migración trae su prueba pgTAP.
- Antes de dar algo por terminado: `lint`, `typecheck`, tests y `build` en verde.

## Idioma y nombres

- Interfaz y mensajes al usuario en **español rioplatense (es-AR)**. Código, nombres de tablas, columnas y variables en **inglés**.
- Dominio: *parte* = `production_report`; *línea* = `production_line`; *molde* = `mold`; *parada* = `downtime`; *período* = `period`.

## Cómo trabajar

1. **Fase 0:** spike técnico (`docs/stack.md` §19). No construir el MVP hasta que pase.
2. Seguir las fases de `docs/stack.md` §20: 1a esquema y auth → 1b formulario del operario → 1c administración → 1d facturación y dashboard → 1e cierre, exportación, backups.
3. Roles `MANAGEMENT` y `SUPPORT`: existen en el enum y en la matriz, pero **no tienen interfaz hasta la fase 2**.
4. Trabajar por cortes verticales pequeños (esquema → servicio → action → pantalla → tests) y mostrar cada uno antes de seguir.
5. Si el ERS, los demás documentos y el código se contradicen, **parar y preguntar**. No resolverlo en silencio.
6. Decisiones de Matrifer ya tomadas: el **precio es por molde**, **no existe maquinaria compartida** (no hay distinción propia/compartida ni reparto) y **la cantidad 0 no se permite** (cada línea ≥ 1). Los horarios de los turnos siguen pendientes (ERS 3.8, punto 19): se cargan desde el catálogo, no se escriben en el código. Las demás decisiones provisorias (ERS 3.8, puntos 1 a 13, 17, 18, 20 y 21) están aisladas en constantes para poder cambiarlas barato. Mantenelas así.
7. Rendimiento: cada página hace pocas consultas, con `Promise.all`. Medir el CPU por request en Cloudflare. El formulario del operario debe poder completarse en ≤ 60 s.

## Lo que no hay que hacer

- No agregar módulos fuera del ERS (stock, ventas, RRHH, punto de venta, kanban).
- No copiar nombre, logo, textos, imágenes ni código de la demo usada como referencia visual.
- No generar `.xlsx` en el Worker. CSV en el servidor; `.xlsx` en el navegador con SheetJS.
- No crear un segundo sistema de migraciones.
- No dejar funcionalidades "a medias" detrás de botones visibles.
- No cambiar sin avisar un valor por defecto de la sección 3.8 del ERS.

## Estructura del repositorio

```text
CLAUDE.md
docs/ { ERS.md  stack.md  data-model.md  DESIGN.md  business-rules.md }
src/ { routes/  lib/ { components/ charts/ validations/ format/ server/ }  hooks.server.ts }
supabase/ { migrations/  tests/  config.toml }
tests/ { unit/  e2e/ }
```

`docs/business-rules.md` se crea durante el desarrollo: una página con la fórmula de ganancia neta, la regla de precios y la de cierre, escritas en lenguaje de negocio.
