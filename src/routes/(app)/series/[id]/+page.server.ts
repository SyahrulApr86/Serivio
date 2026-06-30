import { error, fail, redirect } from '@sveltejs/kit';
import { getSeries, getHistory, bumpProgress, deleteSeries, touchOpened } from '$lib/server/series';
import { toggleCollectionMembership } from '$lib/server/collections';
import { db } from '$lib/server/db';
import { collection, collectionItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user!.id;
	const series = await getSeries(userId, params.id);
	if (!series) throw error(404, 'Series not found');

	await touchOpened(userId, params.id);
	const [history, collections, memberships] = await Promise.all([
		getHistory(params.id),
		db.select().from(collection).where(eq(collection.userId, userId)),
		db.select().from(collectionItem).where(eq(collectionItem.seriesId, params.id))
	]);

	const memberIds = new Set(memberships.map((m) => m.collectionId));
	return {
		series,
		history,
		collections: collections.map((c) => ({ ...c, member: memberIds.has(c.id) }))
	};
};

export const actions: Actions = {
	continue: async ({ params, locals }) => {
		const updated = await bumpProgress(locals.user!.id, params.id, 1);
		if (!updated) return fail(404);
		return { progress: updated.currentProgress };
	},
	back: async ({ params, locals }) => {
		const updated = await bumpProgress(locals.user!.id, params.id, -1);
		if (!updated) return fail(404);
		return { progress: updated.currentProgress };
	},
	delete: async ({ params, locals }) => {
		const ok = await deleteSeries(locals.user!.id, params.id);
		if (!ok) return fail(404);
		throw redirect(303, '/library');
	},
	toggleCollection: async ({ params, locals, request }) => {
		const fd = await request.formData();
		const collectionId = String(fd.get('collectionId'));
		const result = await toggleCollectionMembership(locals.user!.id, collectionId, params.id);
		if (result === null) return fail(404);
		return { toggled: true };
	}
};
