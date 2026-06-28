<script lang="ts">
	import { Eyebrow } from '$lib/components/ui';
	import SeriesForm from '$lib/components/SeriesForm.svelte';
	let { data } = $props();
</script>

<svelte:head><title>Add series · Serivio</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<Eyebrow>New entry</Eyebrow>
	<h1 class="mt-1 mb-8 text-[35px] font-medium tracking-tight text-midnight-ink">Add a series</h1>
	<SeriesForm data={data.form} submitLabel="Add series" />
</div>
