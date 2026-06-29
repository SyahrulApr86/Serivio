import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { seriesSchema, splitCsv } from './series';

const VALID_MIN = { title: 'Test', mediaType: 'Anime', status: 'Watching' } as const;

function parse(input: unknown) {
	return v.safeParse(seriesSchema, input);
}

describe('splitCsv', () => {
	it('splits, trims and dedupes', () => {
		expect(splitCsv('Action, Fantasy , Action')).toEqual(['Action', 'Fantasy']);
	});

	it('splits comma-separated string into trimmed array', () => {
		expect(splitCsv('action, adventure, comedy')).toEqual(['action', 'adventure', 'comedy']);
	});

	it('deduplicates repeated values', () => {
		expect(splitCsv('a, a, b')).toEqual(['a', 'b']);
	});

	it('filters empty entries and trims whitespace', () => {
		expect(splitCsv(',, a ,,')).toEqual(['a']);
	});

	it('handles empty input', () => {
		expect(splitCsv('')).toEqual([]);
		expect(splitCsv(null)).toEqual([]);
		expect(splitCsv(undefined)).toEqual([]);
	});

	it('returns single-element array for a word with no commas', () => {
		expect(splitCsv('solo')).toEqual(['solo']);
	});
});

describe('seriesSchema', () => {
	describe('valid inputs', () => {
		it('accepts a minimal valid series (title + mediaType + status)', () => {
			const r = v.safeParse(seriesSchema, {
				title: 'One Piece',
				mediaType: 'Manga',
				status: 'Reading'
			});
			expect(r.success).toBe(true);
		});

		it('accepts full valid input with all optional fields', () => {
			const result = parse({
				title: 'Fullmetal Alchemist',
				altTitle: 'FMA',
				coverImage: 'https://example.com/cover.jpg',
				mediaType: 'Manga',
				status: 'Completed',
				currentProgress: 108,
				totalProgress: 108,
				season: 1,
				currentVolume: 27,
				currentPage: 500,
				rating: 9.5,
				releaseYear: 2001,
				author: 'Hiromu Arakawa',
				studioPublisher: 'Square Enix',
				description: 'A classic manga.',
				notes: 'Personal notes here.',
				genres: 'Action, Adventure',
				tags: 'alchemy, brotherhood'
			});
			expect(result.success).toBe(true);
		});
	});

	describe('title validation', () => {
		it('rejects empty title', () => {
			const r = v.safeParse(seriesSchema, { title: '', mediaType: 'Manga', status: 'Reading' });
			expect(r.success).toBe(false);
		});

		it('rejects whitespace-only title (trimmed to empty)', () => {
			const result = parse({ ...VALID_MIN, title: '   ' });
			expect(result.success).toBe(false);
		});

		it('rejects title over 200 characters', () => {
			const result = parse({ ...VALID_MIN, title: 'a'.repeat(201) });
			expect(result.success).toBe(false);
		});

		it('accepts title of exactly 200 characters', () => {
			const result = parse({ ...VALID_MIN, title: 'a'.repeat(200) });
			expect(result.success).toBe(true);
		});
	});

	describe('mediaType validation', () => {
		it('rejects an unknown media type', () => {
			const r = v.safeParse(seriesSchema, {
				title: 'X',
				mediaType: 'Webtoon',
				status: 'Reading'
			});
			expect(r.success).toBe(false);
		});

		it('rejects another invalid mediaType', () => {
			const result = parse({ ...VALID_MIN, mediaType: 'Cartoon' });
			expect(result.success).toBe(false);
		});

		const allMediaTypes = [
			'Anime',
			'TV Series',
			'Movie',
			'Manga',
			'Manhwa',
			'Manhua',
			'Comic',
			'Light Novel',
			'Web Novel',
			'Novel',
			'Book'
		] as const;

		for (const mediaType of allMediaTypes) {
			it(`accepts mediaType '${mediaType}'`, () => {
				const result = parse({ ...VALID_MIN, mediaType });
				expect(result.success).toBe(true);
			});
		}
	});

	describe('status validation', () => {
		it('rejects invalid status', () => {
			const result = parse({ ...VALID_MIN, status: 'Unknown' });
			expect(result.success).toBe(false);
		});

		const allStatuses = [
			'Watching',
			'Reading',
			'Completed',
			'On Hold',
			'Dropped',
			'Plan to Watch',
			'Plan to Read'
		] as const;

		for (const status of allStatuses) {
			it(`accepts status '${status}'`, () => {
				const result = parse({ ...VALID_MIN, status });
				expect(result.success).toBe(true);
			});
		}
	});

	describe('rating validation', () => {
		it('accepts rating 0', () => {
			const result = parse({ ...VALID_MIN, rating: 0 });
			expect(result.success).toBe(true);
		});

		it('accepts rating 10', () => {
			const result = parse({ ...VALID_MIN, rating: 10 });
			expect(result.success).toBe(true);
		});

		it('accepts rating 7.5', () => {
			const result = parse({ ...VALID_MIN, rating: 7.5 });
			expect(result.success).toBe(true);
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

		it('rejects rating -1', () => {
			const result = parse({ ...VALID_MIN, rating: -1 });
			expect(result.success).toBe(false);
		});

		it('rejects rating 11', () => {
			const result = parse({ ...VALID_MIN, rating: 11 });
			expect(result.success).toBe(false);
		});

		it('accepts rating null', () => {
			const result = parse({ ...VALID_MIN, rating: null });
			expect(result.success).toBe(true);
		});
	});

	describe('releaseYear validation', () => {
		it('accepts releaseYear 1800', () => {
			const result = parse({ ...VALID_MIN, releaseYear: 1800 });
			expect(result.success).toBe(true);
		});

		it('accepts releaseYear 2200', () => {
			const result = parse({ ...VALID_MIN, releaseYear: 2200 });
			expect(result.success).toBe(true);
		});

		it('rejects releaseYear 1799', () => {
			const result = parse({ ...VALID_MIN, releaseYear: 1799 });
			expect(result.success).toBe(false);
		});

		it('rejects releaseYear 2201', () => {
			const result = parse({ ...VALID_MIN, releaseYear: 2201 });
			expect(result.success).toBe(false);
		});

		it('accepts releaseYear null', () => {
			const result = parse({ ...VALID_MIN, releaseYear: null });
			expect(result.success).toBe(true);
		});
	});

	describe('currentProgress validation', () => {
		it('rejects negative currentProgress', () => {
			const result = parse({ ...VALID_MIN, currentProgress: -1 });
			expect(result.success).toBe(false);
		});

		it('accepts currentProgress 0', () => {
			const result = parse({ ...VALID_MIN, currentProgress: 0 });
			expect(result.success).toBe(true);
		});
	});
});
