<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		class?: string;
		children: Snippet;
	}

	let { title, subtitle, class: className = '', children }: Props = $props();
</script>

<article class="card {className}">
	{#if title}
		<h2>{title}</h2>
	{/if}
	{#if subtitle}
		<p class="sub">{subtitle}</p>
	{/if}
	{@render children()}
</article>

<style>
	.card {
		background: var(--color-surface);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-card);
		padding: 24px 28px;
	}

	h2 {
		font-family: var(--font-display);
		font-size: 17px;
		font-weight: 500;
		letter-spacing: -0.025em;
		margin: 0 0 4px;
	}

	.sub {
		font-size: 12px;
		color: var(--color-muted);
		margin: 0 0 16px;
	}
</style>
