<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	let { data, children } = $props();
</script>

<Nav username={data.user.username} seriesIndex={data.seriesIndex} />

<main class="mx-auto max-w-[1200px] px-5 py-8">
	{@render children()}
</main>
