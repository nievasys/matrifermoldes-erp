<script lang="ts">
	import { Plus, Pencil, ToggleLeft, ToggleRight, Box, Cpu, Users } from 'lucide-svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import Card from '#lib/components/Card.svelte';

	const moldes = [
		{ id: 1, codigo: 'MOL-001', nombre: 'Respaldos gdes verde', activo: true },
		{ id: 2, codigo: 'MOL-002', nombre: 'Tapa balde 20 L', activo: true },
		{ id: 3, codigo: 'MOL-003', nombre: 'Cajón frutero', activo: true },
		{ id: 4, codigo: 'MOL-004', nombre: 'Maceta N.º 30', activo: true },
		{ id: 5, codigo: 'MOL-005', nombre: 'Base matero grande', activo: true },
		{ id: 6, codigo: 'MOL-006', nombre: 'Tapa hermética 5 L', activo: true },
		{ id: 7, codigo: 'MOL-007', nombre: 'Patas silla jardín', activo: false },
		{ id: 8, codigo: 'MOL-008', nombre: 'Bandeja porta-maceta', activo: true }
	];

	const maquinas = [
		{
			id: 1,
			codigo: 'INY-001',
			nombre: 'Inyectora 1',
			marca: 'Haitian',
			tonelaje: 200,
			activo: true
		},
		{
			id: 2,
			codigo: 'INY-002',
			nombre: 'Inyectora 2',
			marca: 'Haitian',
			tonelaje: 150,
			activo: true
		},
		{ id: 3, codigo: 'INY-003', nombre: 'Inyectora 3', marca: 'JSW', tonelaje: 350, activo: true },
		{
			id: 4,
			codigo: 'INY-004',
			nombre: 'Inyectora 4',
			marca: 'Haitian',
			tonelaje: 120,
			activo: true
		}
	];

	const operarios = [
		{ id: 1, nombre: 'Roberto Gómez', email: 'rgomez@matrifer.com', turno: 'Mañana', activo: true },
		{
			id: 2,
			nombre: 'Miguel Fernández',
			email: 'mfernandez@matrifer.com',
			turno: 'Mañana',
			activo: true
		},
		{ id: 3, nombre: 'Lucas Acosta', email: 'lacosta@matrifer.com', turno: 'Tarde', activo: true },
		{ id: 4, nombre: 'Juan Pérez', email: 'jperez@matrifer.com', turno: 'Tarde', activo: false }
	];

	let seccion = $state('moldes');

	const tabs = [
		{ label: 'Moldes', value: 'moldes', icon: Box },
		{ label: 'Máquinas', value: 'maquinas', icon: Cpu },
		{ label: 'Operarios', value: 'operarios', icon: Users }
	];
</script>

<header class="page-header">
	<div class="page-header-left">
		<h1 class="page-title">Catálogos</h1>
		<p class="page-subtitle">Gestión de moldes, máquinas y operarios</p>
	</div>
	<div class="page-header-right">
		<Button>
			<Plus size={16} />
			{#if seccion === 'moldes'}
				Agregar molde
			{:else if seccion === 'maquinas'}
				Agregar máquina
			{:else}
				Agregar operario
			{/if}
		</Button>
	</div>
</header>

<div class="tabs-row">
	{#each tabs as tab (tab.value)}
		<button
			class="tab-btn"
			class:active={seccion === tab.value}
			onclick={() => (seccion = tab.value)}
		>
			<svelte:component this={tab.icon} size={16} />
			{tab.label}
		</button>
	{/each}
</div>

<Card>
	{#if seccion === 'moldes'}
		<table class="data-table">
			<thead>
				<tr>
					<th>Código</th>
					<th>Nombre</th>
					<th>Estado</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each moldes as molde (molde.id)}
					<tr class:inactivo={!molde.activo}>
						<td class="mono">{molde.codigo}</td>
						<td><strong>{molde.nombre}</strong></td>
						<td>
							{#if molde.activo}
								<Badge variant="positive">Activo</Badge>
							{:else}
								<Badge variant="neutral">Inactivo</Badge>
							{/if}
						</td>
						<td class="actions">
							<button class="icon-btn" title="Editar">
								<Pencil size={14} />
							</button>
							<button class="icon-btn" title={molde.activo ? 'Desactivar' : 'Activar'}>
								{#if molde.activo}
									<ToggleRight size={16} />
								{:else}
									<ToggleLeft size={16} />
								{/if}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else if seccion === 'maquinas'}
		<table class="data-table">
			<thead>
				<tr>
					<th>Código</th>
					<th>Nombre</th>
					<th>Marca</th>
					<th class="num">Tonelaje</th>
					<th>Estado</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each maquinas as maquina (maquina.id)}
					<tr class:inactivo={!maquina.activo}>
						<td class="mono">{maquina.codigo}</td>
						<td><strong>{maquina.nombre}</strong></td>
						<td>{maquina.marca}</td>
						<td class="num">{maquina.tonelaje} t</td>
						<td>
							{#if maquina.activo}
								<Badge variant="positive">Activo</Badge>
							{:else}
								<Badge variant="neutral">Inactivo</Badge>
							{/if}
						</td>
						<td class="actions">
							<button class="icon-btn" title="Editar">
								<Pencil size={14} />
							</button>
							<button class="icon-btn" title={maquina.activo ? 'Desactivar' : 'Activar'}>
								{#if maquina.activo}
									<ToggleRight size={16} />
								{:else}
									<ToggleLeft size={16} />
								{/if}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<table class="data-table">
			<thead>
				<tr>
					<th>Nombre</th>
					<th>Email</th>
					<th>Turno</th>
					<th>Estado</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each operarios as operario (operario.id)}
					<tr class:inactivo={!operario.activo}>
						<td><strong>{operario.nombre}</strong></td>
						<td class="muted">{operario.email}</td>
						<td>{operario.turno}</td>
						<td>
							{#if operario.activo}
								<Badge variant="positive">Activo</Badge>
							{:else}
								<Badge variant="neutral">Inactivo</Badge>
							{/if}
						</td>
						<td class="actions">
							<button class="icon-btn" title="Editar">
								<Pencil size={14} />
							</button>
							<button class="icon-btn" title={operario.activo ? 'Desactivar' : 'Activar'}>
								{#if operario.activo}
									<ToggleRight size={16} />
								{:else}
									<ToggleLeft size={16} />
								{/if}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
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
		padding-top: 4px;
	}

	.tabs-row {
		display: flex;
		gap: 8px;
		margin-bottom: 20px;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		font: inherit;
		font-size: 14px;
		font-weight: 500;
		padding: 10px 18px;
		border-radius: var(--radius-ctl);
		border: 1px solid var(--color-line-strong);
		background: var(--color-solid);
		color: var(--color-ink-soft);
		cursor: pointer;
		transition: all 0.15s;
	}

	.tab-btn:hover {
		border-color: var(--color-ink);
		color: var(--color-ink);
	}

	.tab-btn.active {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: var(--color-on-ink);
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

	tr.inactivo {
		opacity: 0.5;
	}

	.actions {
		display: flex;
		gap: 4px;
		justify-content: flex-end;
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
</style>
