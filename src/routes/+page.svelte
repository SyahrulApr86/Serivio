<script lang="ts">
	import { Logo, Button, Eyebrow, Badge } from '$lib/components/ui';
	import { MEDIA_TYPES } from '$lib/constants';

	const features = [
		{
			icon: '◷',
			title: 'Never lose your place',
			body: 'One tap on Continue bumps your episode or chapter and timestamps it. Pick up exactly where you stopped.',
			bullets: ['Auto-increment progress', 'Per-media counters', 'Full history log']
		},
		{
			icon: '▦',
			title: 'Every medium, one shelf',
			body: 'Anime, manga, manhwa, novels, films, TV — track them side by side instead of across a dozen apps.',
			bullets: ['11 media types', 'Episodes, chapters, pages', 'Seasons & volumes']
		},
		{
			icon: '✦',
			title: 'Find anything instantly',
			body: 'Fuzzy search across titles, alternative titles and tags, powered by Elasticsearch.',
			bullets: ['Typo-tolerant search', 'Filter by media & status', 'Sort six ways']
		},
		{
			icon: '❏',
			title: 'Collections your way',
			body: 'Group series into shelves like Favorites, Weekend or Comedy — whatever fits your taste.',
			bullets: ['Unlimited collections', 'Drag-free membership', 'Quick add from detail']
		}
	];

	const chaos = [
		'What episode was I on?',
		'Notes app',
		'Browser bookmarks',
		'Ch. 1158?',
		'Spreadsheet',
		'Sticky note',
		'“Continue” where?',
		'5 different apps',
		'Did I finish this?'
	];
</script>

<svelte:head>
	<title>Serivio — Track every story, never lose your place</title>
	<meta
		name="description"
		content="Serivio is a personal media tracker for anime, manga, novels, films and more. Keep every series and its progress in one luminous place."
	/>
</svelte:head>

<!-- Top nav -->
<header class="border-b border-ash-border">
	<div class="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5">
		<Logo />
		<nav class="hidden items-center gap-7 md:flex">
			<a href="#features" class="font-sans text-[14px] font-medium text-carbon-nav hover:text-midnight-ink"
				>Features</a
			>
			<a href="#media" class="font-sans text-[14px] font-medium text-carbon-nav hover:text-midnight-ink"
				>Supported media</a
			>
			<a href="#compare" class="font-sans text-[14px] font-medium text-carbon-nav hover:text-midnight-ink"
				>Why Serivio</a
			>
		</nav>
		<div class="flex items-center gap-2">
			<Button href="/login" variant="ghost" size="sm">Sign in</Button>
			<Button href="/register" size="sm">Get started</Button>
		</div>
	</div>
</header>

