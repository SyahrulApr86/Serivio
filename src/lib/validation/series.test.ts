import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { seriesSchema, splitCsv } from './series';

describe('splitCsv', () => {
	it('splits, trims and dedupes', () => {
		expect(splitCsv('Action, Fantasy , Action')).toEqual(['Action', 'Fantasy']);
	});
	it('handles empty input', () => {
		expect(splitCsv('')).toEqual([]);
		expect(splitCsv(null)).toEqual([]);
		expect(splitCsv(undefined)).toEqual([]);
	});
});

describe('seriesSchema', () => {
	it('accepts a minimal valid series', () => {
		const r = v.safeParse(seriesSchema, {
			title: 'One Piece',
			mediaType: 'Manga',
			status: 'Reading'
		});
		expect(r.success).toBe(true);
	});

	it('rejects a missing title', () => {
		const r = v.safeParse(seriesSchema, { title: '', mediaType: 'Manga', status: 'Reading' });
		expect(r.success).toBe(false);
	});

	it('rejects an unknown media type', () => {
		const r = v.safeParse(seriesSchema, {
			title: 'X',
			mediaType: 'Webtoon',
			status: 'Reading'
		});
		expect(r.success).toBe(false);
	});

	it('rejects a rating above 10', () => {
		const r = v.safeParse(seriesSchema, {
			title: 'X',
			mediaType: 'Anime',
			status: 'Watching',
			rating: 99
		});
		expect(r.success).toBe(false);
	});
});
