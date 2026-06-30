<script lang="ts">
	import { cn } from '$lib/utils';
	import type { ChatUiMessage } from '$lib/state/chat.svelte';

	let { message }: { message: ChatUiMessage } = $props();
	const isUser = $derived(message.role === 'user');
</script>

<div class={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
	<div class="flex max-w-[88%] flex-col gap-1.5">
		{#if message.imageUrls?.length}
			<div class={cn('flex flex-wrap gap-1.5', isUser ? 'justify-end' : 'justify-start')}>
				{#each message.imageUrls as url (url)}
					<img
						src={url}
						alt="attachment"
						class="h-20 w-14 rounded-[6px] border border-ash-border object-cover"
					/>
				{/each}
			</div>
		{/if}

		{#if message.actions?.length}
			<div class={cn('flex flex-wrap gap-1', isUser ? 'justify-end' : 'justify-start')}>
				{#each message.actions as a (a.name + a.summary)}
					<span
						class="inline-flex items-center gap-1 rounded-full border border-ash-border bg-sky-wash px-2 py-0.5 font-sans text-[11px] text-carbon-nav"
					>
						<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<path d="M20 6 9 17l-5-5" />
						</svg>
						{a.summary}
					</span>
				{/each}
			</div>
		{/if}

		{#if message.content || message.pending}
			<div
				class={cn(
					'whitespace-pre-wrap rounded-[10px] px-3.5 py-2.5 font-sans text-[14px] leading-relaxed',
					isUser
						? 'bg-accent text-paper-white'
						: 'border border-ash-border bg-paper-white text-midnight-ink'
				)}
			>
				{#if message.content}{message.content}{:else}<span class="text-carbon-nav">…</span>{/if}
			</div>
		{/if}
	</div>
</div>
