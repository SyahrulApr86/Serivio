import { test, expect } from '@playwright/test';
import { uniqueUser, register, addSeries, login } from './helpers';

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
	await expect(page.getByText('Naruto')).toBeVisible();
	await expect(page.getByText('One Piece')).toBeVisible();
	await expect(page.getByText('Inception')).toBeVisible();
});

test('filter by media type shows only matching series', async ({ page }) => {
	await page.goto('/library');
	// First select = Media filter
	await page.locator('select').first().selectOption('Anime');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForTimeout(500);

	await expect(page.getByText('Naruto')).toBeVisible();
	await expect(page.getByText('One Piece')).not.toBeVisible();
	await expect(page.getByText('Inception')).not.toBeVisible();
});

test('filter by status shows only matching series', async ({ page }) => {
	await page.goto('/library');
	// Second select = Status filter
	await page.locator('select').nth(1).selectOption('Completed');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForTimeout(500);

	await expect(page.getByText('Inception')).toBeVisible();
	await expect(page.getByText('Naruto')).not.toBeVisible();
	await expect(page.getByText('One Piece')).not.toBeVisible();
});

test('search by title finds matching series', async ({ page }) => {
	await page.goto('/library');
	await page.getByPlaceholder('Title, alt title, tags…').fill('naruto');
	await page.getByRole('button', { name: 'Apply' }).click();
	// Elasticsearch may need time to index
	await page.waitForTimeout(1000);

	await expect(page.getByText('Naruto')).toBeVisible();
	await expect(page.getByText('One Piece')).not.toBeVisible();
});

test('clear filters restores all series', async ({ page }) => {
	await page.goto('/library');
	// Apply a filter first
	await page.locator('select').first().selectOption('Anime');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForTimeout(500);

	// Clear
	await page.getByRole('button', { name: 'Clear' }).click();
	await page.waitForURL('**/library', { timeout: 10_000 });

	await expect(page.getByText('3 series')).toBeVisible();
	await expect(page.getByText('Naruto')).toBeVisible();
	await expect(page.getByText('One Piece')).toBeVisible();
	await expect(page.getByText('Inception')).toBeVisible();
});

test('empty state when search has no matches', async ({ page }) => {
	await page.goto('/library');
	await page.getByPlaceholder('Title, alt title, tags…').fill('zzznomatch123');
	await page.getByRole('button', { name: 'Apply' }).click();
	await page.waitForTimeout(1000);

	await expect(page.getByText(/no series match these filters/i)).toBeVisible();
});
