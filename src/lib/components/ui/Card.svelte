<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		class: klass = '',
		padding = 'p-7',
		href,
		children
	}: { class?: string; padding?: string; href?: string; children: Snippet } = $props();

	const base = cn(
		'rounded-[7px] border border-ash-border bg-paper-white',
		padding,
		href && 'block transition-colors hover:border-midnight-ink/30',
		klass
	);
</script>

{#if href}
	<a {href} class={base}>{@render children()}</a>
{:else}
	<div class={base}>{@render children()}</div>
{/if}
