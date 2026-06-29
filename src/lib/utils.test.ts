import { describe, it, expect } from 'vitest';
import { cn, formatRelative } from './utils';

describe('cn', () => {
	it('joins truthy class fragments', () => {
		expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c');
	});

	it('returns empty string with no args', () => {
		expect(cn()).toBe('');
	});

	it('returns empty string when all args are falsy', () => {
		expect(cn(false, null, undefined)).toBe('');
	});
});

describe('formatRelative', () => {
	const now = Date.now();

	it('reports just now for recent times', () => {
		expect(formatRelative(now - 5_000)).toBe('just now');
	});

	it('reports minutes', () => {
		expect(formatRelative(now - 5 * 60_000)).toBe('5 minutes ago');
	});

	it('reports yesterday', () => {
		expect(formatRelative(now - 25 * 3_600_000)).toBe('Yesterday');
	});

	it('reports hours ago (2 hours)', () => {
		expect(formatRelative(now - 7_200_000)).toBe('2 hours ago');
	});

	it('reports days ago (3 days)', () => {
		expect(formatRelative(now - 3 * 24 * 3_600_000)).toBe('3 days ago');
	});

	it('reports weeks ago (2 weeks = 14 days)', () => {
		const result = formatRelative(now - 14 * 24 * 3_600_000);
		expect(result).toContain('week');
	});

	it('accepts a Date object as input', () => {
		const date = new Date(now - 5_000);
		expect(formatRelative(date)).toBe('just now');
	});

	it('accepts a string date as input', () => {
		const date = new Date(now - 5_000).toISOString();
		expect(formatRelative(date)).toBe('just now');
	});
});
