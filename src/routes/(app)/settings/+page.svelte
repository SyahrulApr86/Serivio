<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { Card, Button, Input, Eyebrow, Badge } from '$lib/components/ui';

	let { data, form } = $props();

	// Best-effort hint: MCP runs on its own port (default 3001) alongside the app.
	const mcpUrl = $derived(
		browser ? `${location.origin.replace(/:\d+$/, '')}:3001/mcp` : 'http://YOUR_HOST:3001/mcp'
	);
</script>

<div class="space-y-8">
	<header>
		<Eyebrow>Settings</Eyebrow>
		<h1 class="font-serif text-display text-midnight-ink">API Access &amp; MCP</h1>
		<p class="mt-1 font-sans text-body-sm text-carbon-nav">
			Generate a token to connect external MCP clients (Claude Code, Codex) to your Serivio
			library.
		</p>
	</header>

	{#if form?.token}
		<Card class="border-accent/40 bg-sky-wash">
			<p class="font-sans text-body-sm font-medium text-midnight-ink">
				Token “{form.name}” created — copy it now, it won't be shown again:
			</p>
			<code
				class="mt-2 block w-full overflow-x-auto rounded-[7px] border border-ash-border bg-paper-white px-3 py-2 font-mono text-[13px] text-midnight-ink"
				>{form.token}</code
			>
		</Card>
	{/if}

	<Card>
		<h2 class="font-serif text-[18px] text-midnight-ink">Create token</h2>
		<form method="POST" action="?/create" use:enhance class="mt-3 flex items-end gap-2">
			<div class="flex-1">
				<Input name="name" placeholder="e.g. Claude Code laptop" required />
			</div>
			<Button type="submit">Generate</Button>
		</form>
		{#if form?.error}
			<p class="mt-2 font-sans text-[13px] text-danger">{form.error}</p>
		{/if}
	</Card>

	<Card>
		<h2 class="font-serif text-[18px] text-midnight-ink">Your tokens</h2>
		{#if data.tokens.length === 0}
			<p class="mt-2 font-sans text-body-sm text-carbon-nav">No tokens yet.</p>
		{:else}
			<ul class="mt-3 divide-y divide-ash-border">
				{#each data.tokens as t (t.id)}
					<li class="flex items-center gap-3 py-3">
						<div class="min-w-0 flex-1">
							<p class="truncate font-sans text-[14px] font-medium text-midnight-ink">{t.name}</p>
							<p class="font-sans text-[12px] text-carbon-nav">
								Created {new Date(t.createdAt).toLocaleDateString()}
								{#if t.lastUsedAt}· last used {new Date(t.lastUsedAt).toLocaleDateString()}{/if}
							</p>
						</div>
						<form method="POST" action="?/revoke" use:enhance>
							<input type="hidden" name="id" value={t.id} />
							<Button type="submit" variant="ghost" size="sm">Revoke</Button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</Card>

	<Card>
		<h2 class="font-serif text-[18px] text-midnight-ink">Connect a client</h2>
		<p class="mt-2 font-sans text-body-sm text-carbon-nav">
			Add Serivio as a remote MCP server (Streamable HTTP) using your token:
		</p>
		<div class="mt-3 space-y-2 font-sans text-[13px] text-carbon-nav">
			<div class="flex items-center gap-2">
				<Badge>URL</Badge>
				<code class="rounded-[5px] bg-sky-wash px-2 py-1 font-mono text-[12px]">{mcpUrl}</code>
			</div>
			<div class="flex items-center gap-2">
				<Badge>Header</Badge>
				<code class="rounded-[5px] bg-sky-wash px-2 py-1 font-mono text-[12px]"
					>Authorization: Bearer &lt;your-token&gt;</code
				>
			</div>
		</div>
		<p class="mt-3 font-sans text-[12px] text-carbon-nav">
			Claude Code: <code class="font-mono">claude mcp add --transport http serivio {mcpUrl} --header "Authorization: Bearer &lt;token&gt;"</code>
		</p>
	</Card>
</div>
