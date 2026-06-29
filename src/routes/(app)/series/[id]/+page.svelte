<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, StatusBadge, Badge, ProgressBar, Eyebrow } from '$lib/components/ui';
	import Cover from '$lib/components/Cover.svelte';
	import { progressUnit, isReadingMedia } from '$lib/constants';
	import { formatRelative } from '$lib/utils';
	let { data } = $props();

	const s = $derived(data.series);
	const unit = $derived(progressUnit(s.mediaType));
	let confirmDelete = $state(false);
	let showCollections = $state(false);
</script>

<svelte:head><title>{s.title} · Serivio</title></svelte:head>

<div class="mb-6">
	<Button href="/dashboard" variant="ghost" size="sm">← Dashboard</Button>
</div>

<div class="grid gap-10 lg:grid-cols-[280px_1fr]">
	<!-- Left: cover + actions -->
	<div class="flex flex-col gap-4">
		<div class="aspect-[3/4] overflow-hidden rounded-[7px] border border-ash-border bg-ash-border">
			<Cover src={s.coverImage} title={s.title} />
		</div>

		{#if s.mediaType !== 'Movie'}
			<div class="flex gap-2">
				<form method="POST" action="?/back" use:enhance class="shrink-0">
					<Button type="submit" variant="ghost" size="md" aria-label="Decrease">−</Button>
				</form>
				<form method="POST" action="?/continue" use:enhance class="flex-1">
					<Button type="submit" size="md" class="w-full">
						Continue <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="inline-block"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg> {unit}
						{s.currentProgress + 1}
					</Button>
				</form>
			</div>
		{/if}

		<div class="flex gap-2">
			<Button href={`/series/${s.id}/edit`} variant="ghost" size="md" class="flex-1">Edit</Button>
			<Button
				variant="ghost"
				size="md"
				class="flex-1"
				onclick={() => (showCollections = !showCollections)}>Collections</Button
			>
		</div>

		{#if showCollections}
			<div class="rounded-[7px] border border-ash-border p-3">
				<p class="mb-2 font-sans text-[12px] font-medium uppercase tracking-wide text-carbon-nav">
					Add to collection
				</p>
				{#if data.collections.length}
					<div class="flex flex-col gap-1">
						{#each data.collections as c (c.id)}
							<form method="POST" action="?/toggleCollection" use:enhance>
								<input type="hidden" name="collectionId" value={c.id} />
								<button
									class="flex w-full items-center justify-between rounded-[5px] px-2 py-1.5 text-left font-sans text-[14px] hover:bg-sky-wash"
								>
									<span>{c.name}</span>
									<span class={c.member ? 'text-emerald-600' : 'text-carbon-nav/40'}>
										{c.member ? '✓ added' : '+ add'}
									</span>
								</button>
							</form>
						{/each}
					</div>
				{:else}
					<p class="font-sans text-[13px] text-carbon-nav">
						No collections. <a href="/collections" class="underline">Create one.</a>
					</p>
				{/if}
			</div>
		{/if}

		<div class="mt-1">
			{#if !confirmDelete}
				<button
					onclick={() => (confirmDelete = true)}
					class="font-sans text-[13px] text-danger hover:underline">Delete series</button
				>
			{:else}
				<form method="POST" action="?/delete" use:enhance class="flex items-center gap-2">
					<span class="font-sans text-[13px] text-carbon-nav">Sure?</span>
					<button class="font-sans text-[13px] font-medium text-danger hover:underline"
						>Yes, delete</button
					>
					<button
						type="button"
						onclick={() => (confirmDelete = false)}
						class="font-sans text-[13px] text-carbon-nav hover:underline">Cancel</button
					>
				</form>
			{/if}
		</div>
	</div>

	<!-- Right: info -->
	<div class="flex flex-col gap-6">
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<Badge>{s.mediaType}</Badge>
				<StatusBadge status={s.status} />
				{#if s.rating}<Badge>★ {s.rating}</Badge>{/if}
			</div>
			<h1 class="mt-3 text-[42px] font-medium leading-tight tracking-tight text-midnight-ink">
				{s.title}
			</h1>
			{#if s.altTitle}
				<p class="mt-1 font-sans text-[16px] text-carbon-nav">{s.altTitle}</p>
			{/if}
		</div>

		<!-- Progress -->
		<div class="rounded-[7px] border border-ash-border p-5">
			<div class="flex items-end justify-between">
				<div>
					<Eyebrow>Progress</Eyebrow>
					<p class="mt-1 font-sans text-[26px] font-bold text-midnight-ink">
						{#if s.mediaType === 'Movie'}
							{s.status === 'Completed' ? 'Watched' : 'Not watched'}
						{:else}
							{unit}
							{s.currentProgress}{#if s.totalProgress}<span class="text-carbon-nav"
									> / {s.totalProgress}</span
								>{/if}
						{/if}
					</p>
				</div>
				{#if isReadingMedia(s.mediaType) && s.currentVolume}
					<p class="font-sans text-[14px] text-carbon-nav">Volume {s.currentVolume}</p>
				{/if}
			</div>
			{#if s.mediaType !== 'Movie'}
				<ProgressBar value={s.currentProgress} total={s.totalProgress} class="mt-3" />
			{/if}
		</div>

		<!-- Meta grid -->
		<div class="grid gap-4 sm:grid-cols-2">
			{#if s.author}<div>
					<Eyebrow>Author</Eyebrow><p class="mt-0.5 font-sans text-[15px]">{s.author}</p>
				</div>{/if}
			{#if s.studioPublisher}<div>
					<Eyebrow>Studio / Publisher</Eyebrow><p class="mt-0.5 font-sans text-[15px]">
						{s.studioPublisher}
					</p>
				</div>{/if}
			{#if s.releaseYear}<div>
					<Eyebrow>Release Year</Eyebrow><p class="mt-0.5 font-sans text-[15px]">{s.releaseYear}</p>
				</div>{/if}
			{#if s.genres.length}<div class="sm:col-span-2">
					<Eyebrow>Genres</Eyebrow>
					<div class="mt-1 flex flex-wrap gap-1.5">
						{#each s.genres as g (g)}<Badge>{g}</Badge>{/each}
					</div>
				</div>{/if}
			{#if s.tags.length}<div class="sm:col-span-2">
					<Eyebrow>Tags</Eyebrow>
					<div class="mt-1 flex flex-wrap gap-1.5">
						{#each s.tags as t (t)}<Badge>#{t}</Badge>{/each}
					</div>
				</div>{/if}
		</div>

		{#if s.description}
			<div>
				<Eyebrow>Description</Eyebrow>
				<p class="mt-1 font-sans text-[15px] leading-relaxed text-midnight-ink/90">
					{s.description}
				</p>
			</div>
		{/if}

		{#if s.notes}
			<div class="rounded-[7px] bg-cream-wash p-4">
				<Eyebrow>Notes</Eyebrow>
				<p class="mt-1 font-sans text-[15px] text-midnight-ink/90">{s.notes}</p>
			</div>
		{/if}

		<!-- History -->
		<div>
			<Eyebrow>History</Eyebrow>
			{#if data.history.length}
				<ul class="mt-2 divide-y divide-ash-border rounded-[7px] border border-ash-border">
					{#each data.history as h (h.id)}
						<li class="flex items-center justify-between px-4 py-2.5">
							<span class="font-sans text-[14px] text-midnight-ink">
								{#if h.kind === 'progress'}
									{unit}
									{h.toValue}{#if h.fromValue != null}<span class="text-carbon-nav/60"
											> (from {h.fromValue})</span
										>{/if}
								{:else if h.kind === 'status'}
									{h.note}
								{:else}
									Added to library
								{/if}
							</span>
							<span class="font-sans text-[13px] text-carbon-nav">{formatRelative(h.createdAt)}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-1 font-sans text-[14px] text-carbon-nav">No history yet.</p>
			{/if}
		</div>
	</div>
</div>
