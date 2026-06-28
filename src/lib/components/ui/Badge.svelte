<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	let { class: klass = '', children }: { class?: string; children: Snippet } = $props();
</script>

<span
	class={cn(
		'inline-flex items-center rounded-[7px] border border-ash-border bg-paper-white px-2.5 py-0.5 font-sans text-[13px] text-carbon-nav',
		klass
	)}>{@render children()}</span
>
