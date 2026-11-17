<script lang="ts">
	import { Plus, History, AlertCircle, Check } from 'lucide-svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';

	const moldes = [
		{
			id: 1,
			codigo: 'MOL-001',
			nombre: 'Respaldos gdes verde',
			precio: 638,
			vigente: true,
			desde: '01/09/2026'
		},
		{
			id: 2,
			codigo: 'MOL-002',
			nombre: 'Tapa balde 20 L',
			precio: 600,
			vigente: true,
			desde: '01/09/2026'
		},
		{
			id: 3,
			codigo: 'MOL-003',
			nombre: 'Cajón frutero',
			precio: 600,
			vigente: true,
			desde: '01/10/2026'
		},
		{
			id: 4,
			codigo: 'MOL-004',
			nombre: 'Maceta N.º 30',
			precio: 575,
			vigente: true,
			desde: '15/08/2026'
		},
		{
			id: 5,
			codigo: 'MOL-005',
			nombre: 'Base matero grande',
			precio: null,
			vigente: false,
			desde: null
		},
		{
			id: 6,
			codigo: 'MOL-006',
			nombre: 'Tapa hermética 5 L',
			precio: null,
			vigente: false,
			desde: null
		},
		{
			id: 7,
			codigo: 'MOL-007',
			nombre: 'Patas silla jardín',
			precio: null,
			vigente: false,
			desde: null
		},
		{
			id: 8,
			codigo: 'MOL-008',
			nombre: 'Bandeja porta-maceta',
			precio: 420,
			vigente: true,
			desde: '01/11/2026'
		}
	];

	const sinPrecio = moldes.filter((m) => !m.precio).length;

	function formatMoney(n: number | null) {
		if (n === null) return '—';
		return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
	}
</script>

<header class="page-header">
	<div class="page-header-left">
		<h1 class="page-title">Precios</h1>
		<p class="page-subtitle">Precios unitarios por molde</p>
	</div>
	<div class="page-header-right">
		<Button variant="secondary">
			<History size={16} />
			Historial
		</Button>
		<Button>
			<Plus size={16} />
			Cargar precio
		</Button>
	</div>
</header>

{#if sinPrecio > 0}
	<div class="alert-banner">
		<AlertCircle size={18} />
		<div>
			<strong>{sinPrecio} moldes sin precio</strong>
			<span>No se puede cerrar el período hasta completar los precios</span>
		</div>
	</div>
{/if}

<Card>
	<table class="data-table">
		<thead>
			<tr>
				<th>Código</th>
				<th>Molde</th>
				<th class="num">Precio unitario</th>
				<th>Vigente desde</th>
				<th>Estado</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each moldes as molde (molde.id)}
				<tr class:sin-precio={!molde.precio}>
					<td class="mono">{molde.codigo}</td>
					<td><strong>{molde.nombre}</strong></td>
					<td class="num price">{formatMoney(molde.precio)}</td>
					<td class="muted">{molde.desde ?? '—'}</td>
					<td>
						{#if molde.vigente}
							<Badge variant="positive">
								<Check size={12} />
								Vigente
							</Badge>
						{:else}
							<Badge variant="warning">
								<AlertCircle size={12} />
								Sin precio
							</Badge>
						{/if}
					</td>
					<td>
						<Button variant="ghost" size="sm">
							{#if molde.precio}
								Actualizar
							{:else}
								Cargar precio
							{/if}
						</Button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>

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
		display: flex;
		gap: 10px;
		padding-top: 4px;
	}

	.alert-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgb(143 96 0 / 0.08);
		border: 1px solid rgb(143 96 0 / 0.2);
		border-radius: var(--radius-tile);
		padding: 14px 18px;
		margin-bottom: 20px;
		color: var(--color-warning);
	}

	.alert-banner strong {
		display: block;
		font-size: 14px;
	}

	.alert-banner span {
		font-size: 13px;
		opacity: 0.85;
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
		color: var(--color-muted);
	}

	.data-table .price {
		font-weight: 600;
		font-size: 15px;
	}

	tr.sin-precio {
		background: rgb(143 96 0 / 0.04);
	}

	tr.sin-precio .price {
		color: var(--color-warning);
	}
</style>
