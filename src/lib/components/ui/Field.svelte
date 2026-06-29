<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		label,
		error,
		hint,
		required = false,
		children
	}: {
		label: string;
		error?: string | string[];
		hint?: string;
		required?: boolean;
		children: Snippet;
	} = $props();

	const errText = $derived(Array.isArray(error) ? error[0] : error);
</script>

<label class="flex flex-col gap-1.5">
	<span class="font-sans text-[13px] font-medium text-midnight-ink">
		{label}{#if required}<span class="text-danger">*</span>{/if}
	</span>
	{@render children()}
	{#if errText}
		<span class="font-sans text-[12px] text-danger">{errText}</span>
	{:else if hint}
		<span class="font-sans text-[12px] text-carbon-nav">{hint}</span>
	{/if}
</label>
