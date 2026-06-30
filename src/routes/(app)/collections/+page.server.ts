import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import {
	listCollections,
	createCollection,
	deleteCollection,
	DuplicateCollectionError
} from '$lib/server/collections';
import type { Actions, PageServerLoad } from './$types';

const nameSchema = v.pipe(
	v.string(),
	v.trim(),
	v.minLength(1, 'Name is required'),
	v.maxLength(60)
);

export const load: PageServerLoad = async ({ locals }) => {
	const collections = await listCollections(locals.user!.id);
	return { collections };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const fd = await request.formData();
		const parsed = v.safeParse(nameSchema, fd.get('name'));
		if (!parsed.success) return fail(400, { error: parsed.issues[0].message });
		try {
			await createCollection(locals.user!.id, parsed.output);
		} catch (e) {
			if (e instanceof DuplicateCollectionError) return fail(400, { error: e.message });
			throw e;
		}
		return { created: true };
	},
	delete: async ({ locals, request }) => {
		const fd = await request.formData();
		await deleteCollection(locals.user!.id, String(fd.get('id')));
		return { deleted: true };
	}
};
