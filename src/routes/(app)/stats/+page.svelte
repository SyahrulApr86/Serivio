<script lang="ts">
	import { Eyebrow, TintedCard, StatusBadge } from '$lib/components/ui';
	import { STATUSES, MEDIA_TYPES, type Status } from '$lib/constants';
	let { data } = $props();

	const totalStatuses = $derived(
		STATUSES.map((s) => ({ status: s as Status, count: data.stats.byStatus[s] ?? 0 })).filter(
			(x) => x.count > 0
		)
	);
	const activeMedia = $derived(
		MEDIA_TYPES.filter((m) => (data.stats.byMedia[m] ?? 0) > 0)
	);
	const maxMedia = $derived(Math.max(1, ...Object.values(data.stats.byMedia)));

	const overview = $derived([
		{ label: 'Total tracked', value: data.stats.total, tint: 'sky' as const },
		{
			label: 'In progress',
			value: (data.stats.byStatus['Watching'] ?? 0) + (data.stats.byStatus['Reading'] ?? 0),
			tint: 'blush' as const
		},
		{ label: 'Completed', value: data.stats.byStatus['Completed'] ?? 0, tint: 'mint' as const },
		{
			label: 'Backlog',
			value:
				(data.stats.byStatus['Plan to Watch'] ?? 0) +
				(data.stats.byStatus['Plan to Read'] ?? 0) +
				(data.stats.byStatus['On Hold'] ?? 0),
			tint: 'cream' as const
		}
	]);
</script>

<svelte:head><title>Statistics · Serivio</title></svelte:head>

<Eyebrow>The numbers</Eyebrow>
<h1 class="mt-1 text-[35px] font-medium tracking-tight text-midnight-ink">Statistics</h1>

<!-- Overview -->
<div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
	{#each overview as o (o.label)}
		<TintedCard tint={o.tint} class="!p-5">
			<p class="font-sans text-[40px] font-bold leading-none text-midnight-ink">{o.value}</p>
			<p class="mt-2 font-sans text-[14px] text-carbon-nav">{o.label}</p>
		</TintedCard>
	{/each}
</div>

<div class="mt-10 grid gap-8 lg:grid-cols-2">
	<!-- By media type -->
	<section>
		<h2 class="text-[22px] font-medium tracking-tight text-midnight-ink">By media type</h2>
		<div class="mt-4 flex flex-col gap-3">
			{#each activeMedia as m (m)}
				<div>
					<div class="flex items-center justify-between font-sans text-[14px]">
						<span class="font-medium text-midnight-ink">{m}</span>
						<span class="text-carbon-nav">{data.stats.byMedia[m]}</span>
					</div>
					<div class="mt-1 h-2 overflow-hidden rounded-full bg-ash-border">
						<div
							class="h-full rounded-full bg-accent"
							style={`width:${((data.stats.byMedia[m] ?? 0) / maxMedia) * 100}%`}
						></div>
					</div>
				</div>
			{:else}
				<p class="font-sans text-[14px] text-carbon-nav">No data yet.</p>
			{/each}
		</div>
	</section>

	<!-- By status -->
	<section>
		<h2 class="text-[22px] font-medium tracking-tight text-midnight-ink">By status</h2>
		<div class="mt-4 flex flex-wrap gap-3">
			{#each totalStatuses as s (s.status)}
				<div class="flex items-center gap-2 rounded-[7px] border border-ash-border px-3 py-2">
					<StatusBadge status={s.status} />
					<span class="font-sans text-[18px] font-bold text-midnight-ink">{s.count}</span>
				</div>
			{:else}
				<p class="font-sans text-[14px] text-carbon-nav">No data yet.</p>
			{/each}
		</div>
	</section>
</div>

<!-- Media × status breakdown -->
{#if activeMedia.length}
	<section class="mt-10">
		<h2 class="text-[22px] font-medium tracking-tight text-midnight-ink">Detailed breakdown</h2>
		<div class="mt-4 overflow-x-auto rounded-[7px] border border-ash-border">
			<table class="w-full border-collapse font-sans text-[14px]">
				<thead>
					<tr class="border-b border-ash-border bg-sky-wash/40 text-left">
						<th class="px-4 py-2.5 font-semibold text-midnight-ink">Media</th>
						{#each STATUSES as st (st)}
							<th class="px-3 py-2.5 text-center font-medium text-carbon-nav">{st}</th>
						{/each}
						<th class="px-4 py-2.5 text-center font-semibold text-midnight-ink">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each activeMedia as m (m)}
						<tr class="border-b border-ash-border last:border-0">
							<td class="px-4 py-2.5 font-medium text-midnight-ink">{m}</td>
							{#each STATUSES as st (st)}
								<td class="px-3 py-2.5 text-center text-carbon-nav">
									{data.stats.byMediaStatus[m]?.[st] ?? '—'}
								</td>
							{/each}
							<td class="px-4 py-2.5 text-center font-semibold text-midnight-ink"
								>{data.stats.byMedia[m]}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}
