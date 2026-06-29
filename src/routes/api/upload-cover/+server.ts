import { json, error } from '@sveltejs/kit';
import { uploadCover } from '$lib/server/storage';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File) || file.size === 0) throw error(400, 'No file');
	const url = await uploadCover(file, locals.user.id);
	return json({ url });
};
