<script lang="ts">
	type Variant = 'default' | 'positive' | 'warning' | 'danger' | 'closed';

	let { variant = 'default' as Variant, children } = $props();
</script>

<span class="badge">
	<span class="dot {variant}"></span>
	{@render children()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 24px;
		padding: 0 10px;
		border-radius: var(--radius-ctl);
		background: var(--color-solid);
		border: 1px solid var(--color-line);
		font-size: 12px;
		font-weight: 600;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-ctl);
		flex: none;
		background: var(--color-slate);
	}

	.dot.positive {
		background: var(--color-positive);
	}
	.dot.warning {
		background: var(--color-warning);
	}
	.dot.danger {
		background: var(--color-danger);
	}
	.dot.closed {
		background: var(--color-ink-soft);
	}
</style>
