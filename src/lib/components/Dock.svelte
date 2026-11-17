<script lang="ts">
	import { Search, Plus, Moon, Calendar, Settings } from 'lucide-svelte';
</script>

<aside class="dock" aria-label="Accesos rápidos">
	<button class="dock-btn" aria-label="Buscar"><Search size={18} strokeWidth={1.8} /></button>
	<button class="dock-btn" aria-label="Crear"><Plus size={18} strokeWidth={1.8} /></button>
	<div class="dock-sep"></div>
	<button class="dock-btn" aria-label="Modo oscuro"><Moon size={18} strokeWidth={1.8} /></button>
	<button class="dock-btn" aria-label="Calendario"><Calendar size={18} strokeWidth={1.8} /></button>
	<button class="dock-btn" aria-label="Configuración"
		><Settings size={18} strokeWidth={1.8} /></button
	>
</aside>

<style>
	.dock {
		position: fixed;
		left: 16px;
		top: 180px;
		width: 48px;
		background: var(--color-ink);
		border-radius: var(--radius-card);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 12px 0;
		gap: 4px;
		z-index: 100;
		box-shadow: var(--shadow-pop);
	}

	.dock-btn {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-tile);
		border: 0;
		background: transparent;
		color: var(--color-on-ink);
		opacity: 0.6;
		cursor: pointer;
		display: grid;
		place-items: center;
	}

	.dock-btn:hover,
	.dock-btn:focus-visible {
		opacity: 1;
		background: rgb(255 255 255 / 0.1);
	}

	.dock-sep {
		width: 20px;
		height: 1px;
		background: rgb(255 255 255 / 0.12);
		margin: 4px 0;
	}
</style>
