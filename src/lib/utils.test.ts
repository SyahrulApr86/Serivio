import { describe, it, expect } from 'vitest';
import { cn, formatRelative } from './utils';

describe('cn', () => {
	it('joins truthy class fragments', () => {
		expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c');
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
});
