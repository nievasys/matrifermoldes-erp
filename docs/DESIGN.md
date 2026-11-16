# Matrifer ERP — Guía de diseño (DESIGN.md)

**Fecha:** 15/11/2026
**Fuente de la referencia:** video de la demo "Cadra" (ERP de una fábrica de bicicletas, 42 s, 720p). Esta guía describe el **lenguaje visual** (colores, formas, ritmo, componentes) para recrearlo con componentes propios. **No se copia** nada de la demo: ni el nombre, ni el logo ni el ícono de bicicleta, ni los textos, ni imágenes, ni código. Todo el contenido es de Matrifer.

**Los valores de color y tamaño son aproximados**: se midieron sobre fotogramas de video comprimido. El agente debe afinarlos comparando contra el video y dejarlos definidos **una sola vez** como tokens CSS en `app.css` (`@theme` de Tailwind v4).

---

## 1. Carácter general

Luminoso, calmo y muy redondeado. Fondo casi blanco con un leve tono verde grisáceo, tarjetas suaves sin bordes marcados, una sola barra de navegación en píldora arriba, y **negro puro como color de énfasis** (botones primarios, tarjeta KPI principal, avisos). El azul es el único color de datos; rojo, verde y dorado son para estados.

Qué lo hace ver bien: poco color, mucho espacio, jerarquía por tamaño de número, radios grandes, sombras casi invisibles y movimiento breve.

---

## 2. Tokens

### 2.1 Colores (aproximados)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#eef1ea` | Fondo de página |
| `--surface` | `#f7f8f4` | Tarjetas y paneles |
| `--surface-solid` | `#ffffff` | Ítems dentro de tarjetas, modales, campos |
| `--ink` | `#0e100f` | Texto principal, botón primario, tarjeta KPI principal, aviso |
| `--ink-soft` | `#4a4f4b` | Texto secundario |
| `--muted` | `#6b706c` | Etiquetas y ayudas |
| `--line` | `#e2e6dd` | Separadores finos |
| `--accent` | `#2964a8` | Datos, líneas, barras de progreso, enlaces activos |
| `--accent-tint` | `#bbd3ed` | Tarjeta KPI destacada secundaria |
| `--danger` | `#c0432f` | Contadores de la barra, alertas, "requiere atención" |
| `--danger-soft` | `#cc6157` | Egresos en gráficos |
| `--positive` | `#328654` | Ingresos, variaciones positivas, estado "pagado" |
| `--warning` | `#9f740e` | "Parcial", "pendiente" |
| `--slate` | `#676c7f` | Serie neutra |
| `--earth` | `#8b5c42` | Serie adicional |

**Accesibilidad (RNF 3.5.14):** en la demo muchas etiquetas grises tienen bajo contraste. En Matrifer, todo texto debe cumplir contraste **AA (4,5:1)**; oscurecer `--muted` si hace falta. Nunca comunicar un estado solo con color: acompañar con texto o ícono.

Avatares: círculos con iniciales en tonos pastel (verde, rosa, amarillo, azul, durazno) con la letra en un tono más oscuro de la misma familia.

### 2.2 Tipografía
- Sans geométrica redondeada. **No se pudo identificar la fuente de la demo.** Probar **Outfit** y **Urbanist** (gratuitas) y quedarse con la más parecida. Autoalojar con `@fontsource`.
- Títulos de página ≈ 40 px, peso 500, interletrado levemente negativo.
- Números grandes de KPI ≈ 28–32 px, peso 500, con `font-variant-numeric: tabular-nums`.
- Cuerpo 13–14 px. Etiquetas y encabezados de tabla 11–12 px, mayúsculas con espaciado en encabezados de tabla.
- Formatos es-AR: `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`, fechas `dd/mm/aaaa`.

