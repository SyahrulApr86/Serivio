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

describe('isReadingMedia - all media types', () => {
	it('returns false for all non-reading (watching) media', () => {
		expect(isReadingMedia('Anime')).toBe(false);
		expect(isReadingMedia('TV Series')).toBe(false);
		expect(isReadingMedia('Movie')).toBe(false);
	});

	it('returns true for all reading media', () => {
		expect(isReadingMedia('Manga')).toBe(true);
		expect(isReadingMedia('Manhwa')).toBe(true);
		expect(isReadingMedia('Manhua')).toBe(true);
		expect(isReadingMedia('Comic')).toBe(true);
		expect(isReadingMedia('Light Novel')).toBe(true);
		expect(isReadingMedia('Web Novel')).toBe(true);
		expect(isReadingMedia('Novel')).toBe(true);
		expect(isReadingMedia('Book')).toBe(true);
	});
});

describe('progressUnit - all 11 media types', () => {
	it('returns Episode for Anime', () => expect(progressUnit('Anime')).toBe('Episode'));
	it('returns Episode for TV Series', () => expect(progressUnit('TV Series')).toBe('Episode'));
	it('returns Watched for Movie', () => expect(progressUnit('Movie')).toBe('Watched'));
	it('returns Chapter for Manga', () => expect(progressUnit('Manga')).toBe('Chapter'));
	it('returns Chapter for Manhwa', () => expect(progressUnit('Manhwa')).toBe('Chapter'));
	it('returns Chapter for Manhua', () => expect(progressUnit('Manhua')).toBe('Chapter'));
	it('returns Chapter for Comic', () => expect(progressUnit('Comic')).toBe('Chapter'));
	it('returns Chapter for Light Novel', () => expect(progressUnit('Light Novel')).toBe('Chapter'));
	it('returns Chapter for Web Novel', () => expect(progressUnit('Web Novel')).toBe('Chapter'));
	it('returns Page for Novel', () => expect(progressUnit('Novel')).toBe('Page'));
	it('returns Page for Book', () => expect(progressUnit('Book')).toBe('Page'));
});

describe('statusAccent - all 7 statuses', () => {
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
		it(`returns valid accent object for '${status}'`, () => {
			const accent = statusAccent(status);
			expect(accent.wash).toMatch(/^bg-/);
			expect(accent.dot).toMatch(/^bg-/);
			expect(typeof accent.border).toBe('string');
			expect(typeof accent.text).toBe('string');
		});
	}
});
