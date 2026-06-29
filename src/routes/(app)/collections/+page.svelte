<script lang="ts">
	import { enhance } from '$app/forms';
	import { Eyebrow, Button, Input } from '$lib/components/ui';
	let { data, form } = $props();
	let name = $state('');

	const tints = ['bg-sky-wash', 'bg-blush-wash', 'bg-cream-wash', 'bg-mint-wash'];
</script>

<svelte:head><title>Collections · Serivio</title></svelte:head>

<div class="flex items-end justify-between">
	<div>
		<Eyebrow>Curate your own shelves</Eyebrow>
		<h1 class="mt-1 text-[35px] font-medium tracking-tight text-midnight-ink">Collections</h1>
	</div>
</div>

<!-- Create -->
<form
	method="POST"
	action="?/create"
	use:enhance={() => async ({ update }) => {
		name = '';
		await update();
	}}
	class="mt-6 flex items-start gap-3"
>
	<div class="flex-1">
		<Input name="name" bind:value={name} placeholder="New collection name (e.g. Weekend, Favorites)" />
		{#if form?.error}
			<p class="mt-1 font-sans text-[12px] text-danger">{form.error}</p>
		{/if}
	</div>
	<Button type="submit" size="md">Create</Button>
</form>

<!-- Grid -->
{#if data.collections.length}
	<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.collections as c, i (c.id)}
			<div class="group relative overflow-hidden rounded-[7px] border border-ash-border">
				<a href={`/collections/${c.id}`} class="block">
					<div class={`flex h-28 items-center justify-center ${tints[i % tints.length]}`}>
						<span class="font-serif text-[26px] font-medium text-midnight-ink/80">{c.name}</span>
					</div>
					<div class="flex items-center justify-between px-4 py-3">
						<span class="font-sans text-[15px] font-semibold text-midnight-ink">{c.name}</span>
						<span class="font-sans text-[13px] text-carbon-nav">{c.count} series</span>
					</div>
				</a>
				<form method="POST" action="?/delete" use:enhance class="absolute right-2 top-2">
					<input type="hidden" name="id" value={c.id} />
					<button
						class="rounded-[5px] bg-paper-white/80 px-2 py-1 font-sans text-[12px] text-danger opacity-0 transition-opacity hover:bg-paper-white group-hover:opacity-100"
						aria-label="Delete collection">Delete</button
					>
				</form>
			</div>
		{/each}
	</div>
{:else}
	<div
		class="mt-8 rounded-[7px] border border-dashed border-ash-border p-12 text-center font-sans text-[15px] text-carbon-nav"
	>
		No collections yet. Create one above to group your series.
	</div>
{/if}
