import { test, expect } from '@playwright/test';

/** Unique username per run so the suite is repeatable against a live DB. */
const user = `e2e_${Date.now().toString(36)}`;
const password = 'password123';

test.describe.configure({ mode: 'serial' });

test('landing page renders the hero', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /never lose your/i, level: 1 })).toBeVisible();
	await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible();
});

test('register, add a series, use continue, search, collect', async ({ page }) => {
	// Register
	await page.goto('/register');
	await page.getByPlaceholder('yourname').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /create account/i }).click();
	await expect(page).toHaveURL(/\/dashboard/);

	// Add a series
	await page.goto('/add');
	await page.getByPlaceholder('e.g. Solo Leveling').fill('Test Manga');
	await page.locator('select').first().selectOption('Manga');
	await page.locator('select').nth(1).selectOption('Reading');
	await page.getByRole('button', { name: /add series/i }).click();
	await expect(page).toHaveURL(/\/series\//);
	await expect(page.getByRole('heading', { name: 'Test Manga' })).toBeVisible();

	// Continue increments progress
	await expect(page.getByText('Chapter 0', { exact: false })).toBeVisible();
	await page.getByRole('button', { name: /continue/i }).click();
	await expect(page.getByText('Chapter 1', { exact: false }).first()).toBeVisible();

	// Search finds it (Elasticsearch, fuzzy)
	await page.goto('/library?q=test');
	await expect(page.getByRole('heading', { name: 'Test Manga' })).toBeVisible();

	// Create a collection
	await page.goto('/collections');
	await page.getByPlaceholder(/new collection name/i).fill('My Shelf');
	await page.getByRole('button', { name: /^create$/i }).click();
	await expect(page.getByText('My Shelf').first()).toBeVisible();
});
