<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { seriesSchema, type SeriesInput } from '$lib/validation/series';
	import { MEDIA_TYPES, STATUSES, isReadingMedia, progressUnit, type MediaType } from '$lib/constants';
	import { Button, Field, Input, Select, Textarea } from '$lib/components/ui';

	let {
		data,
		submitLabel = 'Save',
		existingCover = null
	}: {
		data: SuperValidated<SeriesInput>;
		submitLabel?: string;
		existingCover?: string | null;
	} = $props();

	const { form, errors, enhance, submitting, message } = superForm(data, {
		dataType: 'json',
		validators: valibotClient(seriesSchema)
	});

	let coverPreview = $state<string | null>(existingCover);
	let uploading = $state(false);

	async function onFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) { coverPreview = existingCover; return; }
		coverPreview = URL.createObjectURL(file);
		uploading = true;
		try {
			const fd = new FormData();
			fd.append('file', file);
			const res = await fetch('/api/upload-cover', { method: 'POST', body: fd });
			if (!res.ok) throw new Error(await res.text());
			const { url } = await res.json();
			$form.coverImage = url;
		} catch (err) {
			console.error('Cover upload failed:', err);
		} finally {
			uploading = false;
		}
	}

	const media = $derived($form.mediaType as MediaType);
	const reading = $derived(media ? isReadingMedia(media) : false);
	const unit = $derived(media ? progressUnit(media) : 'Progress');
</script>

<form method="POST" enctype="multipart/form-data" use:enhance class="flex flex-col gap-8">
	{#if $message}
		<div
			class="rounded-[7px] border border-danger/30 bg-error-wash px-3.5 py-2.5 font-sans text-[13px] text-danger"
		>
			{$message}
		</div>
	{/if}

	<div class="grid gap-8 md:grid-cols-[200px_1fr]">
		<!-- Cover -->
		<div class="flex flex-col gap-2">
			<span class="font-sans text-[13px] font-medium text-midnight-ink">Cover</span>
			<div
				class="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[7px] border border-dashed border-ash-border bg-sky-wash"
			>
				{#if coverPreview}
					<img src={coverPreview} alt="cover preview" class="h-full w-full object-cover" />
				{:else}
					<span class="px-4 text-center font-sans text-[13px] text-carbon-nav">No cover</span>
				{/if}
			</div>
			<input
				type="file"
				accept="image/*"
				onchange={onFile}
				disabled={uploading}
				class="font-sans text-[12px] text-carbon-nav file:mr-2 file:rounded file:border file:border-ash-border file:bg-paper-white file:px-2 file:py-1 file:font-sans file:text-[12px] disabled:opacity-50"
			/>
			{#if uploading}
				<span class="font-sans text-[11px] text-carbon-nav">Uploading…</span>
			{/if}
			<Field label="…or image URL" error={$errors.coverImage}>
				<Input bind:value={$form.coverImage} placeholder="https://…" />
			</Field>
		</div>

		<!-- Core fields -->
		<div class="flex flex-col gap-4">
			<Field label="Title" error={$errors.title} required>
				<Input bind:value={$form.title} placeholder="e.g. Solo Leveling" />
			</Field>
			<Field label="Alternative Title" error={$errors.altTitle}>
				<Input bind:value={$form.altTitle} placeholder="Original / romanized title" />
			</Field>
			<div class="grid gap-4 sm:grid-cols-2">
				<Field label="Media Type" error={$errors.mediaType} required>
					<Select bind:value={$form.mediaType} options={MEDIA_TYPES} placeholder="Select…" />
				</Field>
				<Field label="Status" error={$errors.status} required>
					<Select bind:value={$form.status} options={STATUSES} placeholder="Select…" />
				</Field>
			</div>
		</div>
	</div>

	<!-- Progress -->
	<fieldset class="flex flex-col gap-4 rounded-[7px] border border-ash-border p-5">
		<legend class="px-2 font-sans text-[13px] font-medium text-midnight-ink">Progress</legend>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Field label={`Current ${unit}`} error={$errors.currentProgress}>
				<Input type="number" min="0" bind:value={$form.currentProgress} />
			</Field>
			<Field label={`Total ${unit}`} error={$errors.totalProgress}>
				<Input type="number" min="0" bind:value={$form.totalProgress} placeholder="optional" />
			</Field>
			{#if reading}
				<Field label="Current Volume" error={$errors.currentVolume}>
					<Input type="number" min="0" bind:value={$form.currentVolume} placeholder="optional" />
				</Field>
				<Field label="Current Page" error={$errors.currentPage}>
					<Input type="number" min="0" bind:value={$form.currentPage} placeholder="optional" />
				</Field>
			{:else}
				<Field label="Season" error={$errors.season}>
					<Input type="number" min="0" bind:value={$form.season} placeholder="optional" />
				</Field>
			{/if}
			<Field label="Personal Rating (0–10)" error={$errors.rating}>
				<Input type="number" min="0" max="10" step="0.1" bind:value={$form.rating} placeholder="—" />
			</Field>
		</div>
	</fieldset>

	<!-- Metadata -->
	<fieldset class="flex flex-col gap-4 rounded-[7px] border border-ash-border p-5">
		<legend class="px-2 font-sans text-[13px] font-medium text-midnight-ink">Details</legend>
		<div class="grid gap-4 sm:grid-cols-3">
			<Field label="Author" error={$errors.author}>
				<Input bind:value={$form.author} placeholder="optional" />
			</Field>
			<Field label="Studio / Publisher" error={$errors.studioPublisher}>
				<Input bind:value={$form.studioPublisher} placeholder="optional" />
			</Field>
			<Field label="Release Year" error={$errors.releaseYear}>
				<Input type="number" bind:value={$form.releaseYear} placeholder="optional" />
			</Field>
		</div>
		<Field label="Genres" error={$errors.genres} hint="Comma separated">
			<Input bind:value={$form.genres} placeholder="Action, Fantasy" />
		</Field>
		<Field label="Tags" error={$errors.tags} hint="Comma separated">
			<Input bind:value={$form.tags} placeholder="favorites, weekend" />
		</Field>
		<Field label="Description" error={$errors.description}>
			<Textarea bind:value={$form.description} rows={3} placeholder="optional" />
		</Field>
		<Field label="Notes" error={$errors.notes}>
			<Textarea bind:value={$form.notes} rows={2} placeholder="Private notes…" />
		</Field>
	</fieldset>

	<div class="flex gap-3">
		<Button type="submit" size="lg" disabled={$submitting}>
			{$submitting ? 'Saving…' : submitLabel}
		</Button>
		<Button href="/library" variant="ghost" size="lg">Cancel</Button>
	</div>
</form>