<main class="mx-auto max-w-[1200px] px-5">
	<!-- Hero -->
	<section class="relative overflow-hidden py-24 text-center">
		<div
			class="pointer-events-none absolute left-1/2 top-10 -z-10 h-[460px] w-[460px] -translate-x-1/2 rotate-45 rounded-[80px] opacity-30 blur-2xl prism-gradient"
		></div>
		<div class="mx-auto flex max-w-3xl flex-col items-center">
			<Eyebrow>Personal media tracker</Eyebrow>
			<h1
				class="mt-4 font-serif text-[52px] font-medium leading-[1.05] tracking-tight text-midnight-ink sm:text-[68px]"
			>
				Track every story,<br />never lose your <span class="prism-text">place</span>.
			</h1>
			<p class="mt-6 max-w-xl font-sans text-[18px] leading-relaxed text-carbon-nav">
				Stop scattering your progress across Netflix, Crunchyroll and a dozen reader apps. Serivio
				keeps every series — and exactly where you left off — in one luminous place.
			</p>
			<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
				<Button href="/register" size="lg">Start tracking — it’s free</Button>
				<Button href="/login" variant="ghost" size="lg">I already have an account</Button>
			</div>

			<!-- Prism diamond graphic -->
			<div class="mt-16">
				<svg width="160" height="160" viewBox="0 0 160 160" fill="none" aria-hidden="true">
					<defs>
						<linearGradient id="hero-prism" x1="0" y1="0" x2="160" y2="160">
							<stop stop-color="#f75cc3" />
							<stop offset="0.35" stop-color="#2969ff" />
							<stop offset="0.7" stop-color="#ffd363" />
							<stop offset="1" stop-color="#5ab040" />
						</linearGradient>
					</defs>
					<path d="M80 8 152 80 80 152 8 80 80 8Z" fill="url(#hero-prism)" />
					<path d="M80 8 152 80 80 152 8 80 80 8Z" fill="white" fill-opacity="0.15" />
					<path d="M80 8 80 152M8 80 152 80" stroke="white" stroke-opacity="0.35" />
				</svg>
			</div>
		</div>
	</section>

	<!-- Media strip -->
	<section id="media" class="border-y border-ash-border py-12">
		<p class="text-center">
			<Eyebrow>Tracks everything you follow</Eyebrow>
		</p>
		<div class="mt-5 flex flex-wrap items-center justify-center gap-2.5">
			{#each MEDIA_TYPES as m (m)}
				<Badge class="!text-[14px]">{m}</Badge>
			{/each}
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="py-24">
		<div class="text-center">
			<Eyebrow>We do the heavy lifting</Eyebrow>
			<h2 class="mt-2 font-serif text-[42px] font-medium tracking-tight text-midnight-ink">
				Built for people who follow a lot
			</h2>
		</div>
		<div class="mt-12 grid gap-5 md:grid-cols-2">
			{#each features as f (f.title)}
				<div class="rounded-[24.5px] border border-ash-border p-7">
					<div
						class="flex h-11 w-11 items-center justify-center rounded-[7px] bg-sky-wash text-[20px] text-midnight-ink"
					>
						{f.icon}
					</div>
					<h3 class="mt-4 font-serif text-[24px] font-medium text-midnight-ink">{f.title}</h3>
					<p class="mt-2 font-sans text-[15px] leading-relaxed text-carbon-nav">{f.body}</p>
					<ul class="mt-4 flex flex-col gap-1.5">
						{#each f.bullets as b (b)}
							<li class="flex items-center gap-2 font-sans text-[14px] text-midnight-ink">
								<span class="h-1.5 w-1.5 rounded-full prism-gradient"></span>{b}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<!-- Comparison split -->
	<section id="compare" class="grid overflow-hidden rounded-[24.5px] border border-ash-border md:grid-cols-2">
		<!-- Chaos -->
		<div class="relative min-h-[360px] bg-paper-white p-10">
			<Eyebrow>Before Serivio</Eyebrow>
			<h3 class="mt-2 font-serif text-[28px] font-medium text-midnight-ink">The struggle</h3>
			<div class="relative mt-6 h-[220px]">
				{#each chaos as c, i (c)}
					<span
						class="absolute rounded-[7px] border border-ash-border bg-paper-white px-3 py-1.5 font-sans text-[13px] text-carbon-nav shadow-sm"
						style={`top:${(i * 37) % 180}px; left:${(i * 53) % 60}%; transform: rotate(${(i % 5) - 2}deg)`}
					>
						{c}
					</span>
				{/each}
			</div>
		</div>
		<!-- Clarity -->
		<div class="relative min-h-[360px] p-10 text-paper-white prism-gradient">
			<div class="absolute inset-0 bg-midnight-ink/10"></div>
			<div class="relative">
				<span class="font-sans text-[11px] font-medium uppercase tracking-[0.06em] text-paper-white/80"
					>With Serivio</span
				>
				<h3 class="mt-2 font-serif text-[28px] font-medium">One calm, complete view</h3>
				<ul class="mt-6 flex flex-col gap-3">
					{#each ['Every series in one library', 'Progress updated in a tap', 'Search & filter in milliseconds', 'Statistics that actually motivate'] as point (point)}
						<li class="flex items-center gap-3 font-sans text-[16px]">
							<span class="flex h-6 w-6 items-center justify-center rounded-full bg-paper-white/25"
								>✓</span
							>
							{point}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="py-24 text-center">
		<h2 class="font-serif text-[42px] font-medium tracking-tight text-midnight-ink">
			Your collection, finally in order.
		</h2>
		<p class="mx-auto mt-4 max-w-md font-sans text-[17px] text-carbon-nav">
			Create a free account and add your first series in under a minute.
		</p>
		<div class="mt-8">
			<Button href="/register" size="lg">Get started</Button>
		</div>
	</section>
</main>

<footer class="border-t border-ash-border py-10">
	<div
		class="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-5 sm:flex-row"
	>
		<Logo size={22} />
		<p class="font-sans text-[13px] text-carbon-nav">
			Serivio — Track every story, never lose your place.
		</p>
	</div>
</footer>
