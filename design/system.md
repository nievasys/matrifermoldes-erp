# Matrifer ERP — Design system (synced)

Synced from the project sources. **Every value below comes from a source file; nothing is invented.**
Where the sources are silent, the gap is listed under "Not defined in the sources" instead of filled.

| Source | Role |
|---|---|
| `src/routes/layout.css` (`@theme`, Tailwind v4) | **Single source of every token value.** Wins over any example in the docs. |
| `docs/DESIGN.md` §2–§4, §6 | Usage, typography scale, shape, motion and component rules. |
| `CLAUDE.md` | Constraints: UI copy in Spanish (es-AR), no component libraries, native HTML controls. |

Companion artboard: `design/system.html` (1440 px, renders the tokens and core components).

---

## ⚠ Contrast rule for the brand cyan (read first)

`--color-accent` (`#01c1f2`, cyan) reaches only about **2:1** on light surfaces.

- **Allowed:** as a **fill with `--color-ink` text on top**, or **on `--color-ink` backgrounds** (about 9:1), where it may carry text and lines.
- **Not allowed:** cyan text, links, icons or thin chart lines on any light surface (`--color-bg`, `--color-surface`, `--color-raised`, `--color-solid`, `--color-accent-tint`).
- **Use instead:** `--color-accent-strong` (`#2563eb`, about 4.8:1) for text, links and thin chart lines on light.

Source: `src/routes/layout.css` (Brand comment), `docs/DESIGN.md §2.1`.

Related rules (`docs/DESIGN.md §2.1`): all text meets **WCAG AA 4.5:1**; a state is never communicated by color alone — always with text or an icon. `--color-muted` is for labels on light surfaces only (never on ink).

---

## Colors

All values: `src/routes/layout.css`. Usage: `docs/DESIGN.md §2.1` unless noted.

### Surfaces (4)

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#efefec` | Page background |
| `--color-surface` | `#f8f8f6` | Cards and panels |
| `--color-raised` | `#fcfcfb` | Raised surfaces (active tab) |
| `--color-solid` | `#ffffff` | Items inside cards, modals, fields |

### Text and emphasis (7)

| Token | Value | Usage |
|---|---|---|
| `--color-ink` | `#020611` | Main text, primary button, main KPI card, toast (brand ink) |
| `--color-on-ink` | `#f7f7f5` | Text on ink |
| `--color-ink-soft` | `#3b4a5e` | Secondary text |
| `--color-muted` | `#5c5c5a` | Labels and hints (AA on background and cards) |
| `--color-line` | `rgb(2 6 17 / 0.09)` | Thin separators |
| `--color-line-strong` | `rgb(2 6 17 / 0.16)` | Control borders |
| `--color-well` | `rgb(2 6 17 / 0.06)` | Bar tracks, sunken backgrounds |

### Brand (4)

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#01c1f2` | Brand cyan. **Fill with ink text on top, or on ink backgrounds only** (see rule above) |
| `--color-accent-tint` | `#e6f7fd` | Secondary highlighted KPI card (`tint`) |
| `--color-accent-strong` | `#2563eb` | Links, accent text and thin chart lines on light; focus outline (`layout.css` base layer) |
| `--color-indigo` | `#4426bc` | Second data series |

### Status (3) — always paired with text or icon

| Token | Value | Usage |
|---|---|---|
| `--color-positive` | `#237a48` | Income, positive variations |
| `--color-warning` | `#8f6000` | "A revisar", "pendiente" |
| `--color-danger` | `#bf3644` | Counters, alerts, voided (anulado) |

### Extra chart series (3)

| Token | Value | Usage |
|---|---|---|
| `--color-coral` | `#c9542b` | Expenses in charts |
| `--color-slate` | `#637083` | Additional series |
| `--color-earth` | `#8f6243` | Additional series |

`docs/DESIGN.md §1`: blue is the only data color; red, green and gold are for states. Ink is the emphasis color.

---

## Typography

