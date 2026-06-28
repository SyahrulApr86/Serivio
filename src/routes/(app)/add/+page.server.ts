import { superValidate, withFiles } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { seriesSchema, splitCsv } from '$lib/validation/series';
import { createSeries } from '$lib/server/series';
import { uploadCover } from '$lib/server/storage';
import type { Actions, PageServerLoad } from './$types';

// Add a File field on top of the shared schema for the cover upload.
const addSchema = v.object({
	...seriesSchema.entries,
	cover: v.optional(v.instance(File))
});

export const load: PageServerLoad = async () => {
	// Client form uses the base schema; the cover File is handled in the action.
	const form = await superValidate(valibot(seriesSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, valibot(addSchema), { allowFiles: true });
		if (!form.valid) return fail(400, withFiles({ form }));

		const d = form.data;
		let coverImage = d.coverImage || null;
		if (d.cover && d.cover.size > 0) {
			try {
				coverImage = await uploadCover(d.cover, locals.user!.id);
			} catch (e) {
				return fail(400, withFiles({ form, message: (e as Error).message }));
			}
		}

		const created = await createSeries(locals.user!.id, {
			title: d.title,
			altTitle: d.altTitle || null,
			coverImage,
			mediaType: d.mediaType,
			status: d.status,
			currentProgress: d.currentProgress ?? 0,
			totalProgress: d.totalProgress ?? null,
			season: d.season ?? null,
			currentVolume: d.currentVolume ?? null,
			currentPage: d.currentPage ?? null,
			rating: d.rating ?? null,
			releaseYear: d.releaseYear ?? null,
			author: d.author || null,
			studioPublisher: d.studioPublisher || null,
			description: d.description || null,
			notes: d.notes || null,
			genres: splitCsv(d.genres),
			tags: splitCsv(d.tags)
		});

		throw redirect(303, `/series/${created.id}`);
	}
};
