import { test, expect } from '@playwright/test';
import { uniqueUser, register, addSeries, login, waitHydrated } from './helpers';

test.describe.configure({ mode: 'serial' });

const user = uniqueUser('library');

test.beforeAll(async ({ browser }) => {
	const page = await browser.newPage();
	await register(page, user);
	// Add 3 series
	await addSeries(page, { title: 'Naruto', mediaType: 'Anime', status: 'Watching' });
	await addSeries(page, { title: 'One Piece', mediaType: 'Manga', status: 'Reading' });
	await addSeries(page, { title: 'Inception', mediaType: 'Movie', status: 'Completed' });
	await page.close();
});

test.beforeEach(async ({ page }) => {
	await login(page, user);
});

test('library shows all series', async ({ page }) => {
	await page.goto('/library');
	await expect(page.getByText('3 series')).toBeVisible();
	await expect(page.getByText('Naruto').first()).toBeVisible();
	await expect(page.getByText('One Piece').first()).toBeVisible();
	await expect(page.getByText('Inception').first()).toBeVisible();
});

test('filter by media type shows only matching series', async ({ page }) => {
	await page.goto('/library');
	await waitHydrated(page);
	await page.locator('select').first().selectOption('Anime');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForURL(/\/library.*media=Anime/, { timeout: 10_000 });

	await expect(page.getByText('Naruto').first()).toBeVisible();
	await expect(page.getByText('One Piece').first()).not.toBeVisible();
	await expect(page.getByText('Inception').first()).not.toBeVisible();
});

test('filter by status shows only matching series', async ({ page }) => {
	await page.goto('/library');
	await waitHydrated(page);
	await page.locator('select').nth(1).selectOption('Completed');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForURL(/\/library.*status=Completed/, { timeout: 10_000 });

	await expect(page.getByText('Inception').first()).toBeVisible();
	await expect(page.getByText('Naruto').first()).not.toBeVisible();
	await expect(page.getByText('One Piece').first()).not.toBeVisible();
});

test('search by title finds matching series', async ({ page }) => {
	await page.goto('/library');
	await waitHydrated(page);
	await page.getByPlaceholder('Title, alt title, tags…').fill('naruto');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForURL(/\/library.*q=naruto/, { timeout: 10_000 });
	// Elasticsearch may need time to index
	await page.waitForTimeout(1000);

	await expect(page.getByText('Naruto').first()).toBeVisible();
	await expect(page.getByText('One Piece').first()).not.toBeVisible();
});

test('clear filters restores all series', async ({ page }) => {
	await page.goto('/library');
	await waitHydrated(page);
	await page.locator('select').first().selectOption('Anime');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForURL(/\/library.*media=Anime/, { timeout: 10_000 });

	await page.getByRole('button', { name: 'Clear' }).click();
	await page.waitForURL(/\/library$/, { timeout: 10_000 });

	await expect(page.getByText('3 series')).toBeVisible();
	await expect(page.getByText('Naruto').first()).toBeVisible();
	await expect(page.getByText('One Piece').first()).toBeVisible();
	await expect(page.getByText('Inception').first()).toBeVisible();
});

test('empty state when search has no matches', async ({ page }) => {
	await page.goto('/library');
	await waitHydrated(page);
	await page.getByPlaceholder('Title, alt title, tags…').fill('zzznomatch123');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForURL(/\/library.*q=zzznomatch123/, { timeout: 10_000 });
	await page.waitForTimeout(1000);

	await expect(page.getByText(/no series match these filters/i)).toBeVisible();
});
