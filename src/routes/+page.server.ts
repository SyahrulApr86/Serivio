import type { PageServerLoad } from './$types';

export type PosterData = { title: string; image: string; ep: string };

// Popular anime MAL IDs
const MAL_IDS = [5114, 1535, 16498, 38000, 40748, 37521, 21, 32281, 11061, 32182, 50265, 20];

let cache: { posters: PosterData[]; at: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function fetchOne(id: number): Promise<PosterData | null> {
	try {
		const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
			signal: AbortSignal.timeout(4000)
		});
		if (!res.ok) return null;
		const { data } = await res.json();
		const eps = data.episodes;
		return {
			title: data.title_english || data.title,
			image: data.images?.webp?.image_url ?? data.images?.jpg?.image_url ?? '',
			ep: eps ? `Ep. ${eps}` : data.type === 'Movie' ? 'Movie' : 'Ongoing'
		};
	} catch {
		return null;
	}
}

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	if (!cache || Date.now() - cache.at > CACHE_TTL) {
		const results = await Promise.allSettled(MAL_IDS.map(fetchOne));
		const posters = results
			.filter((r): r is PromiseFulfilledResult<PosterData> => r.status === 'fulfilled' && r.value !== null)
			.map((r) => r.value);
		cache = { posters, at: Date.now() };
	}

	setHeaders({ 'cache-control': 'public, max-age=3600' });
	return { user: locals.user ?? null, posters: cache.posters };
};
