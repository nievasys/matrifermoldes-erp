<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'dark' | 'tint' | 'plain';

	interface Props {
		variant?: Variant;
		label: string;
		value: string;
		delta: string;
		deltaUp?: boolean;
		href?: string;
		sparkline?: number[];
		icon?: Snippet;
	}

	let {
		variant = 'plain',
		label,
		value,
		delta,
		deltaUp = true,
		href,
		sparkline = [],
		icon
	}: Props = $props();

	// Convert sparkline data to SVG path
	function sparklinePath(data: number[]): string {
		if (data.length < 2) return '';
		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min || 1;
		const h = 36;
		const w = 200;
		const step = w / (data.length - 1);

		return data
			.map((v, i) => {
				const x = i * step;
				const y = h - ((v - min) / range) * (h - 4) - 2;
				return `${i === 0 ? 'M' : 'L'}${x},${y}`;
			})
			.join(' ');
	}
</script>

<article class="kpi {variant}">
	<p class="kpi-label">
		{#if icon}
			{@render icon()}
		{/if}
		{label}
	</p>
	<p class="kpi-value">{value}</p>
	<p class="kpi-delta" class:up={deltaUp} class:down={!deltaUp}>{delta}</p>

	{#if sparkline.length > 1}
		<svg class="spark" viewBox="0 0 200 36" preserveAspectRatio="none">
			<polyline
				points={sparklinePath(sparkline)
					.replace(/[ML]/g, (m) => (m === 'M' ? '' : ' '))
					.trim()}
			/>
		</svg>
	{/if}

	{#if href}
		<p class="kpi-link"><a {href}>Ver detalle</a></p>
	{/if}
</article>

<style>
	.kpi {
		border-radius: var(--radius-card);
		padding: 20px 24px;
		box-shadow: var(--shadow-card);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.kpi-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 600;
		margin: 0;
	}

	.kpi-label :global(svg) {
		width: 16px;
		height: 16px;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
	}

	.kpi-value {
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
		margin: 4px 0 0;
	}

	.kpi-delta {
		font-size: 12px;
		font-weight: 600;
		margin: 0;
	}

	.spark {
		width: 100%;
		height: 36px;
		display: block;
		margin-top: 8px;
	}

	.spark polyline {
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.kpi-link {
		font-size: 11px;
		margin: auto 0 0;
		padding-top: 4px;
	}

	.kpi-link a {
		opacity: 0.7;
		text-decoration: none;
	}

	.kpi-link a:hover {
		opacity: 1;
		text-decoration: underline;
	}

	/* Dark variant */
	.kpi.dark {
		background: var(--color-ink);
		color: var(--color-on-ink);
	}

	.kpi.dark .kpi-delta {
		color: var(--color-accent);
	}

	.kpi.dark .spark polyline {
		stroke: var(--color-accent);
	}

	.kpi.dark .kpi-link a {
		color: var(--color-on-ink);
	}

	/* Tint variant */
	.kpi.tint {
		background: var(--color-accent-tint);
		color: var(--color-ink);
	}

	.kpi.tint .kpi-label {
		color: var(--color-ink-soft);
	}

	.kpi.tint .kpi-delta {
		color: var(--color-positive);
	}

	.kpi.tint .spark polyline {
		stroke: var(--color-accent-strong);
	}

	.kpi.tint .kpi-link a {
		color: var(--color-accent-strong);
		opacity: 1;
	}

	/* Plain variant */
	.kpi.plain {
		background: var(--color-surface);
		color: var(--color-ink);
	}

	.kpi.plain .kpi-label {
		color: var(--color-ink-soft);
	}

	.kpi.plain .kpi-delta.up {
		color: var(--color-positive);
	}

	.kpi.plain .kpi-delta.down {
		color: var(--color-danger);
	}

	.kpi.plain .spark polyline {
		stroke: var(--color-accent-strong);
	}

	.kpi.plain .kpi-link a {
		color: var(--color-accent-strong);
		opacity: 1;
	}
</style>