### 2.3 Forma y espacio
- Radio: tarjetas ≈ 24 px; modales ≈ 24 px; tarjetas internas ≈ 16 px; botones, chips, campos y barra de navegación en **píldora** (999 px).
- Sombras: casi imperceptibles, por ejemplo `0 1px 2px rgb(0 0 0 / .04), 0 8px 24px rgb(0 0 0 / .05)`. Sin bordes oscuros.
- Separación entre tarjetas ≈ 16–20 px; relleno interno ≈ 20–24 px.
- Contenido con ancho máximo cercano a 1200 px.

### 2.4 Movimiento
- Transiciones de 150–250 ms con curva suave. Cambio de página con leve desenfoque y desvanecido (View Transitions).
- Números que cuentan hacia el valor (`tweened`), líneas que se dibujan, barras que crecen: solo en el dashboard de Administración.
- Avisos que entran desde abajo.
- `prefers-reduced-motion` desactiva todo. La vista del Operario no usa animaciones ni `backdrop-filter`.

---

## 3. Estructura de pantalla

```text
┌──────────────────────────────────────────────────────────────┐
│ [logo]        ( Dashboard  Producción  Gastos … )   🔔  (NH) │  barra superior en píldora
│ Inicio › Sección › Página                      ● turno / estado │
│ Título de página        [ sub-pestañas ]        [acción]       │
│                                                                │
│ ▏rail   ┌─ KPI ─┐┌─ KPI ─┐┌─ KPI ─┐┌─ KPI ─┐                  │
│ ▏flot.  └───────┘└───────┘└───────┘└───────┘                  │
│ ▏       ┌──── tarjeta grande ───────┐┌─ lateral ─┐             │
│         └───────────────────────────┘└───────────┘             │
└──────────────────────────────────────────────────────────────┘
```

- **Barra superior:** logo y nombre a la izquierda; ítems de módulo centrados en una **píldora blanca** (activo = píldora negra con texto blanco; los contadores de pendientes son círculos rojos); campana y avatar a la derecha.
- **Migas de pan** pequeñas y título de página grande debajo.
- **Sub-pestañas** como grupo de píldoras (activa en blanco con sombra suave) a la izquierda del título o debajo, y a la derecha las acciones: botón secundario (borde) y primario (negro).
- **Rail flotante** oscuro y vertical, fijo al borde izquierdo, con 5 íconos (buscar, crear, tema, ayuda, ajustes). Se puede omitir en el MVP; la búsqueda y "crear" son lo más útil.
- **Indicador de estado** arriba a la derecha (hora, punto verde y una línea de resumen con mini barra). En Matrifer: turno actual y partes cargados hoy.

Responsive: en tablets, la barra superior colapsa a un menú; las columnas pasan de 4 a 2 y a 1.

---

## 4. Inventario de componentes (propios)

| Componente | Descripción | Notas de implementación |
|---|---|---|
| `AppShell` | Barra superior, migas, título, área de contenido | Layout `(app)`; módulos según rol |
| `NavPill` | Píldora con ítems y contadores | Enlaces reales; activo por ruta |
| `PageHeader` | Título, sub-pestañas, acciones | |
| `SegmentedTabs` | Grupo de píldoras | Cambia por URL (`?vista=`), no por estado |
| `Button` | Variantes: primario (negro), secundario (borde), fantasma, peligro. Tamaños sm/md/lg. Ícono opcional | Píldora |
| `Card` | Superficie con título, ícono y acción opcional | Radio 24 |
| `KpiCard` | Etiqueta con ícono, valor grande, texto de variación, minigráfico. Variantes: `dark`, `tint`, `plain` | La primera en `dark` |
| `Sparkline` | Línea fina SVG | Server-side |
| `AreaChart` / `LineChart` | Línea suave con área en degradé, serie punteada para comparar, eje con etiquetas | SVG propio |
| `BarList` | Lista con barra horizontal y valor (por máquina, molde o categoría) | |
| `StackedBar` | Barra segmentada con leyenda (antigüedad, gastos por categoría) | |
| `DataTable` | Encabezado en mayúsculas, filas con avatar y subtexto, columnas numéricas alineadas a la derecha, fila clicable | Orden, filtros y paginación por URL |
| `FilterChips` | Chips con contador ("Todos 10", "Abiertos 4") | |
| `SearchInput` | Campo en píldora con ícono | |
| `StatusBadge` | Punto de color + texto (Borrador, Enviado, Pagado, Parcial, Anulado) | Texto siempre visible |
| `Avatar` | Iniciales sobre fondo pastel | |
| `Modal` | `<dialog>` con fondo desenfocado, título, subtítulo, campos, acciones | Cierre con Esc; foco atrapado |
| `Drawer` | Panel lateral de detalle (por ejemplo, detalle de un gasto) | |
| `Field`, `Input`, `Select`, `DateInput`, `NumberInput` | Campos en píldora, etiqueta arriba | HTML nativo; `inputmode` numérico |
| `Toast` | Píldora negra centrada abajo con ícono, mensaje y "Deshacer" | 5 s; store compartido |
| `EmptyState` | Mensaje y acción cuando no hay datos | Obligatorio (CU: "no existen registros") |
| `Skeleton` | Marcadores de carga | |
| `StatusDot` | Indicador "turno / estado" de la barra | |

