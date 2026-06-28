import { describe, it, expect } from 'vitest';
import { isReadingMedia, progressUnit, progressVerb, statusAccent } from './constants';

describe('media helpers', () => {
	it('classifies reading vs watching media', () => {
		expect(isReadingMedia('Manga')).toBe(true);
		expect(isReadingMedia('Web Novel')).toBe(true);
		expect(isReadingMedia('Anime')).toBe(false);
		expect(isReadingMedia('Movie')).toBe(false);
	});

	it('returns the right progress unit per media', () => {
		expect(progressUnit('Anime')).toBe('Episode');
		expect(progressUnit('TV Series')).toBe('Episode');
		expect(progressUnit('Manga')).toBe('Chapter');
		expect(progressUnit('Novel')).toBe('Page');
		expect(progressUnit('Book')).toBe('Page');
		expect(progressUnit('Movie')).toBe('Watched');
	});

	it('returns read/watch verb', () => {
		expect(progressVerb('Manhwa')).toBe('read');
		expect(progressVerb('Anime')).toBe('watch');
	});

	it('maps every status to an accent', () => {
		for (const s of ['Watching', 'Reading', 'Completed', 'On Hold', 'Dropped'] as const) {
			const a = statusAccent(s);
			expect(a.wash).toMatch(/^bg-/);
			expect(a.dot).toMatch(/^bg-/);
		}
	});
});
