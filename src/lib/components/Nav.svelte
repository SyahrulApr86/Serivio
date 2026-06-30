<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import Logo from './ui/Logo.svelte';
	import { cn } from '$lib/utils';
	import { chat } from '$lib/state/chat.svelte';

	type SeriesItem = { id: string; title: string; altTitle: string | null; coverImage: string | null; mediaType: string; status: string };

	let { username, seriesIndex = [] }: { username: string; seriesIndex?: SeriesItem[] } = $props();

	const links = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/library', label: 'Library' },
		{ href: '/collections', label: 'Collections' },
		{ href: '/stats', label: 'Statistics' }
	];

	let q = $state('');
	let focused = $state(false);
	let activeIdx = $state(-1);
	let inputEl: HTMLInputElement;

	const results = $derived.by(() => {
		const term = q.trim().toLowerCase();
		if (!term) return [];
		return seriesIndex
			.filter((s) =>
				s.title.toLowerCase().includes(term) ||
				(s.altTitle ?? '').toLowerCase().includes(term)
			)
			.slice(0, 8);
	});

	const open = $derived(focused && results.length > 0);

	function onKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, results.length - 1); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, -1); }
		else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); pick(results[activeIdx]); }
		else if (e.key === 'Escape') { q = ''; inputEl?.blur(); }
	}

	function pick(s: SeriesItem) {
		q = '';
		focused = false;
		activeIdx = -1;
		goto(`/series/${s.id}`);
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

		<!-- Search with instant dropdown -->
		<div class="relative ml-auto hidden flex-1 justify-end sm:flex">
			<div class="relative w-full max-w-xs">
				<input
					bind:this={inputEl}
					bind:value={q}
					onfocus={() => { focused = true; activeIdx = -1; }}
					onblur={() => setTimeout(() => { focused = false; activeIdx = -1; }, 150)}
					onkeydown={onKeydown}
					placeholder="Search title, tags…"
					autocomplete="off"
					class="w-full rounded-[7px] border border-ash-border bg-paper-white px-3.5 py-2 font-sans text-[14px] focus:border-accent focus:outline-none"
				/>

				{#if open}
					<div class="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-[7px] border border-ash-border bg-paper-white shadow-lg">
						{#each results as s, i (s.id)}
							<button
								type="button"
								onmousedown={() => pick(s)}
								class={cn(
									'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
									i === activeIdx ? 'bg-sky-wash' : 'hover:bg-sky-wash'
								)}
							>
								<div class="h-9 w-6 shrink-0 overflow-hidden rounded-[3px] bg-ash-border">
									{#if s.coverImage}
										<img src={s.coverImage} alt={s.title} class="h-full w-full object-cover" />
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate font-sans text-[14px] font-medium text-midnight-ink">{s.title}</p>
									<p class="font-sans text-[11px] text-carbon-nav">{s.mediaType} · {s.status}</p>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => chat.toggle()}
				class="flex h-9 w-9 items-center justify-center rounded-[7px] border border-ash-border text-carbon-nav hover:bg-sky-wash"
				aria-label="Toggle assistant"
				title="Assistant"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
					<path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
				</svg>
			</button>
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