| Token | Value (`src/routes/layout.css`) | Usage (`docs/DESIGN.md §2.2`) |
|---|---|---|
| `--font-display` | `'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif` | Headings and large numbers |
| `--font-sans` | `'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif` | Body |

Self-hosted by the app via `@fontsource-variable/space-grotesk` and `@fontsource-variable/plus-jakarta-sans` (`src/routes/layout.css` imports). Artboards may not load fonts, so they declare the stacks with the static family name added as a fallback (`"Space Grotesk Variable","Space Grotesk",…` / `"Plus Jakarta Sans Variable","Plus Jakarta Sans",…`) and no `@font-face`.

Base (`src/routes/layout.css`, `@layer base`): `html` font-size `14px`, `--font-sans`, color `--color-ink`, background `--color-bg`, antialiased. `h1–h3`: `--font-display`, weight `500`, letter-spacing `-0.025em`.

Scale (`docs/DESIGN.md §2.2`):

| Role | Size | Notes |
|---|---|---|
| Page title | ≈ 40 px | Display, weight 500, slightly negative tracking |
| KPI number | ≈ 28–32 px | Display, weight 500, `font-variant-numeric: tabular-nums` |
| Body | 13–14 px | Sans |
| Labels, table headers | 11–12 px | Table headers uppercase with letter-spacing |

Formats (`docs/DESIGN.md §2.2`): money `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })` (e.g. `$ 1.913,25`), dates `dd/mm/aaaa`.

---

## Spacing and layout

No spacing tokens exist in `src/routes/layout.css`. Guidance from `docs/DESIGN.md §2.3`:

- Gap between cards ≈ 16–20 px; inner padding ≈ 20–24 px.
- Content max width ≈ 1200 px.

---

## Radius (3)

| Token | Value (`src/routes/layout.css`) | Usage (`docs/DESIGN.md §2.3`) |
|---|---|---|
| `--radius-card` | `1.5rem` (24 px) | Cards, modals |
| `--radius-tile` | `1rem` (16 px) | Inner cards / tiles |
| `--radius-ctl` | `999px` | Pill: buttons, chips, fields, nav bar |

## Shadows (2)

| Token | Value (`src/routes/layout.css`) | Usage |
|---|---|---|
| `--shadow-card` | `0 1px 0 rgb(255 255 255 / 0.7) inset, 0 24px 48px -30px rgb(0 0 0 / 0.22)` | Cards, raised tab |
| `--shadow-pop` | `0 24px 60px -18px rgb(0 0 0 / 0.28), 0 2px 6px rgb(0 0 0 / 0.07)` | Popovers, modals, toast |

`docs/DESIGN.md §2.3`: shadows almost imperceptible, no dark borders. (Its example shadow value differs from `layout.css`; `layout.css` is authoritative.)

## Motion (1)

| Token | Value (`src/routes/layout.css`) |
|---|---|
| `--ease-soft` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |

Rules (`docs/DESIGN.md §2.4`): transitions 150–250 ms with the soft curve; page change with slight blur + fade (View Transitions); count-up numbers, drawing lines and growing bars **only on the Administración dashboard**; toasts enter from below; `prefers-reduced-motion` disables everything; the operator view uses no animation and no `backdrop-filter`.

## Focus

`src/routes/layout.css` (`@layer base`): `a, button, input, select, textarea, summary` on `:focus-visible` → `outline: 2px solid var(--color-accent-strong); outline-offset: 2px`.

---

## Screen structure (`docs/DESIGN.md §3`)

- **Top bar:** logo + name left; module items centered in a **white pill** (active = ink pill with on-ink text; pending counters = red circles); bell and avatar right.
- Small breadcrumbs, then a large page title.
- **Sub-tabs** as a pill group (active = white with soft shadow); actions on the right: secondary (outlined) and primary (ink).
- Optional dark floating rail on the left (can be omitted in the MVP).
- Status indicator top right: current shift and reports loaded today.
- Responsive: on tablets the top bar collapses to a menu; columns go 4 → 2 → 1.

