/**
 * Smoke test — verifies the app is up and core flows are reachable.
 * Detailed tests live in landing, auth, dashboard, library, series,
 * collections and stats spec files.
 */
import { test, expect } from '@playwright/test';
import { uniqueUser, register, login, addSeries } from './helpers';

test.describe.configure({ mode: 'serial' });

const user = uniqueUser('smoke');

test('landing page renders', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /never lose your/i, level: 1 })).toBeVisible();
	await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible();
});

test('register and reach dashboard', async ({ page }) => {
	await register(page, user);
	await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

test('add series and reach detail page', async ({ page }) => {
	await login(page, user);

	const url = await addSeries(page, {
		title: 'Smoke Anime',
		mediaType: 'Anime',
		status: 'Watching'
	});

	await expect(page).toHaveURL(url);
	await expect(page.getByRole('heading', { name: 'Smoke Anime' })).toBeVisible();
});
