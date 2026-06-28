<script lang="ts">
	import type { Series } from '$lib/server/db/schema';
	import { progressUnit } from '$lib/constants';
	import Cover from './Cover.svelte';
	import StatusBadge from './ui/StatusBadge.svelte';
	import ProgressBar from './ui/ProgressBar.svelte';

	let { series }: { series: Series } = $props();
	const unit = $derived(progressUnit(series.mediaType));
</script>

<a
	href={`/series/${series.id}`}
	class="group flex flex-col overflow-hidden rounded-[7px] border border-ash-border bg-paper-white transition-colors hover:border-midnight-ink/30"
>
	<div class="aspect-[3/4] overflow-hidden bg-ash-border">
		<Cover
			src={series.coverImage}
			title={series.title}
			class="transition-transform duration-300 group-hover:scale-[1.03]"
		/>
	</div>
	<div class="flex flex-1 flex-col gap-2 p-3">
		<div class="flex items-start justify-between gap-2">
			<h3 class="line-clamp-2 font-sans text-[15px] font-semibold text-midnight-ink">
				{series.title}
			</h3>
		</div>
		<div class="mt-auto flex flex-col gap-2">
			<p class="font-sans text-[13px] text-carbon-nav">
				{series.mediaType === 'Movie' ? series.mediaType : `${unit} ${series.currentProgress}`}
				{#if series.totalProgress}<span class="text-carbon-nav/60"> / {series.totalProgress}</span
					>{/if}
			</p>
			<ProgressBar value={series.currentProgress} total={series.totalProgress} />
			<StatusBadge status={series.status} class="self-start" />
		</div>
	</div>
</a>
