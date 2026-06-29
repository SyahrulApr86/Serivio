import type { PageServerLoad } from './$types';

export type PosterData = { title: string; image: string; ep: string };

// Popular anime MAL IDs — fetched once, cached 24h
const MAL_IDS = [5114, 1535, 16498, 38000, 40748, 37521, 21, 32281, 11061, 32182, 50265, 20];

let cache: { posters: PosterData[]; at: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(id: number): Promise<PosterData | null> {
	try {
		const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
			signal: AbortSignal.timeout(5000)
		});
		if (!res.ok) return null;
		const { data } = await res.json();
		return {
			title: data.title_english || data.title,
			image: data.images?.webp?.image_url ?? data.images?.jpg?.image_url ?? '',
			ep: data.episodes ? `Ep. ${data.episodes}` : data.type === 'Movie' ? 'Movie' : 'Ongoing'
		};
	} catch {
		return null;
	}
}

async function fetchAll(): Promise<PosterData[]> {
	const results: PosterData[] = [];
	// Jikan rate limit: 3 req/sec — batch 3 at a time with 1.1s gap
	for (let i = 0; i < MAL_IDS.length; i += 3) {
		const batch = await Promise.allSettled(MAL_IDS.slice(i, i + 3).map(fetchOne));
		for (const r of batch) {
			if (r.status === 'fulfilled' && r.value) results.push(r.value);
		}
		if (i + 3 < MAL_IDS.length) await sleep(1100);
	}
	return results;
}

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	if (!cache || Date.now() - cache.at > CACHE_TTL) {
		cache = { posters: await fetchAll(), at: Date.now() };
	}

	setHeaders({ 'cache-control': 'public, max-age=3600' });
	return { user: locals.user ?? null, posters: cache.posters };
};
