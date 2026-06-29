import type { Page } from '@playwright/test';

const BASE_USER = `e2e_${Date.now().toString(36)}`;

export function uniqueUser(suffix: string) {
	return `${BASE_USER}_${suffix}`;
}

/** Wait for SvelteKit JS to bind. Required before any JS-only interaction
 *  (auth forms with authClient, filter forms using goto(), dataType:'json' superforms). */
export async function waitHydrated(page: Page) {
	await page.waitForLoadState('domcontentloaded');
	await page.waitForTimeout(800);
}

export async function register(page: Page, username: string, password = 'password123') {
	await page.goto('/register');
	await waitHydrated(page);
	await page.getByPlaceholder('yourname').fill(username);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /create account/i }).click();
	await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

export async function login(page: Page, username: string, password = 'password123') {
	await page.goto('/login');
	await waitHydrated(page);
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
	await waitHydrated(page); // form uses dataType:'json' + use:enhance — needs JS before submit
	await page.getByPlaceholder('e.g. Solo Leveling').fill(opts.title);
	if (opts.mediaType) await page.locator('select').first().selectOption(opts.mediaType);
	if (opts.status) await page.locator('select').nth(1).selectOption(opts.status);
	await page.getByRole('button', { name: /add series/i }).click();
	await page.waitForURL('**/series/**', { timeout: 15_000 });
	return page.url(); // returns /series/:id
}
