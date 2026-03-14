import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Grades Module', () => {
  test('should display grades page with class cards', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/grades');

    await expect(page.getByRole('heading', { name: 'Grades' })).toBeVisible();
    await expect(page.getByText('Manage student grades and assignments')).toBeVisible();
  });

  test('should show class cards from seed data', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/grades');

    // Should have class cards with grade info
    await expect(page.getByText(/Grade \d/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to class gradebook', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/grades');

    // Click first class card
    const firstCard = page.locator('a[href^="/grades/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    await page.waitForURL('**/grades/**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/grades\/.+/);
  });

  test('gradebook page should show assignments and grades', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/grades');

    const firstCard = page.locator('a[href^="/grades/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    await page.waitForURL('**/grades/**', { timeout: 10000 });

    // Should show some grade-related content
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 });
  });
});
