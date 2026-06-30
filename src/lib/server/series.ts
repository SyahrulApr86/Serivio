import { and, desc, asc, eq, sql } from 'drizzle-orm';
import { db } from './db';
import { series, progressHistory, collectionItem, type NewSeries, type Series } from './db/schema';
import type { SortKey } from '$lib/constants';

export type ListFilters = {
	mediaType?: string;
	status?: string;
	sort?: SortKey;
};

export async function listSeries(userId: string, filters: ListFilters = {}): Promise<Series[]> {
	const conds = [eq(series.userId, userId)];
	if (filters.mediaType) conds.push(eq(series.mediaType, filters.mediaType as Series['mediaType']));
	if (filters.status) conds.push(eq(series.status, filters.status as Series['status']));

	const sortCol = {
		recent: desc(series.lastActivityAt),
		opened: desc(sql`coalesce(${series.lastOpenedAt}, ${series.lastActivityAt})`),
		rating: desc(sql`coalesce(${series.rating}, -1)`),
		alpha: asc(sql`lower(${series.title})`),
		progress: desc(series.currentProgress)
	}[filters.sort ?? 'recent'];

	return db
		.select()
		.from(series)
		.where(and(...conds))
		.orderBy(sortCol);
}

export type SeriesMatch = {
	id: string;
	title: string;
	altTitle: string | null;
	mediaType: Series['mediaType'];
	status: Series['status'];
	currentProgress: number;
	totalProgress: number | null;
};

/**
 * Case-insensitive title/altTitle search, scoped to the user. Mutation tools
 * operate by id but callers (the AI / MCP) only know titles, so this resolves
 * a free-text name to candidate rows.
 */
export async function findSeriesByTitle(
	userId: string,
	q: string,
	limit = 10
): Promise<SeriesMatch[]> {
	const term = q.trim().toLowerCase();
	const all = await listSeries(userId);
	const matches = term
		? all.filter(
				(s) =>
					s.title.toLowerCase().includes(term) ||
					(s.altTitle?.toLowerCase().includes(term) ?? false)
			)
		: all;
	return matches.slice(0, limit).map((s) => ({
		id: s.id,
		title: s.title,
		altTitle: s.altTitle,
		mediaType: s.mediaType,
		status: s.status,
		currentProgress: s.currentProgress,
		totalProgress: s.totalProgress
	}));
}

export async function getSeries(userId: string, id: string): Promise<Series | undefined> {
	const [row] = await db
		.select()
		.from(series)
		.where(and(eq(series.id, id), eq(series.userId, userId)));
	return row;
}

export async function getHistory(seriesId: string, limit = 20) {
	return db
		.select()
		.from(progressHistory)
		.where(eq(progressHistory.seriesId, seriesId))
		.orderBy(desc(progressHistory.createdAt))
		.limit(limit);
}

export async function createSeries(
	userId: string,
	data: Omit<NewSeries, 'userId' | 'id'>
): Promise<Series> {
	const [row] = await db
		.insert(series)
		.values({ ...data, userId, lastActivityAt: new Date() })
		.returning();
	await db.insert(progressHistory).values({
		seriesId: row.id,
		kind: 'created',
		toValue: row.currentProgress
	});
	return row;
}

export async function updateSeries(
	userId: string,
	id: string,
	data: Partial<Omit<NewSeries, 'userId' | 'id'>>
): Promise<Series | undefined> {
	const existing = await getSeries(userId, id);
	if (!existing) return undefined;

	const [row] = await db
		.update(series)
		.set({ ...data, updatedAt: new Date(), lastActivityAt: new Date() })
		.where(and(eq(series.id, id), eq(series.userId, userId)))
		.returning();

	if (data.status && data.status !== existing.status) {
		await db.insert(progressHistory).values({
			seriesId: id,
			kind: 'status',
			note: `${existing.status} → ${data.status}`
		});
	}
	return row;
}

export async function deleteSeries(userId: string, id: string): Promise<boolean> {
	const existing = await getSeries(userId, id);
	if (!existing) return false;
	await db.delete(series).where(and(eq(series.id, id), eq(series.userId, userId)));
	return true;
}

export async function bumpProgress(
	userId: string,
	id: string,
	delta = 1
): Promise<Series | undefined> {
	const existing = await getSeries(userId, id);
	if (!existing) return undefined;

	const from = existing.currentProgress;
	let to = from + delta;
	if (to < 0) to = 0;
	if (existing.totalProgress != null && to > existing.totalProgress) to = existing.totalProgress;
	if (to === from) return existing;

	const reachedEnd = existing.totalProgress != null && to >= existing.totalProgress;
	const status =
		reachedEnd && (existing.status === 'Watching' || existing.status === 'Reading')
			? ('Completed' as const)
			: existing.status;

	const [row] = await db
		.update(series)
		.set({ currentProgress: to, status, lastActivityAt: new Date(), updatedAt: new Date() })
		.where(and(eq(series.id, id), eq(series.userId, userId)))
		.returning();

	await db.insert(progressHistory).values({
		seriesId: id,
		kind: 'progress',
		fromValue: from,
		toValue: to
	});
	return row;
}

export async function touchOpened(userId: string, id: string): Promise<void> {
	await db
		.update(series)
		.set({ lastOpenedAt: new Date() })
		.where(and(eq(series.id, id), eq(series.userId, userId)));
}

export type Stats = {
	byStatus: Record<string, number>;
	byMedia: Record<string, number>;
	byMediaStatus: Record<string, Record<string, number>>;
	total: number;
};

export async function getStats(userId: string): Promise<Stats> {
	const rows = await db
		.select({
			status: series.status,
			mediaType: series.mediaType,
			count: sql<number>`count(*)::int`
		})
		.from(series)
		.where(eq(series.userId, userId))
		.groupBy(series.status, series.mediaType);

	const stats: Stats = { byStatus: {}, byMedia: {}, byMediaStatus: {}, total: 0 };
	for (const r of rows) {
		stats.byStatus[r.status] = (stats.byStatus[r.status] ?? 0) + r.count;
		stats.byMedia[r.mediaType] = (stats.byMedia[r.mediaType] ?? 0) + r.count;
		(stats.byMediaStatus[r.mediaType] ??= {})[r.status] = r.count;
		stats.total += r.count;
	}
	return stats;
}

export async function seriesInCollection(userId: string, collectionId: string): Promise<Series[]> {
	const rows = await db
		.select({ s: series })
		.from(collectionItem)
		.innerJoin(series, eq(series.id, collectionItem.seriesId))
		.where(and(eq(collectionItem.collectionId, collectionId), eq(series.userId, userId)))
		.orderBy(desc(series.lastActivityAt));
	return rows.map((r) => r.s);
}
