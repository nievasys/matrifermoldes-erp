# Brief — Admin dashboard (Matrifer ERP)

Shared brief for every artboard in this folder. Artboards are design mockups, not production code.

## Product context
Custom ERP for Matrifer Moldes, a plastics-injection plant in Moreno, Buenos Aires. Operators load
production reports ("partes": date, shift, and one or more lines of machine + mold + quantity).
Administration loads mold prices and expenses, closes monthly periods and reads this dashboard.
Billing = quantity × the mold price valid on the report date. Net profit = billing − deductible expenses.
Audience of this screen: the Administrator, on a desktop, 1440 × 900.

## Hard rules
- Follow `/home/nad/.local/share/gentle-shell/install/prefix/lib/node_modules/gentle-pi/skills/design/SKILL.md`
  ("Hard Rules" and the Self-check of "Design system sync").
- Read `design/system.md` first and open `design/system.html` to reuse its component CSS. Use ONLY its tokens:
  copy the `:root` block of `design/system.html` verbatim and reference colors/fonts through `var(--…)`.
- One self-contained HTML file: inline CSS and inline SVG, no external URLs, no `@import`, no `@font-face`,
  no `<link>`, no remote scripts. Font stacks exactly as in `design/system.html`.
- Cyan `--color-accent` is never text or a thin line on a light surface. On light use `--color-accent-strong`.
  On `--color-ink` backgrounds cyan may be text or lines. Never `--color-muted` on ink.
- WCAG AA contrast, semantic landmarks (`header`, `nav`, `main`, `section` with headings), visible focus,
  `prefers-reduced-motion` respected. Status is never color alone: always text or an icon with it.
- UI copy in Spanish (es-AR, voseo). Money as `$ 18.426.375,00` (es-AR, 2 decimals), dates `dd/mm/aaaa`,
  thousands with a dot. Numbers use `font-variant-numeric: tabular-nums`.
- Charts are hand-written inline SVG. No chart libraries, no JS required to read the screen.
- Do NOT read anything under `design/reference/`. Do not use the words Cadra or Larkspur, bicycles,
  or any content from any demo. Do not invent modules outside the list below (no stock, sales, HR, POS, kanban).
- Do not commit. Do not edit any file other than your own artboard.

## Navigation (top bar, pill shaped)
Brand at left: a simple text wordmark "Matrifer ERP" (no logo image). Centered pill with:
Dashboard (active) · Producción (badge 6) · Gastos · Precios · Facturación · Períodos · Catálogos.
Right: a bell button and an avatar with initials "MA" (use `--color-accent-tint` background with ink text).

## Data — use exactly these figures so the three artboards agree
- Today: lunes 16/11/2026, 10:42. Current shift: Mañana (06:00–14:00, sample hours, still to be defined).
- Selected period: Noviembre 2026 — **Abierto**. Octubre 2026 — Cerrado. Last refresh: "actualizado hace 1 min".
- Facturación del mes: $ 18.426.375,00 (+8,4 % frente a octubre). Of which production $ 17.576.375,00 and
  external billing $ 850.000,00.
- Piezas producidas: 28.893 (+3,1 %). Partes cargados en el mes: 128. Hoy: 7 partes, 2.140 piezas.
- Gastos del mes (deducibles): $ 6.204.110,50 (+12,6 %).
- Ganancia neta: $ 12.222.264,50 (margin 66,3 %).
- Alerts: **3 líneas de producción sin precio vigente** (blocks closing the period; billing total is incomplete)
  and **6 partes a revisar** (loaded outside their shift hours).
- Billing by machine: Inyectora 3 $ 6.276.340,00 (9.840 pzs) · Inyectora 1 $ 4.893.770,00 (7.675) ·
  Inyectora 2 $ 3.951.960,00 (6.198) · Inyectora 4 $ 2.454.305,00 (5.180).
- Billing by mold: Respaldos grandes verde $ 6.275.460,00 (9.840 pzs, $ 637,75 c/u) · Tapa balde 20 L $ 4.605.000,00
  (7.675) · Cajón frutero $ 3.718.800,00 (6.198) · Maceta N.º 30 $ 2.977.115,00 (5.180).
- Expenses by category: Sueldos $ 3.150.000,00 · Insumos $ 1.420.500,00 · Electricidad $ 780.300,50 ·
  Alquiler $ 520.000,00 · Impuestos (ARCA) $ 233.310,00 · Seguros $ 100.000,00.
- Year series, billing in millions ARS (ene→nov): 11,2 · 10,4 · 12,9 · 13,6 · 14,8 · 13,1 · 15,7 · 16,2 · 15,4 · 17,0 · 18,4.
  Expenses: 4,9 · 4,7 · 5,1 · 5,3 · 5,6 · 5,4 · 5,8 · 5,9 · 5,7 · 5,5 · 6,2. December has no data yet.
- Today's reports (hora de carga · operario · máquina · molde · cantidad): 06:58 R. Gómez Inyectora 3 Respaldos grandes
  verde 420 · 07:40 M. Fernández Inyectora 1 Tapa balde 20 L 310 · 08:15 L. Acosta Inyectora 2 Cajón frutero 280 ·
  08:52 R. Gómez Inyectora 3 Respaldos grandes verde 390 · 09:30 M. Fernández Inyectora 1 Tapa balde 20 L 300 ·
  10:05 L. Acosta Inyectora 4 Maceta N.º 30 260 · 10:31 R. Gómez Inyectora 3 Respaldos grandes verde 180.

## Requirements every direction must satisfy
1. Period selector (month + year) and the period state badge (Abierto / Cerrado) are visible.
2. The four KPIs are present; each one is a link to its detail ("Ver detalle" target), per traceability.
3. The "3 líneas sin precio" warning is impossible to miss and offers the action "Cargar precios".
4. Billing broken down by machine AND by mold is reachable (both visible, or a SegmentedTabs toggle
   rendered with one tab active).
5. "actualizado hace 1 min" is shown.
6. Primary actions available: "Cargar gasto" and "Cerrar período" (the latter visibly disabled or flagged
   while there are lines without price, with the reason in text).
