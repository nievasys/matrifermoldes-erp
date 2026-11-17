<script lang="ts">
	import Dock from '#lib/components/Dock.svelte';
	import TopNav from '#lib/components/TopNav.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const navItems = [
		{ label: 'Dashboard', href: '/dashboard', active: true },
		{ label: 'Producción', href: '/produccion', count: 6 },
		{ label: 'Gastos', href: '/gastos' },
		{ label: 'Precios', href: '/precios' },
		{ label: 'Facturación', href: '/facturacion' },
		{ label: 'Períodos', href: '/periodos' },
		{ label: 'Catálogos', href: '/catalogos' }
	];

	const user = { initials: 'MA', name: 'Marcela Almada' };
</script>

<Dock />
<TopNav items={navItems} {user} />

<main class="main-content">
	{@render children()}
</main>

<style>
	.main-content {
		margin-left: 72px;
		padding: 0 32px 40px;
	}
</style>
