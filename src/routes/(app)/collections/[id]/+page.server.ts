import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { collection, collectionItem } from '$lib/server/db/schema';
import { seriesInCollection } from '$lib/server/series';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user!.id;
	const [col] = await db
		.select()
		.from(collection)
		.where(and(eq(collection.id, params.id), eq(collection.userId, userId)));
	if (!col) throw error(404, 'Collection not found');

	const list = await seriesInCollection(userId, params.id);
	return { collection: col, list };
};

export const actions: Actions = {
	remove: async ({ params, locals, request }) => {
		const userId = locals.user!.id;
		const [col] = await db
			.select()
			.from(collection)
			.where(and(eq(collection.id, params.id), eq(collection.userId, userId)));
		if (!col) return fail(404);

		const fd = await request.formData();
		const seriesId = String(fd.get('seriesId'));
		await db
			.delete(collectionItem)
			.where(
				and(eq(collectionItem.collectionId, params.id), eq(collectionItem.seriesId, seriesId))
			);
		return { removed: true };
	},
	delete: async ({ params, locals }) => {
		await db
			.delete(collection)
			.where(and(eq(collection.id, params.id), eq(collection.userId, locals.user!.id)));
		throw redirect(303, '/collections');
	}
};