## Component rules (`docs/DESIGN.md §4`)

Own components only, native HTML (`CLAUDE.md`): `<dialog>`, `popover`, `<select>`, `<input type="date">`.

| Component | Rule |
|---|---|
| `AppShell` | Top bar, breadcrumbs, title, content; modules by role |
| `NavPill` | Pill with items and counters; real links; active by route = ink pill, on-ink text; counters = `--color-danger` circle |
| `PageHeader` | Title, sub-tabs, actions |
| `SegmentedTabs` | Pill group; active = raised/white with soft shadow; changes by URL (`?vista=`), not state |
| `Button` | Variants: primary (ink), secondary (outlined), ghost, danger. Sizes sm/md/lg. Optional icon. Pill (`--radius-ctl`) |
| `Card` | Surface with title, icon, optional action; `--radius-card` |
| `KpiCard` | Label with icon, large value, variation text, sparkline. Variants `dark` (ink), `tint` (`--color-accent-tint`), `plain`. The first one is `dark` |
| `Sparkline` | Thin SVG line, server-rendered. Cyan only on `dark`; `--color-accent-strong` on light |
| `AreaChart` / `LineChart` | Smooth line with gradient area, dotted comparison series, labeled axis; own SVG |
| `BarList` | List with horizontal bar and value (by machine, mold or category) |
| `StackedBar` | Segmented bar with legend |
| `DataTable` | Uppercase header, rows with avatar and subtext, numeric columns right-aligned, clickable row; sort/filter/paging by URL |
| `FilterChips` | Chips with counter ("Todos 10", "Abiertos 4") |
| `SearchInput` | Pill field with icon |
| `StatusBadge` | Color dot + text; **text always visible** |
| `Avatar` | Initials on pastel background |
| `Modal` | `<dialog>`, blurred backdrop, title, subtitle, fields, actions; Esc closes; focus trapped |
| `Drawer` | Side detail panel |
| `Field`, `Input`, `Select`, `DateInput`, `NumberInput` | Pill fields, **label above**; native HTML; numeric `inputmode` |
| `Toast` | Ink pill centered at the bottom with icon, message and "Deshacer"; 5 s |
| `EmptyState` | Message + action when there is no data (mandatory) |
| `Skeleton` | Loading placeholders |
| `StatusDot` | "Shift / status" indicator in the bar |

### Operator view (`docs/DESIGN.md §6`)

Same palette, type and radii; different density: one column, large fields, wide ink primary button at the bottom, no module bar (only "Cargar parte", "Mis partes", "Cambiar operario"). Target: valid report in ≤ 60 s. Shift, machine and mold with large controls, last-used first; quantity with numeric keypad; downtimes as selectable chips + minutes field; add another line in place; clear confirmation + "Cargar otro". No heavy animation, no blur.

---

## Not defined in the sources (do not invent; ask before using)

- **Spacing scale / duration tokens:** only ranges in `docs/DESIGN.md §2.3–§2.4`. The artboard uses 16/20/24 px and 200 ms inside those ranges.
- **Avatar pastel tones:** described in `docs/DESIGN.md §2.1` but no tokens exist; avatars are not rendered in the artboard.
- **Status → token mapping for "Activo" and "Cerrado":** the docs map warning → "A revisar" and danger → "anulado". The artboard uses `--color-positive` for "Activo" and `--color-ink-soft` for "Cerrado"; both are artboard choices to confirm.
- **Shift names:** shift definitions are pending (ERS 3.8 point 19); "Mañana/Tarde/Noche" in the artboard are sample content only.

## Token counts

| Group | Count |
|---|---|
| Fonts | 2 |
| Colors — surfaces | 4 |
| Colors — text and emphasis | 7 |
| Colors — brand | 4 |
| Colors — status | 3 |
| Colors — chart series | 3 |
| Radius | 3 |
| Shadows | 2 |
| Motion | 1 |
| **Total** | **29** |
