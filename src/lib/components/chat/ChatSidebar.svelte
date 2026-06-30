<script lang="ts">
	import { chat, type AiProviderName } from '$lib/state/chat.svelte';
	import { cn } from '$lib/utils';
	import MessageBubble from './MessageBubble.svelte';
	import Composer from './Composer.svelte';

	let scroller: HTMLDivElement | undefined = $state();

	// Restore the preferred provider once on the client.
	$effect(() => {
		const saved = localStorage.getItem('serivio:ai-provider');
		if (saved === 'gpt' || saved === 'deepseek') chat.provider = saved;
	});

	function setProvider(e: Event) {
		const v = (e.target as HTMLSelectElement).value as AiProviderName;
		chat.provider = v;
		localStorage.setItem('serivio:ai-provider', v);
	}

	// Auto-scroll to newest content as messages stream in.
	$effect(() => {
		// reference reactive bits so the effect re-runs as they change
		void chat.messages.length;
		void chat.messages.at(-1)?.content;
		if (scroller) scroller.scrollTop = scroller.scrollHeight;
	});
</script>

{#if chat.open}
	<button
		type="button"
		aria-label="Close chat"
		class="fixed inset-0 z-40 bg-midnight-ink/20 md:hidden"
		onclick={() => (chat.open = false)}
	></button>
{/if}

<aside
	class={cn(
		'fixed right-0 top-0 z-50 flex h-screen w-[min(400px,100vw)] flex-col border-l border-ash-border bg-paper-white shadow-xl transition-transform duration-300 ease-out',
		chat.open ? 'translate-x-0' : 'translate-x-full'
	)}
	aria-hidden={!chat.open}
>
	<header class="flex items-center gap-2 border-b border-ash-border px-4 py-3">
		<div class="flex items-center gap-2">
			<span class="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-paper-white">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
					<path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
				</svg>
			</span>
			<h2 class="font-serif text-[16px] text-midnight-ink">Assistant</h2>
		</div>

		<div class="ml-auto flex items-center gap-2">
			<select
				value={chat.provider}
				onchange={setProvider}
				class="rounded-[6px] border border-ash-border bg-paper-white px-2 py-1 font-sans text-[12px] text-carbon-nav focus:border-accent focus:outline-none"
			>
				<option value="gpt">GPT</option>
				<option value="deepseek">DeepSeek</option>
			</select>
			<button
				type="button"
				onclick={() => (chat.open = false)}
				class="flex h-8 w-8 items-center justify-center rounded-[7px] text-carbon-nav hover:bg-sky-wash"
				aria-label="Close"
			>
				<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
	</header>

	<div bind:this={scroller} class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
		{#if chat.messages.length === 0}
			<div class="mt-10 px-2 text-center font-sans text-[13px] leading-relaxed text-carbon-nav">
				<p class="mb-2 font-medium text-midnight-ink">Halo! 👋</p>
				<p>Tanya soal library-mu, atau minta aku menambah/ubah series — bisa juga lampirkan poster.</p>
			</div>
		{/if}
		{#each chat.messages as message, i (i)}
			<MessageBubble {message} />
		{/each}
	</div>

	<Composer />
</aside>
