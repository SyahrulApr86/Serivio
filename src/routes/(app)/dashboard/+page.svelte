<script lang="ts">
	import { Eyebrow, TintedCard, Button } from '$lib/components/ui';
	import SeriesCard from '$lib/components/SeriesCard.svelte';
	import { formatRelative } from '$lib/utils';
	import { progressUnit } from '$lib/constants';
	let { data } = $props();

	const statCards = $derived([
		{ label: 'Watching', value: data.stats.byStatus['Watching'] ?? 0, tint: 'sky' as const },
		{ label: 'Reading', value: data.stats.byStatus['Reading'] ?? 0, tint: 'blush' as const },
		{ label: 'Completed', value: data.stats.byStatus['Completed'] ?? 0, tint: 'mint' as const },
		{ label: 'On Hold', value: data.stats.byStatus['On Hold'] ?? 0, tint: 'cream' as const }
	]);
</script>

<svelte:head><title>Dashboard · Serivio</title></svelte:head>

<div class="flex flex-col gap-12">
	<!-- Statistics -->
	<section>
		<Eyebrow>Your library</Eyebrow>
		<h1 class="mt-1 text-[35px] font-medium tracking-tight text-midnight-ink">Dashboard</h1>
		<div class="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
			{#each statCards as c (c.label)}
				<TintedCard tint={c.tint} class="!p-5">
					<p class="font-sans text-[40px] font-bold leading-none text-midnight-ink">{c.value}</p>
					<p class="mt-2 font-sans text-[14px] text-carbon-nav">{c.label}</p>
				</TintedCard>
			{/each}
		</div>
	</section>

	<!-- Continue -->
	<section>
		<div class="flex items-end justify-between">
			<div>
				<Eyebrow>Pick up where you left off</Eyebrow>
				<h2 class="mt-1 text-[26px] font-medium tracking-tight text-midnight-ink">
					Continue Watching / Reading
				</h2>
			</div>
			<a href="/library" class="font-sans text-[14px] font-medium text-accent">View all <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="inline-block"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
		</div>

		{#if data.continueList.length}
			<div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each data.continueList as s (s.id)}
					<SeriesCard series={s} />
				{/each}
			</div>
		{:else}
			<div
				class="mt-5 rounded-[7px] border border-dashed border-ash-border p-10 text-center font-sans text-[15px] text-carbon-nav"
			>
				Nothing in progress yet.
				<a href="/add" class="font-medium text-midnight-ink underline">Add your first series.</a>
			</div>
		{/if}
	</section>

	<!-- Recently Updated -->
	<section>
		<Eyebrow>Latest activity</Eyebrow>
		<h2 class="mt-1 text-[26px] font-medium tracking-tight text-midnight-ink">Recently Updated</h2>

		{#if data.recent.length}
			<div class="mt-5 divide-y divide-ash-border rounded-[7px] border border-ash-border">
				{#each data.recent as s (s.id)}
					<a
						href={`/series/${s.id}`}
						class="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-sky-wash"
					>
						<div class="h-12 w-9 shrink-0 overflow-hidden rounded bg-ash-border">
							{#if s.coverImage}
								<img src={s.coverImage} alt={s.title} class="h-full w-full object-cover" />
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate font-sans text-[15px] font-semibold text-midnight-ink">{s.title}</p>
							<p class="font-sans text-[13px] text-carbon-nav">
								{s.mediaType === 'Movie'
									? s.mediaType
									: `${progressUnit(s.mediaType)} ${s.currentProgress}`}
							</p>
						</div>
						<span class="shrink-0 font-sans text-[13px] text-carbon-nav"
							>{formatRelative(s.lastActivityAt)}</span
						>
					</a>
				{/each}
			</div>
		{:else}
			<p class="mt-5 font-sans text-[15px] text-carbon-nav">No activity yet.</p>
		{/if}
	</section>
</div>
