import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Settings Module', () => {
  test('should display settings page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByText('Manage your preferences')).toBeVisible();
  });

  test('should show theme options', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');

    await expect(page.getByText('Appearance')).toBeVisible();

    // Check for theme option buttons
    const lightBtn = page.getByRole('button', { name: /Light/i });
    const darkBtn = page.getByRole('button', { name: /Dark/i });
    const systemBtn = page.getByRole('button', { name: /System/i });

    await expect(lightBtn).toBeVisible();
    await expect(darkBtn).toBeVisible();
    await expect(systemBtn).toBeVisible();
  });

  test('should switch theme to light', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');

    await page.getByRole('button', { name: /Light/i }).click();

    // HTML tag should not have dark class
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).not.toContain('dark');
  });

  test('should switch theme to dark', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');

    // First switch to light
    await page.getByRole('button', { name: /Light/i }).click();
    // Then switch back to dark
    await page.getByRole('button', { name: /Dark/i }).click();

    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
  });

  test('should show about section', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');

    await expect(page.getByText('ScholarSync v1.0')).toBeVisible();
  });
});
