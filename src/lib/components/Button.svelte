<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		children: Snippet;
	}

	let { variant = 'primary', size = 'md', children, ...rest }: Props = $props();
</script>

<button class="btn {variant} {size}" {...rest}>
	{@render children()}
</button>

<style>
	.btn {
		font: inherit;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-ctl);
		border: 1px solid var(--color-ink);
		background: var(--color-ink);
		color: var(--color-on-ink);
		cursor: pointer;
		padding: 0 18px;
		height: 40px;
		font-size: 13px;
	}

	.btn:hover:not(:disabled) {
		box-shadow: var(--shadow-pop);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn.secondary {
		background: var(--color-solid);
		color: var(--color-ink);
		border-color: var(--color-line-strong);
	}

	.btn.secondary:hover:not(:disabled) {
		background: var(--color-raised);
		box-shadow: none;
	}

	.btn.ghost {
		background: transparent;
		color: var(--color-ink);
		border: 0;
	}

	.btn.ghost:hover:not(:disabled) {
		background: var(--color-well);
		box-shadow: none;
	}

	.btn.danger {
		background: var(--color-danger);
		border-color: var(--color-danger);
	}

	.btn.sm {
		height: 32px;
		padding: 0 14px;
		font-size: 12px;
	}

	.btn.lg {
		height: 48px;
		padding: 0 24px;
		font-size: 14px;
	}
</style>
