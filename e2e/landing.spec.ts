import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
	test('renders hero and key CTAs', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: /never lose your/i, level: 1 })).toBeVisible();
		await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible();
		await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
	});

	test('shows features section', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h3').filter({ hasText: 'Never lose your place' })).toBeVisible();
		await expect(page.locator('h3').filter({ hasText: 'Every medium, one shelf' })).toBeVisible();
	});

	test('shows media types strip', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Anime').first()).toBeVisible();
		await expect(page.getByText('Manga').first()).toBeVisible();
		await expect(page.getByText('Movie').first()).toBeVisible();
	});

	test('navigation links exist', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: 'Features' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Supported media' })).toBeVisible();
	});

	test('redirects unauthenticated user from /dashboard to /login', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveURL(/\/login/);
	});

	test('redirects unauthenticated user from /library to /login', async ({ page }) => {
		await page.goto('/library');
		await expect(page).toHaveURL(/\/login/);
	});

	test('redirects unauthenticated user from /add to /login', async ({ page }) => {
		await page.goto('/add');
		await expect(page).toHaveURL(/\/login/);
	});
});
