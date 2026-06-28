<script lang="ts">
	import { cn } from '$lib/utils';
	let { size = 28, withText = true, class: klass = '' }: { size?: number; withText?: boolean; class?: string } =
		$props();
	const gid = 'prism-' + Math.random().toString(36).slice(2, 8);
</script>

<span class={cn('inline-flex items-center gap-2', klass)}>
	<svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
		<defs>
			<linearGradient id={gid} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
				<stop stop-color="#f75cc3" />
				<stop offset="0.35" stop-color="#2969ff" />
				<stop offset="0.7" stop-color="#ffd363" />
				<stop offset="1" stop-color="#5ab040" />
			</linearGradient>
		</defs>
		<path d="M16 2 30 16 16 30 2 16 16 2Z" fill={`url(#${gid})`} />
		<path d="M16 2 30 16 16 30 2 16 16 2Z" fill="white" fill-opacity="0.12" />
	</svg>
	{#if withText}
		<span class="font-sans text-[20px] font-bold tracking-tight text-midnight-ink">Serivio</span>
	{/if}
</span>
