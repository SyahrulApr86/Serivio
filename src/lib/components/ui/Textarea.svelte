<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	let {
		class: klass = '',
		value = $bindable(),
		...rest
	}: HTMLTextareaAttributes & { class?: string } = $props();
</script>

<textarea
	bind:value
	class={cn(
		'w-full resize-y rounded-[7px] border border-ash-border bg-paper-white px-3.5 py-2.5 font-sans text-[15px] text-midnight-ink placeholder:text-carbon-nav/50 focus:border-accent focus:outline-none',
		klass
	)}
	{...rest}
></textarea>
