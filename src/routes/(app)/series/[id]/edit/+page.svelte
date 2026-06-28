<script lang="ts">
	import { Eyebrow } from '$lib/components/ui';
	import SeriesForm from '$lib/components/SeriesForm.svelte';
	let { data } = $props();
</script>

<svelte:head><title>Edit {data.title} · Serivio</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<Eyebrow>Editing</Eyebrow>
	<h1 class="mt-1 mb-8 text-[35px] font-medium tracking-tight text-midnight-ink">{data.title}</h1>
	<SeriesForm data={data.form} submitLabel="Save changes" existingCover={data.cover} />
</div>
