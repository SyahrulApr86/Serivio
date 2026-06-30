/**
 * Shared tool registry. Each tool exposes an OpenAI-compatible JSON-schema and a
 * `userId`-scoped executor that delegates to the existing data layer. Consumed by
 * both the web chat loop (`chat.ts`) and the MCP server (`mcp/server.ts`), so the
 * behaviour stays identical across surfaces.
 */
import { MEDIA_TYPES, STATUSES, SORT_OPTIONS } from '$lib/constants';
import {
	listSeries,
	getSeries,
	createSeries,
	updateSeries,
	deleteSeries,
	bumpProgress,
	findSeriesByTitle,
	getStats
} from '$lib/server/series';
import {
	listCollections,
	createCollection,
	addToCollection,
	removeFromCollection,
	DuplicateCollectionError
} from '$lib/server/collections';
import type { NewSeries } from '$lib/server/db/schema';

export type JsonSchema = {
	type: 'object';
	properties: Record<string, unknown>;
	required?: string[];
	additionalProperties?: boolean;
};

export type ToolResult = {
	/** Compact, machine-readable payload returned to the model. */
	data: unknown;
	/** Short human sentence shown in the UI as an "action taken" chip. */
	summary: string;
};

export type AiTool = {
	name: string;
	description: string;
	parameters: JsonSchema;
	execute: (userId: string, args: Record<string, unknown>) => Promise<ToolResult>;
};

const MEDIA_VALUES = [...MEDIA_TYPES];
const STATUS_VALUES = [...STATUSES];
const SORT_VALUES = SORT_OPTIONS.map((s) => s.value);

function str(v: unknown): string | undefined {
	return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}
