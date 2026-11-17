<script lang="ts">
	import {
		CreditCard,
		Package,
		DollarSign,
		Activity,
		AlertCircle,
		Pencil,
		Plus
	} from 'lucide-svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import KpiCard from '#lib/components/KpiCard.svelte';
	import Card from '#lib/components/Card.svelte';
	import Timeline from '#lib/components/Timeline.svelte';
	import BarList from '#lib/components/BarList.svelte';
	import SegmentedTabs from '#lib/components/SegmentedTabs.svelte';

	// Mock data - in real app this would come from load function
	const periodo = { mes: 'Noviembre', año: 2026, estado: 'Abierto' as const };

	const kpis = {
		facturacion: {
			value: '$ 18.426.375,00',
			delta: '+8,4 % frente a octubre',
			sparkline: [11.2, 10.4, 12.9, 13.6, 14.8, 13.1, 15.7, 16.2, 15.4, 17.0, 18.4]
		},
		piezas: {
			value: '28.893',
			delta: '+3,1 % frente a octubre',
			sparkline: [24000, 23500, 25000, 26000, 27000, 25500, 27500, 28000, 27000, 28000, 28893]
		},
		gastos: {
			value: '$ 6.204.110,50',
			delta: '+12,6 % frente a octubre',
			sparkline: [4.9, 4.7, 5.1, 5.3, 5.6, 5.4, 5.8, 5.9, 5.7, 5.5, 6.2]
		},
		ganancia: {
			value: '$ 12.222.264,50',
			delta: 'Margen 66,3 %',
			sparkline: [6.3, 5.7, 7.8, 8.3, 9.2, 7.7, 9.9, 10.3, 9.7, 11.5, 12.2]
		}
	};

	const partesHoy = [
		{ time: '06:58', label: 'R. Gómez' },
		{ time: '07:40', label: 'M. Fernández' },
		{ time: '08:15', label: 'L. Acosta' },
		{ time: '08:52', label: 'R. Gómez' },
		{ time: '09:30', label: 'M. Fernández' },
		{ time: '10:05', label: 'L. Acosta' },
		{ time: '10:31', label: 'R. Gómez' }
	];

	const facturacionMaquina = [
		{ name: 'Inyectora 3', value: 6276340, formattedValue: '$ 6.276.340', extra: '9.840' },
		{ name: 'Inyectora 1', value: 4893770, formattedValue: '$ 4.893.770', extra: '7.675' },
		{ name: 'Inyectora 2', value: 3951960, formattedValue: '$ 3.951.960', extra: '6.198' },
		{ name: 'Inyectora 4', value: 2454305, formattedValue: '$ 2.454.305', extra: '5.180' }
	];

	const facturacionMolde = [
		{ name: 'Respaldos gdes verde', value: 6275460, formattedValue: '$ 6.275.460', extra: '9.840' },
		{ name: 'Tapa balde 20 L', value: 4605000, formattedValue: '$ 4.605.000', extra: '7.675' },
		{ name: 'Cajón frutero', value: 3718800, formattedValue: '$ 3.718.800', extra: '6.198' },
		{ name: 'Maceta N.º 30', value: 2977115, formattedValue: '$ 2.977.115', extra: '5.180' }
	];

	let vistaFacturacion = $state('maquina');
</script>

<header class="page-header">
	<div class="page-header-left">
		<nav class="crumbs" aria-label="Migas de pan">
			<a href="/">Inicio</a> › Dashboard
		</nav>
		<h1 class="page-title">Dashboard</h1>
		<div class="period-row">
			<div class="period-select">
				<select aria-label="Mes">
					<option>{periodo.mes}</option>
				</select>
				<select aria-label="Año">
					<option>{periodo.año}</option>
				</select>
			</div>
			<Badge variant="positive">{periodo.estado}</Badge>
			<span class="meta-text">Actualizado hace 1 min</span>
		</div>
	</div>
	<div class="page-header-right">
		<Button variant="secondary">
			<Plus size={16} />
			Cargar gasto
		</Button>
		<div>
			<Button disabled>Cerrar período</Button>
			<p class="disabled-reason">
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
					/>
					<line x1="12" y1="9" x2="12" y2="13" />
					<line x1="12" y1="17" x2="12.01" y2="17" />
				</svg>
				3 líneas sin precio
			</p>
		</div>
	</div>
</header>

