import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { collection, collectionItem } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const nameSchema = v.pipe(
	v.string(),
	v.trim(),
	v.minLength(1, 'Name is required'),
	v.maxLength(60)
);

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;
	const rows = await db
		.select({
			id: collection.id,
			name: collection.name,
			description: collection.description,
			createdAt: collection.createdAt,
			count: sql<number>`count(${collectionItem.seriesId})::int`
		})
		.from(collection)
		.leftJoin(collectionItem, eq(collectionItem.collectionId, collection.id))
		.where(eq(collection.userId, userId))
		.groupBy(collection.id)
		.orderBy(collection.createdAt);

	return { collections: rows };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const fd = await request.formData();
		const parsed = v.safeParse(nameSchema, fd.get('name'));
		if (!parsed.success) return fail(400, { error: parsed.issues[0].message });
		try {
			await db.insert(collection).values({ userId: locals.user!.id, name: parsed.output });
		} catch {
			return fail(400, { error: 'A collection with that name already exists' });
		}
		return { created: true };
	},
	delete: async ({ locals, request }) => {
		const fd = await request.formData();
		const id = String(fd.get('id'));
		await db
			.delete(collection)
			.where(and(eq(collection.id, id), eq(collection.userId, locals.user!.id)));
		return { deleted: true };
	}
};
