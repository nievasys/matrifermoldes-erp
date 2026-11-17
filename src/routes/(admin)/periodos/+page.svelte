<script lang="ts">
	import { Lock, Unlock, FileText, Download, Clock } from 'lucide-svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';

	const periodos = [
		{
			id: 'nov-2026',
			mes: 'Noviembre',
			año: 2026,
			estado: 'abierto' as const,
			facturacion: 18426375,
			gastos: 6204110.5,
			ganancia: 12222264.5,
			partes: 156,
			cierreDisponible: false,
			motivoBloqueo: '3 líneas sin precio'
		},
		{
			id: 'oct-2026',
			mes: 'Octubre',
			año: 2026,
			estado: 'cerrado' as const,
			facturacion: 17012500,
			gastos: 5890320,
			ganancia: 11122180,
			partes: 148,
			fechaCierre: '01/11/2026'
		},
		{
			id: 'sep-2026',
			mes: 'Septiembre',
			año: 2026,
			estado: 'cerrado' as const,
			facturacion: 15340800,
			gastos: 5120000,
			ganancia: 10220800,
			partes: 142,
			fechaCierre: '01/10/2026'
		},
		{
			id: 'ago-2026',
			mes: 'Agosto',
			año: 2026,
			estado: 'cerrado' as const,
			facturacion: 14890200,
			gastos: 4950400,
			ganancia: 9939800,
			partes: 138,
			fechaCierre: '01/09/2026'
		}
	];

	function formatMoney(n: number) {
		return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
	}
</script>

<header class="page-header">
	<div class="page-header-left">
		<h1 class="page-title">Períodos</h1>
		<p class="page-subtitle">Gestión de cierres mensuales</p>
	</div>
</header>

<div class="periodos-grid">
	{#each periodos as periodo (periodo.id)}
		<Card>
			<div class="periodo-header">
				<div>
					<h3 class="periodo-title">{periodo.mes} {periodo.año}</h3>
					{#if periodo.estado === 'abierto'}
						<Badge variant="positive">
							<Unlock size={12} />
							Abierto
						</Badge>
					{:else}
						<Badge variant="neutral">
							<Lock size={12} />
							Cerrado
						</Badge>
					{/if}
				</div>
				{#if periodo.estado === 'cerrado'}
					<span class="fecha-cierre">
						<Clock size={12} />
						Cerrado el {periodo.fechaCierre}
					</span>
				{/if}
			</div>

			<div class="periodo-stats">
				<div class="periodo-stat">
					<span class="periodo-stat-label">Facturación</span>
					<span class="periodo-stat-value">{formatMoney(periodo.facturacion)}</span>
				</div>
				<div class="periodo-stat">
					<span class="periodo-stat-label">Gastos</span>
					<span class="periodo-stat-value negative">{formatMoney(periodo.gastos)}</span>
				</div>
				<div class="periodo-stat main">
					<span class="periodo-stat-label">Ganancia neta</span>
					<span class="periodo-stat-value positive">{formatMoney(periodo.ganancia)}</span>
				</div>
			</div>

			<div class="periodo-meta">
				<span>{periodo.partes} partes de producción</span>
			</div>

			<div class="periodo-actions">
				{#if periodo.estado === 'abierto'}
					{#if periodo.cierreDisponible}
						<Button>
							<Lock size={16} />
							Cerrar período
						</Button>
					{:else}
						<div class="bloqueo">
							<Button disabled>
								<Lock size={16} />
								Cerrar período
							</Button>
							<span class="bloqueo-motivo">{periodo.motivoBloqueo}</span>
						</div>
					{/if}
				{:else}
					<Button variant="secondary">
						<FileText size={16} />
						Ver resumen
					</Button>
					<Button variant="ghost">
						<Download size={16} />
						Exportar
					</Button>
				{/if}
			</div>
		</Card>
	{/each}
</div>

<style>
	.page-header {
		margin-bottom: 24px;
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

	.periodos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 20px;
	}

	.periodo-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
	}

	.periodo-header > div {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.periodo-title {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 500;
		margin: 0;
	}

	.fecha-cierre {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: var(--color-muted);
	}

	.periodo-stats {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 16px;
	}

	.periodo-stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.periodo-stat-label {
		font-size: 13px;
		color: var(--color-muted);
	}

	.periodo-stat-value {
		font-size: 15px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.periodo-stat-value.negative {
		color: var(--color-coral);
	}

	.periodo-stat-value.positive {
		color: var(--color-positive);
	}

	.periodo-stat.main {
		padding-top: 10px;
		border-top: 1px solid var(--color-line);
	}

	.periodo-stat.main .periodo-stat-label {
		font-weight: 600;
		color: var(--color-ink);
	}

	.periodo-stat.main .periodo-stat-value {
		font-size: 18px;
	}

	.periodo-meta {
		font-size: 12px;
		color: var(--color-muted);
		margin-bottom: 16px;
	}

	.periodo-actions {
		display: flex;
		gap: 8px;
		padding-top: 16px;
		border-top: 1px solid var(--color-line);
	}

	.bloqueo {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.bloqueo-motivo {
		font-size: 12px;
		color: var(--color-warning);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.bloqueo-motivo::before {
		content: '⚠';
	}
</style>
