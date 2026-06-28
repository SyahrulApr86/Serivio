import { listSeries } from '$lib/server/series';
import { MEDIA_TYPES, STATUSES, SORT_OPTIONS, type SortKey } from '$lib/constants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get('q') ?? '';
	const mediaType = url.searchParams.get('media') ?? '';
	const status = url.searchParams.get('status') ?? '';
	const sortParam = url.searchParams.get('sort') ?? 'recent';
	const sort = (SORT_OPTIONS.some((o) => o.value === sortParam) ? sortParam : 'recent') as SortKey;

	const list = await listSeries(locals.user!.id, {
		q: q || undefined,
		mediaType: MEDIA_TYPES.includes(mediaType as never) ? mediaType : undefined,
		status: STATUSES.includes(status as never) ? status : undefined,
		sort
	});

	return { list, filters: { q, mediaType, status, sort } };
};
