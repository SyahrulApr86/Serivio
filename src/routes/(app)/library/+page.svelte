<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Eyebrow, Select, Button } from '$lib/components/ui';
	import SeriesCard from '$lib/components/SeriesCard.svelte';
	import { MEDIA_TYPES, STATUSES, SORT_OPTIONS } from '$lib/constants';
	let { data } = $props();

	let q = $state(data.filters.q);
	let media = $state(data.filters.mediaType);
	let status = $state(data.filters.status);
	let sort = $state(data.filters.sort);

	function apply() {
		const p = new URLSearchParams();
		if (q.trim()) p.set('q', q.trim());
		if (media) p.set('media', media);
		if (status) p.set('status', status);
		if (sort && sort !== 'recent') p.set('sort', sort);
		goto(`/library${p.toString() ? `?${p}` : ''}`, { keepFocus: true });
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function onSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(apply, 300);
	}


	function clear() {
		q = '';
		media = '';
		status = '';
		sort = 'recent';
		goto('/library');
	}

	const hasFilters = $derived(
		!!(page.url.searchParams.get('q') || media || status || (sort && sort !== 'recent'))
	);
</script>

<svelte:head><title>Library · Serivio</title></svelte:head>

<div class="flex items-end justify-between">
	<div>
		<Eyebrow>Everything you track</Eyebrow>
		<h1 class="mt-1 text-[35px] font-medium tracking-tight text-midnight-ink">Library</h1>
	</div>
	<span class="font-sans text-[14px] text-carbon-nav">{data.list.length} series</span>
</div>

<!-- Filter bar -->
<div class="mt-6 flex flex-wrap items-end gap-3 rounded-[7px] border border-ash-border p-4">
	<form onsubmit={(e) => (e.preventDefault(), apply())} class="flex flex-1 flex-wrap items-end gap-3">
		<label class="flex min-w-[200px] flex-1 flex-col gap-1">
			<span class="font-sans text-[12px] font-medium text-carbon-nav">Search</span>
			<input
				bind:value={q}
				oninput={onSearchInput}
				placeholder="Title, alt title, tags…"
				class="rounded-[7px] border border-ash-border px-3 py-2 font-sans text-[14px] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1">
			<span class="font-sans text-[12px] font-medium text-carbon-nav">Media</span>
			<Select bind:value={media} options={MEDIA_TYPES} placeholder="All media" class="min-w-[150px]" onchange={apply} />
		</label>
		<label class="flex flex-col gap-1">
			<span class="font-sans text-[12px] font-medium text-carbon-nav">Status</span>
			<Select bind:value={status} options={STATUSES} placeholder="All status" class="min-w-[150px]" onchange={apply} />
		</label>
		<label class="flex flex-col gap-1">
			<span class="font-sans text-[12px] font-medium text-carbon-nav">Sort by</span>
			<Select bind:value={sort} options={SORT_OPTIONS} class="min-w-[160px]" onchange={apply} />
		</label>
		<Button type="submit" size="md">Apply</Button>
		{#if hasFilters}
			<button type="button" onclick={clear} class="font-sans text-[14px] text-carbon-nav hover:underline"
				>Clear</button
			>
		{/if}
	</form>
</div>

<!-- Results -->
{#if data.list.length}
	<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
		{#each data.list as s (s.id)}
			<SeriesCard series={s} />
		{/each}
	</div>
{:else}
	<div
		class="mt-6 rounded-[7px] border border-dashed border-ash-border p-12 text-center font-sans text-[15px] text-carbon-nav"
	>
		{#if hasFilters}
			No series match these filters.
		{:else}
			Your library is empty. <a href="/add" class="font-medium text-midnight-ink underline"
				>Add your first series.</a
			>
		{/if}
	</div>
{/if}
