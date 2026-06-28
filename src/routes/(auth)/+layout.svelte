<script lang="ts">
	import Logo from '$lib/components/ui/Logo.svelte';
	let { children } = $props();
</script>

<div class="relative min-h-screen overflow-hidden bg-paper-white">
	<!-- Prism wash bleeding from the top -->
	<div
		class="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-3xl prism-gradient"
	></div>

	<div class="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
		<a href="/" class="mb-8 flex justify-center"><Logo size={34} /></a>
		{@render children()}
		<p class="mt-8 text-center font-sans text-[13px] text-carbon-nav">
			Track every story, never lose your place.
		</p>
	</div>
</div>
