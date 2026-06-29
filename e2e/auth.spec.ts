import { test, expect } from '@playwright/test';
import { uniqueUser, login } from './helpers';

test.describe.configure({ mode: 'serial' });

const user = uniqueUser('auth');
const password = 'password123';

// Auth pages use client-side authClient — wait for SvelteKit hydration.
async function waitHydrated(page: Parameters<typeof login>[0]) {
	await page.waitForLoadState('domcontentloaded');
	await page.waitForTimeout(800);
}

test('successful registration lands on dashboard', async ({ page }) => {
	await page.goto('/register');
	await waitHydrated(page);
	await page.getByPlaceholder('yourname').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /create account/i }).click();
	await page.waitForURL('**/dashboard', { timeout: 15_000 });
	await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

test('duplicate username shows error and stays on /register', async ({ page }) => {
	await page.goto('/register');
	await waitHydrated(page);
	await page.getByPlaceholder('yourname').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /create account/i }).click();
	await page.waitForTimeout(2000);
	await expect(page).toHaveURL(/\/register/);
	await expect(page.locator('.text-prism-pink, [class*="prism-pink"]').first()).toBeVisible();
});

test('logout redirects away from dashboard', async ({ page }) => {
	await login(page, user, password);

	// Hover account menu to reveal dropdown
	await page.locator('button[aria-label="Account menu"]').hover();
	await page.waitForTimeout(300);
	await page.getByRole('button', { name: 'Sign out' }).click();

	await expect(page).toHaveURL(/\/(login)?$/);

	// Dashboard should now redirect to login
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/login/);
});

test('successful login lands on dashboard', async ({ page }) => {
	await login(page, user, password);
	await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

test('wrong password shows error and stays on /login', async ({ page }) => {
	await page.goto('/login');
	await waitHydrated(page);
	await page.getByPlaceholder('demo').fill(user);
	await page.getByPlaceholder('••••••••').fill('wrongpassword!');
	await page.getByRole('button', { name: /sign in/i }).click();
	await page.waitForTimeout(2000);
	await expect(page).toHaveURL(/\/login/);
	await expect(page.locator('.text-prism-pink, [class*="prism-pink"]').first()).toBeVisible();
});

test('redirect after login takes user back to intended page', async ({ page }) => {
	// Go to protected route — SvelteKit redirects to /login?redirect=/library
	await page.goto('/library');
	await expect(page).toHaveURL(/\/login/);
	await waitHydrated(page);

	await page.getByPlaceholder('demo').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /sign in/i }).click();

	await page.waitForURL('**/library', { timeout: 15_000 });
	await expect(page.getByRole('heading', { name: /library/i })).toBeVisible();
});
