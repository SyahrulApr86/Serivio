import { test, expect } from '@playwright/test';
import { uniqueUser, register, login } from './helpers';

test.describe.configure({ mode: 'serial' });

const user = uniqueUser('series');
let seriesUrl: string;

test.beforeAll(async ({ browser }) => {
	const page = await browser.newPage();
	await register(page, user);
	await page.close();
});

test('add minimal series and land on detail page', async ({ page }) => {
	await login(page, user);
	await page.goto('/add');
	await page.getByPlaceholder('e.g. Solo Leveling').fill('Test Anime');
	await page.locator('select').first().selectOption('Anime');
	await page.locator('select').nth(1).selectOption('Watching');
	await page.getByRole('button', { name: /add series/i }).click();
	await page.waitForURL('**/series/**', { timeout: 15_000 });

	await expect(page.getByRole('heading', { name: 'Test Anime' })).toBeVisible();
	seriesUrl = page.url();
});

test('series detail shows correct metadata', async ({ page }) => {
	await login(page, user);
	await page.goto(seriesUrl);

	// Media type badge and status badge
	await expect(page.getByText('Anime').first()).toBeVisible();
	await expect(page.getByText('Watching')).toBeVisible();

	// Progress starts at 0
	await expect(page.getByText(/episode\s*0/i)).toBeVisible();
});

test('continue button increments progress to Episode 1', async ({ page }) => {
	await login(page, user);
	await page.goto(seriesUrl);

	await page.getByRole('button', { name: /continue/i }).click();
	await page.waitForTimeout(500);
	await expect(page.getByText(/episode\s*1/i).first()).toBeVisible();
});

test('continue again increments to Episode 2', async ({ page }) => {
	await login(page, user);
	await page.goto(seriesUrl);

	await page.getByRole('button', { name: /continue/i }).click();
	await page.waitForTimeout(500);
	await expect(page.getByText(/episode\s*2/i).first()).toBeVisible();
});

test('back button decrements to Episode 1', async ({ page }) => {
	await login(page, user);
	await page.goto(seriesUrl);

	await page.getByRole('button', { name: 'Decrease' }).click();
	await page.waitForTimeout(500);
	await expect(page.getByText(/episode\s*1/i).first()).toBeVisible();
});

test('history section shows progress entries', async ({ page }) => {
	await login(page, user);
	await page.goto(seriesUrl);

	const historySection = page.getByText('History', { exact: true }).first();
	await expect(historySection).toBeVisible();
	// There should be history entries (episodes we advanced and backed)
	await expect(page.getByText(/episode/i).first()).toBeVisible();
});

test('edit series changes title', async ({ page }) => {
	await login(page, user);
	await page.goto(seriesUrl);

	await page.getByRole('link', { name: 'Edit' }).click();
	await expect(page).toHaveURL(/\/edit$/);

	// Clear and update title
	const titleInput = page.getByPlaceholder('e.g. Solo Leveling');
	await titleInput.clear();
	await titleInput.fill('Updated Anime');

	await page.getByRole('button', { name: /save changes/i }).click();
	await page.waitForURL(/\/series\/[^/]+$/, { timeout: 15_000 });

	await expect(page.getByRole('heading', { name: 'Updated Anime' })).toBeVisible();
});

test('can add series to a collection', async ({ page }) => {
	await login(page, user);

	// Create a collection first
	await page.goto('/collections');
	await page.getByPlaceholder(/new collection name/i).fill('E2E Collection');
	await page.getByRole('button', { name: /^create$/i }).click();
	await expect(page.getByText('E2E Collection').first()).toBeVisible();

	// Go to series detail
	await page.goto(seriesUrl);

	// Open collections panel
	await page.getByRole('button', { name: 'Collections' }).click();
	await expect(page.getByText('E2E Collection').first()).toBeVisible();

	// Click the add button for our collection
	const collectionButton = page.locator('button').filter({ hasText: 'E2E Collection' });
	await collectionButton.click();
	await page.waitForTimeout(500);

	// Should show "✓ added"
	await expect(page.getByText('✓ added')).toBeVisible();
});

test('delete series removes it from library', async ({ page }) => {
	await login(page, user);
	await page.goto(seriesUrl);

	// Click "Delete series"
	await page.getByText('Delete series').click();

	// Confirm prompt appears
	await expect(page.getByText('Yes, delete')).toBeVisible();

	// Confirm deletion
	await page.getByText('Yes, delete').click();

	// Should redirect to /library
	await page.waitForURL('**/library', { timeout: 15_000 });

	// Series should not be in library
	await expect(page.getByText('Updated Anime').first()).not.toBeVisible();
});
