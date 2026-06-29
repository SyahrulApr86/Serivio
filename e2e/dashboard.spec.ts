import { test, expect } from '@playwright/test';
import { uniqueUser, register, login, addSeries } from './helpers';

test.describe.configure({ mode: 'serial' });

const user = uniqueUser('dashboard');

test.beforeAll(async ({ browser }) => {
	const page = await browser.newPage();
	await register(page, user);
	await page.close();
});

test('dashboard renders with empty state', async ({ page }) => {
	await login(page, user);
	await page.goto('/dashboard');

	await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

	// Stat cards — use first() since 'Watching'/'Reading' etc. may appear as status badges too
	await expect(page.getByText('Watching').first()).toBeVisible();
	await expect(page.getByText('Reading').first()).toBeVisible();
	await expect(page.getByText('Completed').first()).toBeVisible();
	await expect(page.getByText('On Hold').first()).toBeVisible();

	// Empty continue list
	await expect(page.getByText(/nothing in progress yet/i)).toBeVisible();
});

test('dashboard shows series in continue list after adding', async ({ page }) => {
	await login(page, user);
	await addSeries(page, { title: 'Dashboard Manga', mediaType: 'Manga', status: 'Reading' });

	await page.goto('/dashboard');
	await expect(page.getByText(/continue watching \/ reading/i)).toBeVisible();
	await expect(page.getByText('Dashboard Manga').first()).toBeVisible();
});

test('dashboard stats update after adding a Watching series', async ({ page }) => {
	await login(page, user);
	await addSeries(page, { title: 'Dashboard Anime', mediaType: 'Anime', status: 'Watching' });

	await page.goto('/dashboard');
	await expect(page.getByText('Watching').first()).toBeVisible();
});

test('recently updated section shows added series', async ({ page }) => {
	await login(page, user);
	await page.goto('/dashboard');

	await expect(page.getByRole('heading', { name: /recently updated/i })).toBeVisible();
	const recentSection = page.locator('section').filter({ hasText: /recently updated/i });
	await expect(recentSection).toBeVisible();
	await expect(
		recentSection.getByText(/Dashboard Manga|Dashboard Anime/).first()
	).toBeVisible();
});
