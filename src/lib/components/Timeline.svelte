<script lang="ts">
	interface TimelineEvent {
		time: string; // "HH:MM"
		label: string;
	}

	let {
		label = '',
		startHour = 6,
		endHour = 14,
		events = [] as TimelineEvent[],
		nowTime = '' // "HH:MM" format
	} = $props();

	function timeToPercent(time: string): number {
		const [h, m] = time.split(':').map(Number);
		const totalMinutes = (h - startHour) * 60 + m;
		const rangeMinutes = (endHour - startHour) * 60;
		return (totalMinutes / rangeMinutes) * 100;
	}

	const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) =>
		String(startHour + i).padStart(2, '0')
	);
</script>

<div class="timeline">
	{#if label}
		<p class="timeline-label">{label}</p>
	{/if}
	<div class="timeline-track">
		{#each events as event (event.time)}
			<span
				class="timeline-dot"
				style="left: {timeToPercent(event.time)}%;"
				title="{event.time} – {event.label}"
			></span>
		{/each}
		{#if nowTime}
			<span class="timeline-now" style="left: {timeToPercent(nowTime)}%;">
				<span class="timeline-now-label">{nowTime}</span>
			</span>
		{/if}
		<div class="timeline-hours">
			{#each hours as hour (hour)}
				<span>{hour}</span>
			{/each}
		</div>
	</div>
</div>

<style>
	.timeline {
		margin-top: 20px;
	}

	.timeline-label {
		font-size: 12px;
		color: var(--color-muted);
		margin: 0 0 8px;
	}

	.timeline-track {
		position: relative;
		height: 36px;
		background: var(--color-well);
		border-radius: var(--radius-tile);
	}

	.timeline-hours {
		display: flex;
		justify-content: space-between;
		padding: 0 16px;
		position: absolute;
		bottom: -18px;
		left: 0;
		right: 0;
		font-size: 10px;
		color: var(--color-muted);
	}

	.timeline-dot {
		position: absolute;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-accent-strong);
		top: 50%;
		transform: translate(-50%, -50%);
		border: 2px solid var(--color-solid);
	}

	.timeline-now {
		position: absolute;
		top: 4px;
		bottom: 4px;
		width: 3px;
		background: var(--color-ink);
		border-radius: 2px;
		transform: translateX(-50%);
	}

	.timeline-now-label {
		position: absolute;
		top: -20px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 10px;
		font-weight: 700;
		color: var(--color-ink);
		background: var(--color-accent-tint);
		padding: 2px 8px;
		border-radius: var(--radius-ctl);
		white-space: nowrap;
	}
</style>
