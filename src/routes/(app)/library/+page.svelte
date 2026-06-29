<script lang="ts">
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { Eyebrow, Select } from '$lib/components/ui';
	import SeriesCard from '$lib/components/SeriesCard.svelte';
	import { MEDIA_TYPES, STATUSES, SORT_OPTIONS } from '$lib/constants';
	import type { Series } from '$lib/server/db/schema';

	let { data } = $props();

	let q = $state('');
	let media = $state('');
	let status = $state('');
	let sort = $state('recent');

	const filtered = $derived.by(() => {
		const term = q.trim().toLowerCase();
		let result: Series[] = data.list;

		if (term) {
			result = result.filter((s) =>
				s.title.toLowerCase().includes(term) ||
				(s.altTitle ?? '').toLowerCase().includes(term) ||
				s.tags.some((t) => t.toLowerCase().includes(term)) ||
				s.genres.some((g) => g.toLowerCase().includes(term))
			);
		}
		if (media) result = result.filter((s) => s.mediaType === media);
		if (status) result = result.filter((s) => s.status === status);

		return [...result].sort((a, b) => {
			switch (sort) {
				case 'alpha':    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
				case 'rating':   return (b.rating ?? -1) - (a.rating ?? -1);
				case 'progress': return b.currentProgress - a.currentProgress;
				case 'opened':
					return new Date(b.lastOpenedAt ?? b.lastActivityAt).getTime()
						 - new Date(a.lastOpenedAt ?? a.lastActivityAt).getTime();
				default:         // recent
					return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
			}
		});
	});

	const hasFilters = $derived(!!(q || media || status || sort !== 'recent'));

	function clear() { q = ''; media = ''; status = ''; sort = 'recent'; }
</script>

<svelte:head><title>Library · Serivio</title></svelte:head>

<div class="flex items-end justify-between">
	<div>
		<Eyebrow>Everything you track</Eyebrow>
		<h1 class="mt-1 text-[35px] font-medium tracking-tight text-midnight-ink">Library</h1>
	</div>
	<span class="font-sans text-[14px] text-carbon-nav">{filtered.length} series</span>
</div>

<!-- Filter bar -->
<div class="mt-6 flex flex-wrap items-end gap-3 rounded-[7px] border border-ash-border p-4">
	<label class="flex min-w-[200px] flex-1 flex-col gap-1">
		<span class="font-sans text-[12px] font-medium text-carbon-nav">Search</span>
		<input
			bind:value={q}
			placeholder="Title, alt title, tags…"
			class="rounded-[7px] border border-ash-border px-3 py-2 font-sans text-[14px] focus:border-accent focus:outline-none"
		/>
	</label>
	<label class="flex flex-col gap-1">
		<span class="font-sans text-[12px] font-medium text-carbon-nav">Media</span>
		<Select bind:value={media} options={MEDIA_TYPES} placeholder="All media" class="min-w-[150px]" />
	</label>
	<label class="flex flex-col gap-1">
		<span class="font-sans text-[12px] font-medium text-carbon-nav">Status</span>
		<Select bind:value={status} options={STATUSES} placeholder="All status" class="min-w-[150px]" />
	</label>
	<label class="flex flex-col gap-1">
		<span class="font-sans text-[12px] font-medium text-carbon-nav">Sort by</span>
		<Select bind:value={sort} options={SORT_OPTIONS} class="min-w-[160px]" />
	</label>
	{#if hasFilters}
		<button onclick={clear} class="font-sans text-[14px] text-carbon-nav hover:underline">Clear</button>
	{/if}
</div>

<!-- Results -->
{#if filtered.length}
	<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
		{#each filtered as s (s.id)}
			<div animate:flip={{ duration: 250 }} in:fade={{ duration: 150 }} out:fade={{ duration: 100 }}>
				<SeriesCard series={s} />
			</div>
		{/each}
	</div>
{:else}
	<div
		transition:fade={{ duration: 150 }}
		class="mt-6 rounded-[7px] border border-dashed border-ash-border p-12 text-center font-sans text-[15px] text-carbon-nav"
	>
		{#if hasFilters}
			No series match these filters.
		{:else}
			Your library is empty. <a href="/add" class="font-medium text-midnight-ink underline">Add your first series.</a>
		{/if}
	</div>
{/if}
