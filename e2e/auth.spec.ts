import { test, expect } from '@playwright/test';
import { uniqueUser } from './helpers';

test.describe.configure({ mode: 'serial' });

const user = uniqueUser('auth');
const password = 'password123';

test('successful registration lands on dashboard', async ({ page }) => {
	await page.goto('/register');
	await page.getByPlaceholder('yourname').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /create account/i }).click();
	await page.waitForURL('**/dashboard', { timeout: 15_000 });
	await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

test('duplicate username shows error and stays on /register', async ({ page }) => {
	await page.goto('/register');
	await page.getByPlaceholder('yourname').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /create account/i }).click();
	// Wait briefly for response
	await page.waitForTimeout(2000);
	await expect(page).toHaveURL(/\/register/);
	// Should show some error message
	await expect(page.locator('.text-prism-pink, [class*="prism-pink"]').first()).toBeVisible();
});

test('logout redirects away from dashboard', async ({ page }) => {
	// Login first
	await page.goto('/login');
	await page.getByPlaceholder('demo').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /sign in/i }).click();
	await page.waitForURL('**/dashboard', { timeout: 15_000 });

	// Hover over account menu to reveal dropdown
	await page.locator('button[aria-label="Account menu"]').hover();
	await page.getByRole('button', { name: 'Sign out' }).click();

	// Should be on login or landing
	await expect(page).toHaveURL(/\/(login)?$/);

	// Dashboard should now redirect to login
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/login/);
});

test('successful login lands on dashboard', async ({ page }) => {
	await page.goto('/login');
	await page.getByPlaceholder('demo').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /sign in/i }).click();
	await page.waitForURL('**/dashboard', { timeout: 15_000 });
	await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});

test('wrong password shows error and stays on /login', async ({ page }) => {
	await page.goto('/login');
	await page.getByPlaceholder('demo').fill(user);
	await page.getByPlaceholder('••••••••').fill('wrongpassword!');
	await page.getByRole('button', { name: /sign in/i }).click();
	await page.waitForTimeout(2000);
	await expect(page).toHaveURL(/\/login/);
	// Error message should be visible
	await expect(page.locator('.text-prism-pink, [class*="prism-pink"]').first()).toBeVisible();
});

test('redirect after login takes user back to intended page', async ({ page }) => {
	// Go to protected route (will redirect to /login?redirect=/library)
	await page.goto('/library');
	await expect(page).toHaveURL(/\/login/);

	// Fill login form
	await page.getByPlaceholder('demo').fill(user);
	await page.getByPlaceholder('••••••••').fill(password);
	await page.getByRole('button', { name: /sign in/i }).click();

	// Should end up at /library
	await page.waitForURL('**/library', { timeout: 15_000 });
	await expect(page.getByRole('heading', { name: /library/i })).toBeVisible();
});
