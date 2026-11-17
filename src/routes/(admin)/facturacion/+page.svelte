<script lang="ts">
	import { Download } from 'lucide-svelte';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';
	import SegmentedTabs from '#lib/components/SegmentedTabs.svelte';
	import BarList from '#lib/components/BarList.svelte';

	const resumen = {
		facturacion: 18426375,
		piezas: 28893,
		promedioPieza: 637.68
	};

	const porMaquina = [
		{ name: 'Inyectora 3', value: 6276340, formattedValue: '$ 6.276.340', extra: '9.840 pzas' },
		{ name: 'Inyectora 1', value: 4893770, formattedValue: '$ 4.893.770', extra: '7.675 pzas' },
		{ name: 'Inyectora 2', value: 3951960, formattedValue: '$ 3.951.960', extra: '6.198 pzas' },
		{ name: 'Inyectora 4', value: 2454305, formattedValue: '$ 2.454.305', extra: '5.180 pzas' }
	];

	const porMolde = [
		{
			name: 'Respaldos gdes verde',
			value: 6275460,
			formattedValue: '$ 6.275.460',
			extra: '9.840 pzas'
		},
		{ name: 'Tapa balde 20 L', value: 4605000, formattedValue: '$ 4.605.000', extra: '7.675 pzas' },
		{ name: 'Cajón frutero', value: 3718800, formattedValue: '$ 3.718.800', extra: '6.198 pzas' },
		{ name: 'Maceta N.º 30', value: 2977115, formattedValue: '$ 2.977.115', extra: '5.180 pzas' },
		{
			name: 'Bandeja porta-maceta',
			value: 850000,
			formattedValue: '$ 850.000',
			extra: '2.000 pzas'
		}
	];

	const detalle = [
		{
			fecha: '16/11/2026',
			molde: 'Respaldos gdes verde',
			maquina: 'Inyectora 3',
			piezas: 1240,
			precio: 638,
			subtotal: 791120
		},
		{
			fecha: '16/11/2026',
			molde: 'Tapa balde 20 L',
			maquina: 'Inyectora 1',
			piezas: 890,
			precio: 600,
			subtotal: 534000
		},
		{
			fecha: '16/11/2026',
			molde: 'Cajón frutero',
			maquina: 'Inyectora 2',
			piezas: 756,
			precio: 600,
			subtotal: 453600
		},
		{
			fecha: '15/11/2026',
			molde: 'Maceta N.º 30',
			maquina: 'Inyectora 4',
			piezas: 1100,
			precio: 575,
			subtotal: 632500
		},
		{
			fecha: '15/11/2026',
			molde: 'Respaldos gdes verde',
			maquina: 'Inyectora 3',
			piezas: 980,
			precio: 638,
			subtotal: 625240
		}
	];

	let vista = $state('maquina');

	function formatMoney(n: number) {
		return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
	}
</script>

<header class="page-header">
	<div class="page-header-left">
		<h1 class="page-title">Facturación</h1>
		<p class="page-subtitle">Detalle de facturación de noviembre 2026</p>
	</div>
	<div class="page-header-right">
		<Button variant="secondary">
			<Download size={16} />
			Exportar CSV
		</Button>
	</div>
</header>

<div class="stats-row">
	<div class="stat main">
		<span class="stat-value">{formatMoney(resumen.facturacion)}</span>
		<span class="stat-label">facturación total</span>
	</div>
	<div class="stat">
		<span class="stat-value">{resumen.piezas.toLocaleString('es-AR')}</span>
		<span class="stat-label">piezas</span>
	</div>
	<div class="stat">
		<span class="stat-value">{formatMoney(resumen.promedioPieza)}</span>
		<span class="stat-label">promedio por pieza</span>
	</div>
</div>

<div class="layout-cols">
	<Card>
		<h3 class="section-title">Detalle por línea</h3>
		<table class="data-table">
			<thead>
				<tr>
					<th>Fecha</th>
					<th>Molde</th>
					<th>Máquina</th>
					<th class="num">Piezas</th>
					<th class="num">Precio</th>
					<th class="num">Subtotal</th>
				</tr>
			</thead>
			<tbody>
				{#each detalle as linea, i (i)}
					<tr>
						<td class="muted">{linea.fecha}</td>
						<td><strong>{linea.molde}</strong></td>
						<td>{linea.maquina}</td>
						<td class="num">{linea.piezas.toLocaleString('es-AR')}</td>
						<td class="num muted">{formatMoney(linea.precio)}</td>
						<td class="num"><strong>{formatMoney(linea.subtotal)}</strong></td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="5" class="total-label">Total</td>
					<td class="num total-value">{formatMoney(detalle.reduce((s, l) => s + l.subtotal, 0))}</td
					>
				</tr>
			</tfoot>
		</table>

		<div class="pagination">
			<span class="pagination-info">Mostrando 1-5 de 423 líneas</span>
			<div class="pagination-controls">
				<button disabled>Anterior</button>
				<button>Siguiente</button>
			</div>
		</div>
	</Card>

	<aside class="sidebar">
		<Card title="Facturación por..." subtitle="Noviembre 2026">
			<SegmentedTabs
				tabs={[
					{ label: 'Máquina', value: 'maquina' },
					{ label: 'Molde', value: 'molde' }
				]}
				bind:value={vista}
			/>
			<div style="margin-top: 14px;">
				{#if vista === 'maquina'}
					<BarList items={porMaquina} ariaLabel="Facturación por máquina" />
				{:else}
					<BarList items={porMolde} ariaLabel="Facturación por molde" />
				{/if}
			</div>
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

	.stat.main .stat-value {
		font-size: 36px;
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	.stat-label {
		font-size: 14px;
		color: var(--color-muted);
	}

	.layout-cols {
		display: grid;
		grid-template-columns: 1fr 340px;
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

	.data-table tfoot td {
		border-bottom: none;
		padding-top: 16px;
	}

	.total-label {
		text-align: right;
		font-weight: 600;
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.total-value {
		font-weight: 700;
		font-size: 16px;
	}

	.pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 16px;
		margin-top: 8px;
	}

	.pagination-info {
		font-size: 13px;
		color: var(--color-muted);
	}

	.pagination-controls {
		display: flex;
		gap: 8px;
	}

	.pagination-controls button {
		font: inherit;
		font-size: 13px;
		font-weight: 500;
		padding: 6px 14px;
		border-radius: var(--radius-ctl);
		border: 1px solid var(--color-line-strong);
		background: var(--color-solid);
		cursor: pointer;
	}

	.pagination-controls button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