function num(v: unknown): number | undefined {
	return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
function strArray(v: unknown): string[] | undefined {
	if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
	if (typeof v === 'string')
		return v
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	return undefined;
}

/** Fields shared by create/update series payloads. */
const seriesFieldProps = {
	title: { type: 'string', description: 'Title of the series' },
	altTitle: { type: 'string', description: 'Alternative / original title' },
	coverImage: {
		type: 'string',
		description: 'Cover image URL. Use an attached image URL when the user provided one.'
	},
	mediaType: { type: 'string', enum: MEDIA_VALUES },
	status: { type: 'string', enum: STATUS_VALUES },
	currentProgress: { type: 'integer', minimum: 0, description: 'Current episode/chapter/page' },
	totalProgress: { type: 'integer', minimum: 0, description: 'Total episodes/chapters, if known' },
	rating: { type: 'number', minimum: 0, maximum: 10 },
	releaseYear: { type: 'integer' },
	author: { type: 'string' },
	studioPublisher: { type: 'string' },
	description: { type: 'string' },
	notes: { type: 'string' },
	genres: { type: 'array', items: { type: 'string' }, description: 'Genre list' },
	tags: { type: 'array', items: { type: 'string' }, description: 'Tag list' }
};

/** Builds the partial series payload from loose tool args (only set provided keys). */
function buildSeriesData(args: Record<string, unknown>): Partial<Omit<NewSeries, 'userId' | 'id'>> {
	const data: Partial<Omit<NewSeries, 'userId' | 'id'>> = {};
	const title = str(args.title);
	if (title) data.title = title;
	if ('altTitle' in args) data.altTitle = str(args.altTitle) ?? null;
	if ('coverImage' in args) data.coverImage = str(args.coverImage) ?? null;
	if (str(args.mediaType)) data.mediaType = args.mediaType as NewSeries['mediaType'];
	if (str(args.status)) data.status = args.status as NewSeries['status'];
	if (num(args.currentProgress) !== undefined) data.currentProgress = num(args.currentProgress)!;
	if ('totalProgress' in args) data.totalProgress = num(args.totalProgress) ?? null;
	if ('rating' in args) data.rating = num(args.rating) ?? null;
	if ('releaseYear' in args) data.releaseYear = num(args.releaseYear) ?? null;
	if ('author' in args) data.author = str(args.author) ?? null;
	if ('studioPublisher' in args) data.studioPublisher = str(args.studioPublisher) ?? null;
	if ('description' in args) data.description = str(args.description) ?? null;
	if ('notes' in args) data.notes = str(args.notes) ?? null;
	if (strArray(args.genres)) data.genres = strArray(args.genres)!;
	if (strArray(args.tags)) data.tags = strArray(args.tags)!;
	return data;
}

export const tools: AiTool[] = [
	{
		name: 'search_series',
		description:
			'Find series in the user\'s library by title (fuzzy). Use this FIRST to get the id before updating, bumping progress, or deleting a series.',
		parameters: {
			type: 'object',
			properties: { query: { type: 'string', description: 'Title or partial title to search' } },
			required: ['query']
		},
		async execute(userId, args) {
			const q = str(args.query) ?? '';
			const matches = await findSeriesByTitle(userId, q);
			return { data: matches, summary: `Searched library for "${q}" (${matches.length} match)` };
		}
	},
	{
		name: 'list_series',
		description: "List the user's series, optionally filtered by media type and status.",
		parameters: {
			type: 'object',
			properties: {
				mediaType: { type: 'string', enum: MEDIA_VALUES },
				status: { type: 'string', enum: STATUS_VALUES },
				sort: { type: 'string', enum: SORT_VALUES }
			}
		},
		async execute(userId, args) {
			const list = await listSeries(userId, {
				mediaType: str(args.mediaType),
				status: str(args.status),
				sort: str(args.sort) as never
			});
			const slim = list.map((s) => ({
				id: s.id,
				title: s.title,
				mediaType: s.mediaType,
				status: s.status,
				currentProgress: s.currentProgress,
				totalProgress: s.totalProgress,
				rating: s.rating
			}));
			return { data: slim, summary: `Listed ${slim.length} series` };
		}
	},
	{
		name: 'get_series',
		description: 'Get full details of a single series by id.',
		parameters: {
			type: 'object',
			properties: { id: { type: 'string' } },
			required: ['id']
		},
		async execute(userId, args) {
			const row = await getSeries(userId, str(args.id) ?? '');
			return { data: row ?? { error: 'not found' }, summary: row ? `Read "${row.title}"` : 'Series not found' };
		}
	},
	{
		name: 'get_stats',
		description: "Get aggregate counts of the user's library by status and media type.",
		parameters: { type: 'object', properties: {} },
		async execute(userId) {
			const stats = await getStats(userId);
			return { data: stats, summary: `Computed stats (${stats.total} total)` };
		}
	},
	{
		name: 'create_series',
		description:
			'Add a new series to the library. Requires title, mediaType, and status. If the user attached a poster image, pass its URL as coverImage.',
		parameters: {
			type: 'object',
			properties: seriesFieldProps,
			required: ['title', 'mediaType', 'status']
		},
		async execute(userId, args) {
			const data = buildSeriesData(args);
			if (!data.title || !data.mediaType || !data.status) {
				return { data: { error: 'title, mediaType and status are required' }, summary: 'Create failed: missing fields' };
			}
			const row = await createSeries(userId, data as Omit<NewSeries, 'userId' | 'id'>);
			return { data: { id: row.id, title: row.title }, summary: `Added "${row.title}"` };
		}
	},
	{
		name: 'update_series',
		description: 'Update fields of an existing series. Provide its id (use search_series first).',
		parameters: {
			type: 'object',
			properties: { id: { type: 'string' }, ...seriesFieldProps },
			required: ['id']
		},
		async execute(userId, args) {
			const id = str(args.id) ?? '';
			const row = await updateSeries(userId, id, buildSeriesData(args));
			return row
				? { data: { id: row.id, title: row.title }, summary: `Updated "${row.title}"` }
				: { data: { error: 'not found' }, summary: 'Update failed: series not found' };
		}
	},
	{
		name: 'set_progress',
		description: 'Set the absolute current progress (episode/chapter/page) of a series.',
		parameters: {
			type: 'object',
			properties: { id: { type: 'string' }, value: { type: 'integer', minimum: 0 } },
			required: ['id', 'value']
		},
		async execute(userId, args) {
			const id = str(args.id) ?? '';
			const value = num(args.value) ?? 0;
			const current = await getSeries(userId, id);
			if (!current) return { data: { error: 'not found' }, summary: 'Series not found' };
			const row = await bumpProgress(userId, id, value - current.currentProgress);
			return { data: { id, currentProgress: row?.currentProgress }, summary: `Set "${current.title}" to ${value}` };
		}
	},
	{
		name: 'bump_progress',
		description: 'Increment (or decrement) a series\' progress by a delta. Default +1.',
		parameters: {
			type: 'object',
			properties: { id: { type: 'string' }, delta: { type: 'integer', description: 'Default 1' } },
			required: ['id']
		},
		async execute(userId, args) {
			const id = str(args.id) ?? '';
			const delta = num(args.delta) ?? 1;
			const row = await bumpProgress(userId, id, delta);
			return row
				? { data: { id, currentProgress: row.currentProgress, status: row.status }, summary: `"${row.title}" → ${row.currentProgress}` }
				: { data: { error: 'not found' }, summary: 'Series not found' };
		}
	},
	{
		name: 'delete_series',
		description: 'Delete a series from the library by id. Confirm with the user before calling.',
		parameters: {
			type: 'object',
			properties: { id: { type: 'string' } },
			required: ['id']
		},
		async execute(userId, args) {
			const ok = await deleteSeries(userId, str(args.id) ?? '');
			return { data: { deleted: ok }, summary: ok ? 'Deleted series' : 'Delete failed: not found' };
		}
	},
	{
		name: 'list_collections',
		description: "List the user's collections with item counts.",
		parameters: { type: 'object', properties: {} },
		async execute(userId) {
			const cols = await listCollections(userId);
			return { data: cols, summary: `Listed ${cols.length} collections` };
		}
	},
	{
		name: 'create_collection',
		description: 'Create a new collection.',
		parameters: {
			type: 'object',
			properties: { name: { type: 'string' }, description: { type: 'string' } },
			required: ['name']
		},
		async execute(userId, args) {
			try {
				const col = await createCollection(userId, str(args.name) ?? '', str(args.description) ?? null);
				return { data: { id: col.id, name: col.name }, summary: `Created collection "${col.name}"` };
			} catch (e) {
				if (e instanceof DuplicateCollectionError)
					return { data: { error: e.message }, summary: 'Collection already exists' };
				throw e;
			}
		}
	},
	{
		name: 'add_to_collection',
		description: 'Add a series to a collection. Provide both ids (use search_series / list_collections).',
		parameters: {
			type: 'object',
			properties: { collectionId: { type: 'string' }, seriesId: { type: 'string' } },
			required: ['collectionId', 'seriesId']
		},
		async execute(userId, args) {
			const ok = await addToCollection(userId, str(args.collectionId) ?? '', str(args.seriesId) ?? '');
			return { data: { added: ok }, summary: ok ? 'Added to collection' : 'Failed: collection not found' };
		}
	},
	{
		name: 'remove_from_collection',
		description: 'Remove a series from a collection.',
		parameters: {
			type: 'object',
			properties: { collectionId: { type: 'string' }, seriesId: { type: 'string' } },
			required: ['collectionId', 'seriesId']
		},
		async execute(userId, args) {
			const ok = await removeFromCollection(userId, str(args.collectionId) ?? '', str(args.seriesId) ?? '');
			return { data: { removed: ok }, summary: ok ? 'Removed from collection' : 'Failed: collection not found' };
		}
	}
];

export const toolsByName = new Map(tools.map((t) => [t.name, t]));
