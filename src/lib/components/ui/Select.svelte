<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	let {
		class: klass = '',
		value = $bindable(),
		options,
		placeholder,
		...rest
	}: HTMLSelectAttributes & {
		class?: string;
		options: readonly (string | { value: string; label: string })[];
		placeholder?: string;
	} = $props();

	const norm = $derived(
		options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
	);
</script>

<select
	bind:value
	class={cn(
		'w-full appearance-none rounded-[7px] border border-ash-border bg-paper-white bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20d=%27M3%205l3%203%203-3%27%20stroke=%27%23222%27%20fill=%27none%27%20stroke-width=%271.5%27/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat px-3.5 py-2.5 pr-9 font-sans text-[15px] text-midnight-ink focus:border-accent focus:outline-none',
		klass
	)}
	{...rest}
>
	{#if placeholder}
		<option value="" disabled selected={!value}>{placeholder}</option>
	{/if}
	{#each norm as o (o.value)}
		<option value={o.value}>{o.label}</option>
	{/each}
</select>
