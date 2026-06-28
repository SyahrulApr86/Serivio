<script lang="ts">
	import { cn } from '$lib/utils';
	let {
		value,
		total,
		class: klass = ''
	}: { value: number; total?: number | null; class?: string } = $props();

	const pct = $derived(total && total > 0 ? Math.min(100, Math.round((value / total) * 100)) : null);
</script>

<div class={cn('h-1.5 w-full overflow-hidden rounded-full bg-ash-border', klass)}>
	<div
		class="h-full rounded-full prism-gradient transition-[width]"
		style={`width: ${pct ?? 100}%`}
	></div>
</div>
