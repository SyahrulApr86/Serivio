import { listSeries, getStats } from '$lib/server/series';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;
	const [all, stats] = await Promise.all([
		listSeries(userId, { sort: 'recent' }),
		getStats(userId)
	]);

	const continueList = all
		.filter((s) => s.status === 'Watching' || s.status === 'Reading')
		.slice(0, 8);
	const recent = all.slice(0, 12);

	return { continueList, recent, stats };
};
