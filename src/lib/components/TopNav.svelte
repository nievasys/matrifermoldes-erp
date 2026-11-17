<script lang="ts">
	import { Bell } from 'lucide-svelte';

	interface NavItem {
		label: string;
		href: string;
		count?: number;
		active?: boolean;
	}

	let { items = [] as NavItem[], user = { initials: 'MA', name: 'Usuario' } } = $props();
</script>

<nav class="topbar" aria-label="Navegación principal">
	<div class="brand">
		<div class="brand-logo" aria-hidden="true">
			<svg viewBox="0 0 24 24"
				><path
					d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
					fill="var(--color-on-ink)"
				/></svg
			>
		</div>
		<div class="brand-text">
			<span class="brand-name">Matrifer</span>
			<span class="brand-sub">Moldes Moreno</span>
		</div>
	</div>

	<ul class="nav-pill">
		{#each items as item (item.href)}
			<li>
				<a href={item.href} aria-current={item.active ? 'page' : undefined}>
					{item.label}
					{#if item.count}
						<span class="count">{item.count}</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>

	<div class="topbar-right">
		<button class="icon-btn" aria-label="Notificaciones">
			<Bell size={20} strokeWidth={2} />
		</button>
		<div class="avatar" aria-label={user.name}>{user.initials}</div>
	</div>
</nav>

<style>
	.topbar {
		margin: 20px;
		margin-left: 84px;
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.brand-logo {
		width: 44px;
		height: 44px;
		background: var(--color-ink);
		border-radius: var(--radius-tile);
		display: grid;
		place-items: center;
	}

	.brand-logo svg {
		width: 24px;
		height: 24px;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
	}

	.brand-name {
		font-family: var(--font-display);
		font-size: 17px;
		font-weight: 600;
		color: var(--color-ink);
		line-height: 1.2;
	}

	.brand-sub {
		font-size: 11px;
		color: var(--color-muted);
	}

	.nav-pill {
		display: flex;
		gap: 4px;
		padding: 6px;
		background: var(--color-solid);
		border-radius: var(--radius-ctl);
		list-style: none;
		margin: 0 auto;
		box-shadow: var(--shadow-card);
	}

	.nav-pill a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 0 16px;
		height: 36px;
		border-radius: var(--radius-ctl);
		color: var(--color-ink-soft);
		font-weight: 600;
		font-size: 13px;
		text-decoration: none;
	}

	.nav-pill a:hover {
		background: var(--color-well);
	}

	.nav-pill a[aria-current='page'] {
		background: var(--color-ink);
		color: var(--color-on-ink);
	}

	.count {
		display: inline-grid;
		place-items: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: var(--radius-ctl);
		background: var(--color-danger);
		color: var(--color-on-ink);
		font-size: 11px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.topbar-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.icon-btn {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-ctl);
		border: 1px solid var(--color-line);
		background: var(--color-solid);
		display: grid;
		place-items: center;
		cursor: pointer;
		color: var(--color-ink-soft);
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-ctl);
		background: var(--color-accent-tint);
		color: var(--color-ink);
		font-weight: 700;
		font-size: 14px;
		display: grid;
		place-items: center;
	}
</style>
