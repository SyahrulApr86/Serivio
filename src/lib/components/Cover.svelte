<script lang="ts">
	import { cn } from '$lib/utils';
	let {
		src,
		title,
		class: klass = ''
	}: { src?: string | null; title: string; class?: string } = $props();

	// Deterministic pastel wash for the fallback, keyed off the title.
	const washes = ['bg-sky-wash', 'bg-blush-wash', 'bg-cream-wash', 'bg-mint-wash'];
	const wash = $derived(washes[(title.charCodeAt(0) || 0) % washes.length]);
</script>

{#if src}
	<img {src} alt={title} class={cn('h-full w-full object-cover', klass)} loading="lazy" />
{:else}
	<div class={cn('flex h-full w-full items-center justify-center', wash, klass)}>
		<span class="px-3 text-center font-serif text-[20px] font-medium text-midnight-ink/70">
			{title.slice(0, 18)}
		</span>
	</div>
{/if}
