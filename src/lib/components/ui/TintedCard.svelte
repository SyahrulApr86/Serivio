<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Tint = 'cream' | 'mint' | 'blush' | 'sky';
	let {
		tint = 'sky',
		class: klass = '',
		children
	}: { tint?: Tint; class?: string; children: Snippet } = $props();

	const tints: Record<Tint, string> = {
		cream: 'bg-cream-wash border-prism-yellow/50',
		mint: 'bg-mint-wash border-prism-green/40',
		blush: 'bg-blush-wash border-prism-pink/40',
		sky: 'bg-sky-wash border-prism-blue/40'
	};
</script>

<div class={cn('rounded-[7px] border p-7', tints[tint], klass)}>{@render children()}</div>