<section class="hero-row" aria-label="Resumen del día">
	<article class="card hero-card">
		<p class="card-sm">Lunes 16 de noviembre de 2026</p>
		<h2 class="greeting">Buen día, Marcela.</h2>
		<p class="summary">
			Hoy se cargaron <strong>7 partes</strong> con un total de <strong>2.140 piezas</strong>.
			<span class="danger">6 partes están marcados a revisar</span> porque se cargaron fuera del horario
			del turno.
		</p>
		<Timeline
			label="Turno Mañana (06:00 – 14:00)"
			startHour={6}
			endHour={14}
			events={partesHoy}
			nowTime="10:42"
		/>
	</article>

	<article class="card attention">
		<h3>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="var(--color-warning)"
				stroke-width="2"
			>
				<path
					d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
				/>
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
			Atención
		</h3>
		<div class="alert-item">
			<span class="alert-icon danger">
				<AlertCircle size={14} />
			</span>
			<div class="alert-text">
				<strong>3 líneas sin precio</strong>
				<span>Bloquea el cierre</span>
			</div>
			<a href="/precios" class="alert-action">Cargar precios</a>
		</div>
		<div class="alert-item">
			<span class="alert-icon warning">
				<Pencil size={14} />
			</span>
			<div class="alert-text">
				<strong>6 partes a revisar</strong>
				<span>Fuera del horario del turno</span>
			</div>
			<a href="/produccion?revisar=1" class="alert-action">Ver partes</a>
		</div>
	</article>
</section>

