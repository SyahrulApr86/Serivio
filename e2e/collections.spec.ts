import { test, expect } from '@playwright/test';
import { uniqueUser, register, login, addSeries } from './helpers';

test.describe.configure({ mode: 'serial' });

const user = uniqueUser('collections');

test.beforeAll(async ({ browser }) => {
	const page = await browser.newPage();
	await register(page, user);
	await page.close();
});

test.beforeEach(async ({ page }) => {
	await login(page, user);
});

test('empty state shows when no collections exist', async ({ page }) => {
	await page.goto('/collections');
	await expect(page.getByText(/no collections yet/i)).toBeVisible();
});

test('create collection appears in grid', async ({ page }) => {
	await page.goto('/collections');
	await page.getByPlaceholder(/new collection name/i).fill('My Favorites');
	await page.getByRole('button', { name: /^create$/i }).click();
	await expect(page.getByText('My Favorites').first()).toBeVisible();
});

test('duplicate collection name shows error', async ({ page }) => {
	await page.goto('/collections');
	await page.getByPlaceholder(/new collection name/i).fill('My Favorites');
	await page.getByRole('button', { name: /^create$/i }).click();
	await page.waitForTimeout(500);

	// Error message should be visible
	await expect(
		page.getByText(/a collection with that name already exists/i)
	).toBeVisible();
});

test('collection card shows series count', async ({ page }) => {
	await page.goto('/collections');
	// "My Favorites" collection exists with 0 series
	await expect(page.getByText('0 series')).toBeVisible();
});

test('delete collection removes it from grid', async ({ page }) => {
	await page.goto('/collections');

	// Create a collection to delete
	await page.getByPlaceholder(/new collection name/i).fill('To Delete');
	await page.getByRole('button', { name: /^create$/i }).click();
	await expect(page.getByText('To Delete')).toBeVisible();

	// Hover over the card to reveal the Delete button
	const card = page.locator('.group').filter({ hasText: 'To Delete' }).first();
	await card.hover();
	await page.getByRole('button', { name: 'Delete collection' }).first().click();
	await page.waitForTimeout(500);

	await expect(page.getByText('To Delete')).not.toBeVisible();
});

test('add series to collection and verify it appears in collection page', async ({ page }) => {
	// Create collection
	await page.goto('/collections');
	await page.getByPlaceholder(/new collection name/i).fill('Adventure');
	await page.getByRole('button', { name: /^create$/i }).click();
	await expect(page.getByText('Adventure').first()).toBeVisible();

	// Get the collection link href
	const collectionLink = page.getByRole('link', { name: 'Adventure' }).first();
	const href = await collectionLink.getAttribute('href');

	// Add a series
	const seriesUrl = await addSeries(page, {
		title: 'Adventure Anime',
		mediaType: 'Anime',
		status: 'Watching'
	});

	// Go to series detail and open collections panel
	await page.goto(seriesUrl);
	await page.getByRole('button', { name: 'Collections' }).click();
	await expect(page.getByText('Adventure')).toBeVisible();

	// Add to Adventure collection
	const collectionButton = page.locator('button').filter({ hasText: 'Adventure' });
	await collectionButton.click();
	await page.waitForTimeout(500);
	await expect(page.getByText('✓ added')).toBeVisible();

	// Navigate to collection page and verify series appears
	if (href) {
		await page.goto(href);
		await expect(page.getByText('Adventure Anime')).toBeVisible();
	}
});
