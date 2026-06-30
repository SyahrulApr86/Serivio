import { error, fail, redirect } from '@sveltejs/kit';
import { getCollection, removeFromCollection, deleteCollection } from '$lib/server/collections';
import { seriesInCollection } from '$lib/server/series';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user!.id;
	const col = await getCollection(userId, params.id);
	if (!col) throw error(404, 'Collection not found');

	const list = await seriesInCollection(userId, params.id);
	return { collection: col, list };
};

export const actions: Actions = {
	remove: async ({ params, locals, request }) => {
		const fd = await request.formData();
		const ok = await removeFromCollection(
			locals.user!.id,
			params.id,
			String(fd.get('seriesId'))
		);
		if (!ok) return fail(404);
		return { removed: true };
	},
	delete: async ({ params, locals }) => {
		await deleteCollection(locals.user!.id, params.id);
		throw redirect(303, '/collections');
	}
};