<section class="kpi-row" aria-label="Indicadores del período">
	<KpiCard
		variant="dark"
		label="Facturación de noviembre"
		value={kpis.facturacion.value}
		delta={kpis.facturacion.delta}
		sparkline={kpis.facturacion.sparkline}
		href="/facturacion"
	>
		{#snippet icon()}<CreditCard size={16} />{/snippet}
	</KpiCard>

	<KpiCard
		variant="tint"
		label="Piezas producidas"
		value={kpis.piezas.value}
		delta={kpis.piezas.delta}
		sparkline={kpis.piezas.sparkline}
		href="/produccion"
	>
		{#snippet icon()}<Package size={16} />{/snippet}
	</KpiCard>

	<KpiCard
		variant="plain"
		label="Gastos deducibles"
		value={kpis.gastos.value}
		delta={kpis.gastos.delta}
		deltaUp={false}
		sparkline={kpis.gastos.sparkline}
		href="/gastos"
	>
		{#snippet icon()}<DollarSign size={16} />{/snippet}
	</KpiCard>

	<KpiCard
		variant="plain"
		label="Ganancia neta"
		value={kpis.ganancia.value}
		delta={kpis.ganancia.delta}
		sparkline={kpis.ganancia.sparkline}
		href="/reportes"
	>
		{#snippet icon()}<Activity size={16} />{/snippet}
	</KpiCard>
</section>

<section class="bottom-row">
	<Card title="Facturación y gastos del año" subtitle="Noviembre 2026">
		<div class="chart-area">
			<div class="chart-y">
				<span>$ 20 M</span>
				<span>$ 15 M</span>
				<span>$ 10 M</span>
				<span>$ 5 M</span>
				<span>$ 0</span>
			</div>
			<svg class="chart-svg" viewBox="0 0 400 160" preserveAspectRatio="none">
				<polyline
					fill="none"
					stroke="var(--color-accent-strong)"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					points="0,70 36,77 72,56 108,51 144,42 180,55 216,34 252,30 288,37 324,24 360,13 400,13"
				/>
				<polyline
					fill="none"
					stroke="var(--color-coral)"
					stroke-width="2"
					stroke-dasharray="6 4"
					stroke-linecap="round"
					stroke-linejoin="round"
					points="0,121 36,123 72,120 108,118 144,115 180,117 216,114 252,113 288,114 324,116 360,111 400,111"
				/>
			</svg>
			<div class="chart-x">
				<span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span
					>Jun</span
				><span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span
					>Dic</span
				>
			</div>
		</div>
		<div class="legend">
			<span class="legend-item"><span class="legend-dot billing"></span> Facturación</span>
			<span class="legend-item"><span class="legend-dot expenses"></span> Gastos</span>
		</div>
	</Card>

	<Card title="Facturación por máquina" subtitle="Noviembre 2026">
		<SegmentedTabs
			tabs={[
				{ label: 'Por máquina', value: 'maquina' },
				{ label: 'Por molde', value: 'molde' }
			]}
			bind:value={vistaFacturacion}
		/>
		<div style="margin-top: 14px;">
			{#if vistaFacturacion === 'maquina'}
				<BarList items={facturacionMaquina} ariaLabel="Facturación por máquina" />
			{:else}
				<BarList items={facturacionMolde} ariaLabel="Facturación por molde" />
			{/if}
		</div>
	</Card>
</section>

<style>
	/* Page header */
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 24px;
		margin-bottom: 16px;
	}

	.page-header-left {
		flex: 1;
	}

	.crumbs {
		font-size: 12px;
		color: var(--color-muted);
		margin-bottom: 4px;
	}

	.crumbs a {
		color: var(--color-accent-strong);
		font-weight: 400;
		text-decoration: none;
	}

	.crumbs a:hover {
		text-decoration: underline;
	}

	.page-title {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 500;
		letter-spacing: -0.025em;
		margin: 0;
		line-height: 1.2;
	}

	.period-row {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 6px;
	}

	.period-select select {
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		height: 32px;
		padding: 0 10px;
		border-radius: var(--radius-ctl);
		border: 1px solid var(--color-line-strong);
		background: var(--color-solid);
		color: var(--color-ink);
		cursor: pointer;
	}

	.meta-text {
		font-size: 11px;
		color: var(--color-muted);
	}

	.page-header-right {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-top: 16px;
	}

	.disabled-reason {
		font-size: 11px;
		color: var(--color-warning);
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 4px 0 0;
	}

	/* Hero row */
	.hero-row {
		display: grid;
		grid-template-columns: 1fr minmax(280px, 340px);
		gap: 16px;
		margin-bottom: 16px;
	}

	.card {
		background: var(--color-surface);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-card);
		padding: 24px 28px;
	}

	.hero-card .card-sm {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
		font-weight: 600;
		margin: 0 0 6px;
	}

	.greeting {
		font-family: var(--font-display);
		font-size: 32px;
		font-weight: 500;
		letter-spacing: -0.025em;
		margin: 0 0 6px;
	}

	.summary {
		font-size: 14px;
		color: var(--color-ink-soft);
		line-height: 1.5;
		margin: 0;
	}

	.summary strong {
		color: var(--color-ink);
		font-weight: 600;
	}

	.summary .danger {
		color: var(--color-danger);
		font-weight: 600;
	}

	/* Attention card */
	.attention {
		background: var(--color-solid);
		padding: 20px 24px;
	}

	.attention h3 {
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 500;
		margin: 0 0 14px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.alert-item {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 10px 0;
		border-top: 1px solid var(--color-line);
	}

	.alert-item:first-of-type {
		border-top: 0;
		padding-top: 0;
	}

	.alert-icon {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-ctl);
		display: grid;
		place-items: center;
		flex: none;
	}

	.alert-icon.danger {
		background: rgb(191 54 68 / 0.1);
		color: var(--color-danger);
	}

	.alert-icon.warning {
		background: rgb(143 96 0 / 0.1);
		color: var(--color-warning);
	}

	.alert-text {
		flex: 1;
	}

	.alert-text strong {
		font-size: 13px;
		font-weight: 600;
		display: block;
	}

	.alert-text span {
		font-size: 11px;
		color: var(--color-muted);
	}

	.alert-action {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-accent-strong);
		white-space: nowrap;
		align-self: center;
		text-decoration: none;
	}

	.alert-action:hover {
		text-decoration: underline;
	}

	/* KPI row */
	.kpi-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-bottom: 16px;
	}

	/* Bottom row */
	.bottom-row {
		display: grid;
		grid-template-columns: 1fr minmax(320px, 400px);
		gap: 16px;
	}

	/* Chart */
	.chart-area {
		position: relative;
		height: 200px;
	}

	.chart-y {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 24px;
		width: 48px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 11px;
		color: var(--color-muted);
		text-align: right;
		padding-right: 8px;
	}

	.chart-svg {
		position: absolute;
		left: 48px;
		right: 0;
		top: 0;
		bottom: 24px;
	}

	.chart-x {
		position: absolute;
		left: 48px;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		color: var(--color-muted);
	}

	.legend {
		display: flex;
		gap: 20px;
		margin-top: 12px;
		font-size: 12px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.legend-dot.billing {
		background: var(--color-accent-strong);
	}

	.legend-dot.expenses {
		background: var(--color-coral);
	}
</style>
