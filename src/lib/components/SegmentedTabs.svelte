<script lang="ts">
	interface Tab {
		label: string;
		value: string;
	}

	let { tabs = [] as Tab[], value = $bindable('') } = $props();
</script>

<nav class="seg" aria-label="Vista">
	{#each tabs as tab (tab.value)}
		<button
			type="button"
			class:active={value === tab.value}
			onclick={() => (value = tab.value)}
			aria-current={value === tab.value ? 'page' : undefined}
		>
			{tab.label}
		</button>
	{/each}
</nav>

<style>
	.seg {
		display: inline-flex;
		gap: 4px;
		padding: 4px;
		background: var(--color-well);
		border-radius: var(--radius-ctl);
	}

	button {
		font: inherit;
		padding: 0 14px;
		height: 28px;
		display: inline-flex;
		align-items: center;
		border-radius: var(--radius-ctl);
		color: var(--color-ink-soft);
		font-weight: 600;
		font-size: 12px;
		border: 0;
		background: transparent;
		cursor: pointer;
	}

	button.active {
		background: var(--color-raised);
		color: var(--color-ink);
		box-shadow: var(--shadow-card);
	}
</style>
