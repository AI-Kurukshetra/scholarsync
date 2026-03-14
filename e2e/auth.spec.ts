import { test, expect } from '@playwright/test';

const DEMO_ACCOUNTS = {
  admin: { email: 'admin@scholarsync.demo', password: 'demo123456' },
  teacher: { email: 'teacher@scholarsync.demo', password: 'demo123456' },
  parent: { email: 'parent@scholarsync.demo', password: 'demo123456' },
};

test.describe('Authentication Flow', () => {
  test('should display login page with all elements', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByText('Quick access')).toBeVisible();
  });

  test('should display demo account buttons', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('button', { name: /Admin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Teacher/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Parent/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('invalid@test.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText(/invalid|error|credentials/i)).toBeVisible({ timeout: 10000 });
  });

  test('should login with admin demo account and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(DEMO_ACCOUNTS.admin.email);
    await page.getByLabel('Password').fill(DEMO_ACCOUNTS.admin.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should login via admin quick access button', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /Admin/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should login via teacher quick access button', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /Teacher/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should login via parent quick access button', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /Parent/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  });

  test('should display signup page with all fields', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByText('Role')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('should navigate from signup to login', async ({ page }) => {
    await page.goto('/signup');

    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByRole('button', { name: /Admin/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Open user menu - click the dropdown trigger button in header
    const userMenuBtn = page.locator('header [role="button"], header button').filter({ hasText: /[A-Z]{2}/ }).first();
    await userMenuBtn.click();

    await page.getByRole('menuitem', { name: /Sign out/i }).click();

    await page.waitForURL('**/login', { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
