<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import Logo from './ui/Logo.svelte';
	import { cn } from '$lib/utils';

	let { username }: { username: string } = $props();

	const links = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/library', label: 'Library' },
		{ href: '/collections', label: 'Collections' },
		{ href: '/stats', label: 'Statistics' }
	];

	let q = $state('');

	function submitSearch(e: Event) {
		e.preventDefault();
		if (q.trim()) goto(`/library?q=${encodeURIComponent(q.trim())}`);
	}

	async function logout() {
		await authClient.signOut();
		goto('/');
	}

	const active = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(href + '/');
</script>

<header class="sticky top-0 z-40 border-b border-ash-border bg-paper-white/90 backdrop-blur">
	<div class="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5">
		<a href="/" aria-label="Serivio home"><Logo /></a>

		<nav class="hidden items-center gap-1 md:flex">
			{#each links as l (l.href)}
				<a
					href={l.href}
					class={cn(
						'rounded-[7px] px-3 py-1.5 font-sans text-[14px] font-medium transition-colors',
						active(l.href)
							? 'bg-midnight-ink text-paper-white'
							: 'text-carbon-nav hover:bg-sky-wash'
					)}>{l.label}</a
				>
			{/each}
		</nav>

		<form onsubmit={submitSearch} class="ml-auto hidden flex-1 justify-end sm:flex">
			<input
				bind:value={q}
				placeholder="Search title, tags…"
				class="w-full max-w-xs rounded-[7px] border border-ash-border bg-paper-white px-3.5 py-2 font-sans text-[14px] focus:border-accent focus:outline-none"
			/>
		</form>

		<div class="flex items-center gap-2">
			<a
				href="/add"
				class="rounded-[7px] bg-midnight-ink px-4 py-2 font-sans text-[14px] font-medium text-paper-white hover:bg-midnight-ink/90"
				>+ Add</a
			>
			<div class="group relative">
				<button
					class="flex h-9 w-9 items-center justify-center rounded-full border border-ash-border font-sans text-[14px] font-semibold text-midnight-ink"
					aria-label="Account menu"
				>
					{username.slice(0, 1).toUpperCase()}
				</button>
				<div
					class="invisible absolute right-0 top-full z-50 mt-1 w-48 min-w-max rounded-[7px] border border-ash-border bg-paper-white p-1 opacity-0 shadow-sm transition-all group-hover:visible group-hover:opacity-100"
				>
					<div class="px-3 py-2 font-sans text-[13px] text-carbon-nav">@{username}</div>
					<button
						onclick={logout}
						class="w-full whitespace-nowrap rounded-[5px] px-3 py-2 text-left font-sans text-[14px] text-midnight-ink hover:bg-blush-wash"
						>Sign out</button
					>
				</div>
			</div>
		</div>
	</div>
</header>
