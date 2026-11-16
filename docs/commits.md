# Matrifer ERP — Convención de commits

Los mensajes de commit se escriben **siempre en español** y siguen
[Conventional Commits 1.0](https://www.conventionalcommits.org/es/v1.0.0/).
Aplica a todas las personas y agentes que commitean en este repositorio.

## Formato

```text
<tipo>(<alcance opcional>): <descripción>

<cuerpo opcional>

<notas al pie opcionales>
```

- **Descripción:** en español, en presente del indicativo y tercera persona ("agrega", "corrige", "elimina"),
  en minúscula, sin punto final, hasta 72 caracteres.
- **Cuerpo:** explica el *qué* y el *porqué*, no el *cómo*. Líneas de hasta 100 caracteres.
- **Tipo y alcance:** van en inglés y en minúscula porque son palabras clave de la convención.
- Los identificadores de código (tablas, funciones, archivos) se escriben tal cual, sin traducir.

## Tipos

| Tipo | Cuándo se usa |
|---|---|
| `feat` | Funcionalidad nueva visible para el usuario o el negocio |
| `fix` | Corrección de un error |
| `docs` | Solo documentación (`docs/`, `README.md`, `CLAUDE.md`) |
| `style` | Formato del código, sin cambio de comportamiento |
| `refactor` | Cambio interno que no agrega funcionalidad ni corrige errores |
| `perf` | Mejora de rendimiento |
| `test` | Se agregan o corrigen pruebas, sin tocar código productivo |
| `build` | Dependencias, empaquetado, configuración de Vite o Wrangler |
| `ci` | GitHub Actions y automatizaciones |
| `chore` | Mantenimiento que no entra en los anteriores |
| `revert` | Revierte un commit anterior |

## Alcances

El alcance es opcional y nombra el módulo afectado:

`db` (migraciones, triggers, vistas, pgTAP) · `auth` · `permisos` · `produccion` · `catalogos` · `precios` ·
`gastos` · `facturacion` · `dashboard` · `periodos` · `usuarios` · `auditoria` · `exportacion` · `ui` · `infra`

Si un commit toca varios módulos sin que uno predomine, se omite el alcance.

## Reglas

1. **Un commit, una unidad de trabajo.** El código, sus pruebas y su documentación van en el mismo commit.
2. **Cada migración viaja con su prueba pgTAP** (`supabase/tests/`) en el mismo commit.
3. **Si el commit implementa o cambia un requisito del ERS**, actualiza en ese mismo commit el anexo
   "Estado de implementación" de `docs/ERS.md` y nombra el requisito en el cuerpo (`RF 3.4.2.6`, `RN-003`, `CU-04`).
4. **Antes de commitear:** `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` en verde.
5. **Cambios incompatibles:** `!` después del tipo o alcance y una nota al pie `BREAKING CHANGE: <explicación>`.
6. **Nada de secretos** (`.env`, claves, cadenas de conexión) ni archivos generados que estén en `.gitignore`.
7. **Tamaño:** commits revisables, de hasta unas 400 líneas escritas a mano. Si es más grande, se divide.
8. **Ramas:** `main` y `feature/<nombre-en-kebab-case>`. No se commitea directo a `main`.

## Notas al pie

| Nota | Uso |
|---|---|
| `Refs: RF 3.4.2.6, RN-003` | Requisitos del ERS relacionados |
| `Closes: #12` | Issue que cierra |
| `BREAKING CHANGE: …` | Cambio incompatible |

## Ejemplos

```text
feat(produccion): agrega el formulario de carga de partes multimolde

Permite cargar un parte con una o más líneas (máquina, molde, cantidad) y
valida que cada cantidad sea un entero mayor o igual a 1.

Refs: RF 3.4.2.1, RF 3.4.2.2, RF 3.4.2.6, RN-023
```

```text
fix(db): rechaza mover un gasto hacia un período cerrado
```

```text
docs: actualiza el estado de implementación del ERS para la fase 1a
```

```text
build: actualiza drizzle-orm a 0.45.4
```

```text
feat(precios)!: cambia la vigencia de precios a rangos cerrados

BREAKING CHANGE: `valid_to` pasa a ser obligatorio en `app.prices`.
```

## Qué evitar

- Mensajes genéricos: "cambios", "arreglos varios", "wip".
- Mezclar idiomas en la descripción o el cuerpo.
- Pasado o infinitivo: ~~"agregado login"~~, ~~"agregar login"~~ → `feat(auth): agrega el inicio de sesión`.
- Commits que mezclan un refactor con una funcionalidad nueva.
