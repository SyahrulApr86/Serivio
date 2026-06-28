import { superValidate, withFiles } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { seriesSchema, splitCsv } from '$lib/validation/series';
import { getSeries, updateSeries } from '$lib/server/series';
import { uploadCover } from '$lib/server/storage';
import type { Actions, PageServerLoad } from './$types';

const editSchema = v.object({
	...seriesSchema.entries,
	cover: v.optional(v.instance(File))
});

export const load: PageServerLoad = async ({ params, locals }) => {
	const s = await getSeries(locals.user!.id, params.id);
	if (!s) throw error(404, 'Series not found');

	const form = await superValidate(
		{
			title: s.title,
			altTitle: s.altTitle ?? '',
			coverImage: s.coverImage ?? '',
			mediaType: s.mediaType,
			status: s.status,
			currentProgress: s.currentProgress,
			totalProgress: s.totalProgress,
			season: s.season,
			currentVolume: s.currentVolume,
			currentPage: s.currentPage,
			rating: s.rating,
			releaseYear: s.releaseYear,
			author: s.author ?? '',
			studioPublisher: s.studioPublisher ?? '',
			description: s.description ?? '',
			notes: s.notes ?? '',
			genres: s.genres.join(', '),
			tags: s.tags.join(', ')
		},
		valibot(seriesSchema)
	);

	return { form, cover: s.coverImage, title: s.title };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const form = await superValidate(request, valibot(editSchema), { allowFiles: true });
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

		const updated = await updateSeries(locals.user!.id, params.id, {
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
		if (!updated) return fail(404, withFiles({ form }));

		throw redirect(303, `/series/${params.id}`);
	}
};
