import type { Series } from '../db/schema';
import { esFetch, INDEX } from './client';

export type SeriesDoc = {
	userId: string;
	title: string;
	altTitle: string | null;
	mediaType: string;
	status: string;
	tags: string[];
	genres: string[];
	rating: number | null;
	currentProgress: number;
	totalProgress: number | null;
	coverImage: string | null;
	lastActivityAt: string;
};

let ensured = false;

/** Creates the index with mapping if it does not exist. Safe to call repeatedly. */
export async function ensureIndex(force = false): Promise<void> {
	if (ensured && !force) return;
	const head = await esFetch('HEAD', `/${INDEX}`);
	if (head.status === 200) {
		ensured = true;
		return;
	}
	await esFetch('PUT', `/${INDEX}`, {
		mappings: {
			properties: {
				userId: { type: 'keyword' },
				title: { type: 'text', fields: { kw: { type: 'keyword' } } },
				altTitle: { type: 'text' },
				mediaType: { type: 'keyword' },
				status: { type: 'keyword' },
				tags: { type: 'keyword' },
				genres: { type: 'keyword' },
				rating: { type: 'float' },
				currentProgress: { type: 'integer' },
				totalProgress: { type: 'integer' },
				coverImage: { type: 'keyword', index: false },
				lastActivityAt: { type: 'date' }
			}
		}
	});
	ensured = true;
}

function toDoc(s: Series): SeriesDoc {
	return {
		userId: s.userId,
		title: s.title,
		altTitle: s.altTitle,
		mediaType: s.mediaType,
		status: s.status,
		tags: s.tags,
		genres: s.genres,
		rating: s.rating,
		currentProgress: s.currentProgress,
		totalProgress: s.totalProgress,
		coverImage: s.coverImage,
		lastActivityAt: new Date(s.lastActivityAt).toISOString()
	};
}

/** Index or update a single series document. Failures are logged, not thrown,
 *  so the primary Postgres write is never blocked by a search hiccup. */
export async function indexSeries(s: Series): Promise<void> {
	try {
		await ensureIndex();
		await esFetch('PUT', `/${INDEX}/_doc/${s.id}?refresh=wait_for`, toDoc(s));
	} catch (err) {
		console.error('[search] index failed', (err as Error).message);
	}
}

export async function removeSeries(id: string): Promise<void> {
	try {
		await esFetch('DELETE', `/${INDEX}/_doc/${id}?refresh=wait_for`);
	} catch (err) {
		console.error('[search] delete failed', (err as Error).message);
	}
}

export type SearchParams = {
	userId: string;
	q?: string;
	mediaType?: string;
	status?: string;
	tags?: string[];
	limit?: number;
};

type SearchHits = { hits: { hits: Array<{ _id: string }> } };

/** Returns matching series ids (ranked) for a user-scoped query. */
export async function searchSeries(params: SearchParams): Promise<string[]> {
	const filter: object[] = [{ term: { userId: params.userId } }];
	if (params.mediaType) filter.push({ term: { mediaType: params.mediaType } });
	if (params.status) filter.push({ term: { status: params.status } });
	if (params.tags?.length) filter.push({ terms: { tags: params.tags } });

	const must: object[] = [];
	if (params.q?.trim()) {
		must.push({
			multi_match: {
				query: params.q.trim(),
				type: 'best_fields',
				fuzziness: 'AUTO',
				fields: ['title^3', 'altTitle^2', 'tags', 'genres']
			}
		});
	}

	try {
		await ensureIndex();
		const res = await esFetch<SearchHits>('POST', `/${INDEX}/_search`, {
			size: params.limit ?? 100,
			_source: false,
			query: { bool: { filter, must: must.length ? must : [{ match_all: {} }] } },
			sort: params.q?.trim() ? undefined : [{ lastActivityAt: { order: 'desc' } }]
		});
		return res.body.hits?.hits?.map((h) => h._id) ?? [];
	} catch (err) {
		console.error('[search] query failed', (err as Error).message);
		return [];
	}
}
