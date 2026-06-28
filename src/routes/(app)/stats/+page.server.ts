import { getStats } from '$lib/server/series';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const stats = await getStats(locals.user!.id);
	return { stats };
};
