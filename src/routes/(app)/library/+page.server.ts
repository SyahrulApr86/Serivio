import { listSeries } from '$lib/server/series';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const list = await listSeries(locals.user!.id);
	return { list };
};
