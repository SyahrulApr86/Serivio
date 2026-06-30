import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import { listTokens, createToken, revokeToken } from '$lib/server/tokens';
import type { Actions, PageServerLoad } from './$types';

const nameSchema = v.pipe(v.string(), v.trim(), v.minLength(1, 'Name is required'), v.maxLength(60));

export const load: PageServerLoad = async ({ locals }) => {
	return { tokens: await listTokens(locals.user!.id) };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		const fd = await request.formData();
		const parsed = v.safeParse(nameSchema, fd.get('name'));
		if (!parsed.success) return fail(400, { error: parsed.issues[0].message });
		const token = await createToken(locals.user!.id, parsed.output);
		// Returned once — the raw secret is never stored in retrievable form again.
		return { token, name: parsed.output };
	},
	revoke: async ({ locals, request }) => {
		const fd = await request.formData();
		await revokeToken(locals.user!.id, String(fd.get('id')));
		return { revoked: true };
	}
};
