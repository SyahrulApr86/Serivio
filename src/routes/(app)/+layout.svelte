<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import ChatSidebar from '$lib/components/chat/ChatSidebar.svelte';
	import { chat } from '$lib/state/chat.svelte';

	let { data, children } = $props();

	chat.hydrate(data.chat.conversationId, data.chat.messages);
</script>

<Nav username={data.user.username} seriesIndex={data.seriesIndex} />

<main class="mx-auto max-w-[1200px] px-5 py-8">
	{@render children()}
</main>

<ChatSidebar />
