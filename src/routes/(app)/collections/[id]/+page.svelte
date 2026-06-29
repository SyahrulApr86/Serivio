<script lang="ts">
	import { enhance } from '$app/forms';
	import { Eyebrow, Button } from '$lib/components/ui';
	import SeriesCard from '$lib/components/SeriesCard.svelte';
	let { data } = $props();
	let confirmDelete = $state(false);
</script>

<svelte:head><title>{data.collection.name} · Serivio</title></svelte:head>

<div class="flex items-end justify-between">
	<div>
		<a href="/collections" class="inline-flex items-center gap-1 font-sans text-[13px] text-carbon-nav hover:underline">
			<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
			Collections
		</a>
		<h1 class="mt-1 text-[35px] font-medium tracking-tight text-midnight-ink">
			{data.collection.name}
		</h1>
		<p class="font-sans text-[14px] text-carbon-nav">{data.list.length} series</p>
	</div>
	{#if !confirmDelete}
		<button
			onclick={() => (confirmDelete = true)}
			class="font-sans text-[13px] text-prism-pink hover:underline">Delete collection</button
		>
	{:else}
		<form method="POST" action="?/delete" use:enhance class="flex items-center gap-2">
			<span class="font-sans text-[13px] text-carbon-nav">Delete this collection?</span>
			<button class="font-sans text-[13px] font-medium text-prism-pink hover:underline">Yes</button>
			<button
				type="button"
				onclick={() => (confirmDelete = false)}
				class="font-sans text-[13px] text-carbon-nav hover:underline">No</button
			>
		</form>
	{/if}
</div>

{#if data.list.length}
	<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
		{#each data.list as s (s.id)}
			<div class="group relative">
				<SeriesCard series={s} />
				<form method="POST" action="?/remove" use:enhance class="absolute right-2 top-2">
					<input type="hidden" name="seriesId" value={s.id} />
					<button
						class="rounded-[5px] bg-paper-white/90 px-2 py-1 font-sans text-[11px] text-prism-pink opacity-0 transition-opacity group-hover:opacity-100"
						aria-label="Remove from collection">Remove</button
					>
				</form>
			</div>
		{/each}
	</div>
{:else}
	<div
		class="mt-6 rounded-[7px] border border-dashed border-ash-border p-12 text-center font-sans text-[15px] text-carbon-nav"
	>
		This collection is empty. Open any series and use “Collections” to add it here.
		<div class="mt-3"><Button href="/library" variant="ghost" size="md">Browse library</Button></div>
	</div>
{/if}
