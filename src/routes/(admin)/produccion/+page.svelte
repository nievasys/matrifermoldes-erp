<script lang="ts">
	import { Search, Filter, AlertCircle, Check, Eye } from 'lucide-svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';

	// Mock data - will come from load function
	const partes = [
		{
			id: 1,
			fecha: '16/11/2026',
			turno: 'Mañana',
			operario: 'R. Gómez',
			lineas: 3,
			piezas: 1240,
			estado: 'ok' as const,
			hora: '06:58'
		},
		{
			id: 2,
			fecha: '16/11/2026',
			turno: 'Mañana',
			operario: 'M. Fernández',
			lineas: 2,
			piezas: 890,
			estado: 'revisar' as const,
			hora: '07:40'
		},
		{
			id: 3,
			fecha: '16/11/2026',
			turno: 'Mañana',
			operario: 'L. Acosta',
			lineas: 4,
			piezas: 1560,
			estado: 'ok' as const,
			hora: '08:15'
		},
		{
			id: 4,
			fecha: '15/11/2026',
			turno: 'Tarde',
			operario: 'R. Gómez',
			lineas: 3,
			piezas: 1100,
			estado: 'ok' as const,
			hora: '14:22'
		},
		{
			id: 5,
			fecha: '15/11/2026',
			turno: 'Tarde',
			operario: 'M. Fernández',
			lineas: 2,
			piezas: 780,
			estado: 'revisar' as const,
			hora: '15:10'
		}
	];

	const resumen = {
		total: 156,
		piezas: 28893,
		revisar: 6
	};

	let filtroEstado = $state('todos');
	let busqueda = $state('');
</script>

<header class="page-header">
	<div class="page-header-left">
		<h1 class="page-title">Producción</h1>
		<p class="page-subtitle">Partes de producción de noviembre 2026</p>
	</div>
</header>

<div class="stats-row">
	<div class="stat">
		<span class="stat-value">{resumen.total}</span>
		<span class="stat-label">partes</span>
	</div>
	<div class="stat">
		<span class="stat-value">{resumen.piezas.toLocaleString('es-AR')}</span>
		<span class="stat-label">piezas</span>
	</div>
	<div class="stat warning">
		<span class="stat-value">{resumen.revisar}</span>
		<span class="stat-label">a revisar</span>
	</div>
</div>

<Card>
	<div class="toolbar">
		<div class="search-box">
			<Search size={16} />
			<input type="search" placeholder="Buscar por operario, molde..." bind:value={busqueda} />
		</div>
		<div class="filters">
			<select bind:value={filtroEstado} aria-label="Filtrar por estado">
				<option value="todos">Todos los estados</option>
				<option value="ok">Verificados</option>
				<option value="revisar">A revisar</option>
			</select>
			<Button variant="ghost">
				<Filter size={16} />
				Más filtros
			</Button>
		</div>
	</div>

	<table class="data-table">
		<thead>
			<tr>
				<th>Fecha</th>
				<th>Hora</th>
				<th>Turno</th>
				<th>Operario</th>
				<th class="num">Líneas</th>
				<th class="num">Piezas</th>
				<th>Estado</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each partes as parte (parte.id)}
				<tr>
					<td>{parte.fecha}</td>
					<td class="muted">{parte.hora}</td>
					<td>{parte.turno}</td>
					<td><strong>{parte.operario}</strong></td>
					<td class="num">{parte.lineas}</td>
					<td class="num">{parte.piezas.toLocaleString('es-AR')}</td>
					<td>
						{#if parte.estado === 'ok'}
							<Badge variant="positive">
								<Check size={12} />
								Verificado
							</Badge>
						{:else}
							<Badge variant="warning">
								<AlertCircle size={12} />
								A revisar
							</Badge>
						{/if}
					</td>
					<td>
						<a href="/produccion/{parte.id}" class="action-link">
							<Eye size={14} />
							Ver
						</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="pagination">
		<span class="pagination-info">Mostrando 1-5 de 156 partes</span>
		<div class="pagination-controls">
			<button disabled>Anterior</button>
			<button>Siguiente</button>
		</div>
	</div>
</Card>

<style>
	.page-header {
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

	.stats-row {
		display: flex;
		gap: 32px;
		margin-bottom: 20px;
	}

	.stat {
		display: flex;
		align-items: baseline;
		gap: 6px;
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

	.stat.warning .stat-value {
		color: var(--color-warning);
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		margin-bottom: 16px;
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--color-bg);
		border-radius: var(--radius-ctl);
		padding: 8px 14px;
		flex: 1;
		max-width: 320px;
		color: var(--color-muted);
	}

	.search-box input {
		border: none;
		background: transparent;
		font: inherit;
		font-size: 14px;
		flex: 1;
		outline: none;
	}

	.filters {
		display: flex;
		gap: 8px;
	}

	.filters select {
		font: inherit;
		font-size: 13px;
		height: 36px;
		padding: 0 12px;
		border-radius: var(--radius-ctl);
		border: 1px solid var(--color-line-strong);
		background: var(--color-solid);
		cursor: pointer;
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

	.action-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-accent-strong);
		text-decoration: none;
	}

	.action-link:hover {
		text-decoration: underline;
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
