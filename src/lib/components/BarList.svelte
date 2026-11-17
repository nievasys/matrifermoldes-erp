<script lang="ts">
	interface BarItem {
		name: string;
		value: number;
		formattedValue: string;
		extra?: string;
	}

	let { items = [] as BarItem[], ariaLabel = '' } = $props();

	const maxValue = $derived(Math.max(...items.map((i) => i.value), 1));
</script>

<ul class="barlist" aria-label={ariaLabel}>
	{#each items as item (item.name)}
		<li>
			<span class="name">{item.name}</span>
			<span class="track">
				<span class="fill" style="width: {(item.value / maxValue) * 100}%;"></span>
			</span>
			<span class="val">
				{item.formattedValue}
				{#if item.extra}
					<small>{item.extra}</small>
				{/if}
			</span>
		</li>
	{/each}
</ul>

<style>
	.barlist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 10px;
	}

	li {
		display: grid;
		grid-template-columns: 100px 1fr 90px;
		gap: 10px;
		align-items: center;
		font-size: 13px;
	}

	.name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.track {
		height: 8px;
		background: var(--color-well);
		border-radius: var(--radius-ctl);
		overflow: hidden;
	}

	.fill {
		display: block;
		height: 100%;
		background: var(--color-accent-strong);
		border-radius: var(--radius-ctl);
	}

	.val {
		text-align: right;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}

	.val small {
		font-weight: 400;
		color: var(--color-muted);
		font-size: 11px;
		margin-left: 4px;
	}
</style>
