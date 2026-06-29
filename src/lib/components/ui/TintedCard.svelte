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
		cream: 'bg-cream-wash border-amber-200',
		mint: 'bg-mint-wash border-emerald-200',
		blush: 'bg-blush-wash border-rose-200',
		sky: 'bg-sky-wash border-sky-200'
	};
</script>

<div class={cn('rounded-[7px] border p-7', tints[tint], klass)}>{@render children()}</div>
