<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface AlertItem {
		icon: Snippet;
		variant: 'danger' | 'warning';
		title: string;
		subtitle: string;
		actionLabel: string;
		actionHref: string;
	}

	let { title = 'Atención', items = [] as AlertItem[] } = $props();
</script>

<article class="attention">
	<h3>
		<AlertTriangle size={18} strokeWidth={2} />
		{title}
	</h3>
	{#each items as item (item.title)}
		<div class="alert-item">
			<span class="alert-icon {item.variant}">
				{@render item.icon()}
			</span>
			<div class="alert-text">
				<strong>{item.title}</strong>
				<span>{item.subtitle}</span>
			</div>
			<a href={item.actionHref} class="alert-action">{item.actionLabel}</a>
		</div>
	{/each}
</article>

<style>
	.attention {
		background: var(--color-solid);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-card);
		padding: 20px 24px;
	}

	h3 {
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 500;
		margin: 0 0 14px;
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--color-ink);
	}

	h3 :global(svg) {
		color: var(--color-warning);
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

	.alert-icon :global(svg) {
		width: 14px;
		height: 14px;
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
</style>
