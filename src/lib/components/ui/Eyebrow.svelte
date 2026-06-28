<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	let { class: klass = '', children }: { class?: string; children: Snippet } = $props();
</script>

<span
	class={cn(
		'font-sans text-[11px] font-medium uppercase tracking-[0.06em] text-carbon-nav',
		klass
	)}>{@render children()}</span
>