---

## 5. Pantallas de Matrifer a partir de la referencia

| Pantalla Matrifer | Se inspira en | Contenido |
|---|---|---|
| **Dashboard** (Administración) | Dashboard | Saludo y resumen del día; línea de tiempo del turno con los partes cargados; KPIs: facturación del mes (`dark`), piezas producidas (`tint`), gastos del mes, ganancia neta; gráfico "facturación y gastos del año"; lista "producción por máquina o molde" |
| **Producción** | Facturas | KPIs del período, tabla de partes con chips por estado ("A revisar"), detalle en `Drawer` |
| **Gastos** y **Facturación externa** | Facturas / Aging | KPIs, `StackedBar` por categoría, tabla, modal "Registrar gasto" |
| **Precios** | Tabla + modal | Vigencias por molde, historial |
| **Período / Cierre** | Reporte | Resumen a consolidar, botón "Cerrar período", confirmación en `Modal` |
| **Reportes** (opcional, fase posterior) | Report builder | Métrica, agrupación y tipo de gráfico a elección |
| **Formulario del Operario** | *(sin referencia)* | Ver 6 |
| **Auditoría** | Tabla | Filtros por usuario, entidad y fecha |

No se necesitan: kanban de pedidos, punto de venta, planificación tipo Gantt, mapa de rutas ni calendario de ausencias.

---

## 6. Vista del Operario (sin referencia en la demo)

Misma paleta, tipografía y radios, pero con otra densidad: una columna, campos grandes, botón primario negro ancho al pie, sin barra de módulos (solo "Cargar parte", "Mis partes" y "Cambiar operario"). Objetivo: parte válido en **≤ 60 s** (RNF 3.5.4).

- Selección de turno, máquina y molde con controles grandes y las últimas opciones usadas al principio.
- Cantidad con teclado numérico.
- Paradas como chips seleccionables más un campo de minutos.
- Posibilidad de agregar otra línea (otro molde o máquina) sin salir de la pantalla.
- Confirmación clara tras guardar y botón "Cargar otro".
- Sin animaciones pesadas ni desenfoques.

---

## 7. Orden de trabajo sugerido para la UI

1. Tokens y fuentes en `app.css`.
2. `Button`, `Card`, `Field`, `Input`, `StatusBadge`, `Avatar`.
3. `AppShell`, `NavPill`, `PageHeader`, `SegmentedTabs`.
4. `DataTable`, `FilterChips`, `Modal`, `Drawer`, `Toast`, `EmptyState`.
5. `KpiCard`, `Sparkline`, `AreaChart`, `BarList`, `StackedBar`.
6. Formulario del Operario.
7. Animaciones y transiciones entre páginas, al final.

Una página de pruebas interna (`/_ui`) que muestre todos los componentes y variantes ayuda a revisarlos y a afinar los tokens contra el video.
