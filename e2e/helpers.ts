import type { Page } from '@playwright/test';

const BASE_USER = `e2e_${Date.now().toString(36)}`;

export function uniqueUser(suffix: string) {
	return `${BASE_USER}_${suffix}`;
}

export async function register(page: Page, username: string, password = 'password123') {
	await page.goto('/register');
	await page.getByPlaceholder('yourname').fill(username);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /create account/i }).click();
	await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

export async function login(page: Page, username: string, password = 'password123') {
	await page.goto('/login');
	await page.getByPlaceholder('demo').fill(username);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /sign in/i }).click();
	await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

export async function addSeries(
	page: Page,
	opts: {
		title: string;
		mediaType?: string;
		status?: string;
		progress?: number;
	}
) {
	await page.goto('/add');
	await page.getByPlaceholder('e.g. Solo Leveling').fill(opts.title);
	if (opts.mediaType) await page.locator('select').first().selectOption(opts.mediaType);
	if (opts.status) await page.locator('select').nth(1).selectOption(opts.status);
	await page.getByRole('button', { name: /add series/i }).click();
	await page.waitForURL('**/series/**', { timeout: 15_000 });
	return page.url(); // returns /series/:id
}
