<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type Variant = 'primary' | 'ghost' | 'soft';
	type Size = 'sm' | 'md' | 'lg';

	type Props = {
		variant?: Variant;
		size?: Size;
		href?: string;
		class?: string;
		children: Snippet;
	} & HTMLButtonAttributes &
		HTMLAnchorAttributes;

	let {
		variant = 'primary',
		size = 'md',
		href,
		class: klass = '',
		children,
		...rest
	}: Props = $props();

	const base =
		'inline-flex items-center justify-center gap-2 rounded-[7px] font-sans font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap';

	const variants: Record<Variant, string> = {
		primary: 'bg-midnight-ink text-paper-white hover:bg-midnight-ink/90 border border-transparent',
		ghost: 'bg-transparent text-midnight-ink border border-ash-border hover:border-midnight-ink',
		soft: 'bg-paper-white text-midnight-ink border border-ash-border hover:bg-sky-wash'
	};

	const sizes: Record<Size, string> = {
		sm: 'text-[13px] px-3 py-1.5',
		md: 'text-[14px] px-7 py-[11px]',
		lg: 'text-[16px] px-8 py-3.5'
	};

	const classes = $derived(cn(base, variants[variant], sizes[size], klass));
</script>

{#if href}
	<a {href} class={classes} {...rest}>{@render children()}</a>
{:else}
	<button class={classes} {...rest}>{@render children()}</button>
{/if}
