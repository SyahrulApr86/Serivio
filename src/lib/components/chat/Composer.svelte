<script lang="ts">
	import { chat, type ChatUiMessage, type ToolAction } from '$lib/state/chat.svelte';

	let text = $state('');
	let files = $state<File[]>([]);
	let previews = $state<string[]>([]);
	let fileInput: HTMLInputElement;

	function onPick(e: Event) {
		const picked = Array.from((e.target as HTMLInputElement).files ?? []);
		for (const f of picked) {
			files.push(f);
			previews.push(URL.createObjectURL(f));
		}
		(e.target as HTMLInputElement).value = '';
	}

	function removeFile(i: number) {
		URL.revokeObjectURL(previews[i]);
		files.splice(i, 1);
		previews.splice(i, 1);
	}

	async function uploadAll(): Promise<string[]> {
		const urls: string[] = [];
		for (const file of files) {
			const fd = new FormData();
			fd.append('file', file);
			const res = await fetch('/api/upload-cover', { method: 'POST', body: fd });
			if (res.ok) urls.push((await res.json()).url);
		}
		return urls;
	}

	/** Parses an SSE stream into {event, data} records. */
	async function* readSse(body: ReadableStream<Uint8Array>) {
		const reader = body.getReader();
		const decoder = new TextDecoder();
		let buf = '';
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			buf += decoder.decode(value, { stream: true });
			let idx;
			while ((idx = buf.indexOf('\n\n')) !== -1) {
				const block = buf.slice(0, idx);
				buf = buf.slice(idx + 2);
				let event = 'message';
				let data = '';
				for (const line of block.split('\n')) {
					if (line.startsWith('event:')) event = line.slice(6).trim();
					else if (line.startsWith('data:')) data += line.slice(5).trim();
				}
				if (data) yield { event, data: JSON.parse(data) };
			}
		}
	}

	async function send() {
		if (chat.sending) return;
		const content = text.trim();
		if (!content && files.length === 0) return;

		chat.sending = true;
		const imageUrls = await uploadAll();

		const userMsg: ChatUiMessage = { role: 'user', content, imageUrls };
		chat.messages.push(userMsg);
		chat.messages.push({ role: 'assistant', content: '', actions: [], pending: true });

		text = '';
		for (const u of previews) URL.revokeObjectURL(u);
		files = [];
		previews = [];

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					conversationId: chat.conversationId,
					message: content,
					imageUrls,
					provider: chat.provider
				})
			});
			if (!res.ok || !res.body) throw new Error(await res.text());

			for await (const { event, data } of readSse(res.body)) {
				const last = chat.messages.at(-1)!;
				if (event === 'meta') chat.conversationId = data.conversationId;
				else if (event === 'tool') (last.actions ??= []).push(data as ToolAction);
				else if (event === 'delta') last.content += data.text;
				else if (event === 'error') last.content += `\n⚠️ ${data.message}`;
				else if (event === 'done') chat.conversationId = data.conversationId;
			}
		} catch (e) {
			const last = chat.messages.at(-1);
			if (last) last.content += `\n⚠️ ${String(e)}`;
		} finally {
			const last = chat.messages.at(-1);
			if (last) last.pending = false;
			chat.sending = false;
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<div class="border-t border-ash-border p-3">
	{#if previews.length}
		<div class="mb-2 flex flex-wrap gap-1.5">
			{#each previews as src, i (src)}
				<div class="relative">
					<img {src} alt="preview" class="h-14 w-10 rounded-[5px] border border-ash-border object-cover" />
					<button
						type="button"
						onclick={() => removeFile(i)}
						class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-midnight-ink text-[10px] text-paper-white"
						aria-label="Remove">×</button
					>
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex items-end gap-2">
		<input bind:this={fileInput} type="file" accept="image/*" multiple class="hidden" onchange={onPick} />
		<button
			type="button"
			onclick={() => fileInput.click()}
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-ash-border text-carbon-nav hover:bg-sky-wash"
			aria-label="Attach image"
		>
			<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<path d="m17 8-5-5-5 5" /><path d="M12 3v12" />
			</svg>
		</button>

		<textarea
			bind:value={text}
			onkeydown={onKeydown}
			rows="1"
			placeholder="Tanya atau minta apa saja…"
			class="max-h-32 min-h-9 flex-1 resize-none rounded-[7px] border border-ash-border bg-paper-white px-3 py-2 font-sans text-[14px] focus:border-accent focus:outline-none"
		></textarea>

		<button
			type="button"
			onclick={send}
			disabled={chat.sending}
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-accent text-paper-white disabled:opacity-50"
			aria-label="Send"
		>
			<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
			</svg>
		</button>
	</div>
</div>
