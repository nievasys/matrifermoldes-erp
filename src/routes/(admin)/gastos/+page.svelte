<script lang="ts">
	import {
		Plus,
		Pencil,
		Trash2,
		Building,
		Zap,
		Package,
		Users,
		FileText,
		Shield
	} from 'lucide-svelte';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';

	const categorias = [
		{ id: 'alquiler', nombre: 'Alquiler', icon: Building, color: 'var(--color-indigo)' },
		{ id: 'luz', nombre: 'Luz', icon: Zap, color: 'var(--color-warning)' },
		{ id: 'insumos', nombre: 'Insumos', icon: Package, color: 'var(--color-coral)' },
		{ id: 'sueldos', nombre: 'Sueldos', icon: Users, color: 'var(--color-positive)' },
		{ id: 'impuestos', nombre: 'Impuestos', icon: FileText, color: 'var(--color-danger)' },
		{ id: 'seguros', nombre: 'Seguros', icon: Shield, color: 'var(--color-slate)' }
	];

	const gastos = [
		{
			id: 1,
			fecha: '15/11/2026',
			categoria: 'sueldos',
			descripcion: 'Sueldos noviembre',
			importe: 2850000,
			comprobante: 'REC-2026-089'
		},
		{
			id: 2,
			fecha: '10/11/2026',
			categoria: 'luz',
			descripcion: 'Factura EDENOR período oct-nov',
			importe: 485620.5,
			comprobante: 'FAC-824561'
		},
		{
			id: 3,
			fecha: '05/11/2026',
			categoria: 'alquiler',
			descripcion: 'Alquiler nave noviembre',
			importe: 1200000,
			comprobante: 'REC-2026-088'
		},
		{
			id: 4,
			fecha: '03/11/2026',
			categoria: 'insumos',
			descripcion: 'Materia prima - Polietileno HD',
			importe: 892340,
			comprobante: 'FAC-A-00012456'
		},
		{
			id: 5,
			fecha: '01/11/2026',
			categoria: 'seguros',
			descripcion: 'Seguro maquinaria nov',
			importe: 156150,
			comprobante: 'POL-2026-11'
		},
		{
			id: 6,
			fecha: '01/11/2026',
			categoria: 'impuestos',
			descripcion: 'IIBB octubre',
			importe: 620000,
			comprobante: 'VEP-20261101'
		}
	];

	const totalMes = gastos.reduce((sum, g) => sum + g.importe, 0);

	function formatMoney(n: number) {
		return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
	}

	function getCat(id: string) {
		return categorias.find((c) => c.id === id)!;
	}
</script>

<header class="page-header">
	<div class="page-header-left">
		<h1 class="page-title">Gastos</h1>
		<p class="page-subtitle">Gastos deducibles de noviembre 2026</p>
	</div>
	<div class="page-header-right">
		<Button>
			<Plus size={16} />
			Cargar gasto
		</Button>
	</div>
</header>

<div class="stats-row">
	<div class="stat">
		<span class="stat-value">{formatMoney(totalMes)}</span>
		<span class="stat-label">total del mes</span>
	</div>
	<div class="stat">
		<span class="stat-value">{gastos.length}</span>
		<span class="stat-label">registros</span>
	</div>
</div>

<div class="layout-cols">
	<Card>
		<h3 class="section-title">Registros del mes</h3>
		<table class="data-table">
			<thead>
				<tr>
					<th>Fecha</th>
					<th>Categoría</th>
					<th>Descripción</th>
					<th>Comprobante</th>
					<th class="num">Importe</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each gastos as gasto (gasto.id)}
					{@const cat = getCat(gasto.categoria)}
					<tr>
						<td class="muted">{gasto.fecha}</td>
						<td>
							<span class="cat-pill" style="--cat-color: {cat.color}">
								<svelte:component this={cat.icon} size={12} />
								{cat.nombre}
							</span>
						</td>
						<td><strong>{gasto.descripcion}</strong></td>
						<td class="muted mono">{gasto.comprobante}</td>
						<td class="num"><strong>{formatMoney(gasto.importe)}</strong></td>
						<td class="actions">
							<button class="icon-btn" title="Editar">
								<Pencil size={14} />
							</button>
							<button class="icon-btn danger" title="Anular">
								<Trash2 size={14} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Card>

	<aside class="sidebar">
		<Card>
			<h3 class="section-title">Por categoría</h3>
			<ul class="cat-list">
				{#each categorias as cat (cat.id)}
					{@const total = gastos
						.filter((g) => g.categoria === cat.id)
						.reduce((s, g) => s + g.importe, 0)}
					<li>
						<span class="cat-icon" style="background: {cat.color}">
							<svelte:component this={cat.icon} size={14} />
						</span>
						<span class="cat-name">{cat.nombre}</span>
						<span class="cat-total">{formatMoney(total)}</span>
					</li>
				{/each}
			</ul>
		</Card>
	</aside>
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
	}

	.page-title {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 500;
		letter-spacing: -0.025em;
		margin: 0;
	}

	.page-subtitle {
		font-size: 14px;
		color: var(--color-muted);
		margin: 4px 0 0;
	}

	.page-header-right {
		padding-top: 4px;
	}

	.stats-row {
		display: flex;
		gap: 40px;
		margin-bottom: 20px;
	}

	.stat {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: 32px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.stat-label {
		font-size: 14px;
		color: var(--color-muted);
	}

	.layout-cols {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 20px;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 500;
		margin: 0 0 16px;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.data-table th {
		text-align: left;
		font-weight: 600;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
		padding: 10px 12px;
		border-bottom: 1px solid var(--color-line);
	}

	.data-table td {
		padding: 14px 12px;
		border-bottom: 1px solid var(--color-line);
	}

	.data-table .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.data-table .muted {
		color: var(--color-muted);
	}

	.data-table .mono {
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.cat-pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		font-weight: 500;
		color: var(--cat-color);
		background: color-mix(in srgb, var(--cat-color) 12%, transparent);
		padding: 4px 10px;
		border-radius: var(--radius-ctl);
	}

	.actions {
		display: flex;
		gap: 4px;
	}

	.icon-btn {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-ctl);
		border: none;
		background: transparent;
		color: var(--color-muted);
		cursor: pointer;
		display: grid;
		place-items: center;
	}

	.icon-btn:hover {
		background: var(--color-well);
		color: var(--color-ink);
	}

	.icon-btn.danger:hover {
		background: rgb(191 54 68 / 0.1);
		color: var(--color-danger);
	}

	.cat-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.cat-list li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 0;
		border-bottom: 1px solid var(--color-line);
	}

	.cat-list li:last-child {
		border-bottom: none;
	}

	.cat-icon {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-ctl);
		display: grid;
		place-items: center;
		color: white;
	}

	.cat-name {
		flex: 1;
		font-size: 13px;
		font-weight: 500;
	}

	.cat-total {
		font-size: 13px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
</style>
