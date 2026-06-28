<script lang="ts">
	import { statusAccent, type Status } from '$lib/constants';
	import { cn } from '$lib/utils';
	let { status, class: klass = '' }: { status: Status; class?: string } = $props();
	const a = $derived(statusAccent(status));
</script>

<span
	class={cn(
		'inline-flex items-center gap-1.5 rounded-[7px] border px-2.5 py-1 font-sans text-[12px] font-medium',
		a.wash,
		a.border,
		a.text,
		klass
	)}
>
	<span class={cn('h-1.5 w-1.5 rounded-full', a.dot)}></span>
	{status}
</span>
