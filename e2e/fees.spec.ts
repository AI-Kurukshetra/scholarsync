import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Fees Module', () => {
  test('should display fees page with stat cards', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/fees');

    await expect(page.getByRole('heading', { name: 'Fee Management' })).toBeVisible();
    await expect(page.getByText('Track and manage student fee payments')).toBeVisible();
  });

  test('should show fee summary information', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/fees');

    await expect(page.getByText('Total Collected')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Overdue').first()).toBeVisible();
  });

  test('should show payments table header', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/fees');

    await expect(page.getByText('All Payments')).toBeVisible({ timeout: 10000 });

    // Check table headers exist using column header role
    const headers = page.locator('thead th');
    await expect(headers.first()).toBeVisible({ timeout: 10000 });
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(4);
  });

  test('should display payment data from seed', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/fees');

    // Wait for table to populate
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 10000 });

    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should display payment amounts with dollar sign', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/fees');

    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Should show dollar amounts in the table
    const dollarCells = page.locator('tbody td').filter({ hasText: '$' });
    const count = await dollarCells.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to student fee detail', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/fees');

    const firstStudentLink = page.locator('tbody tr a').first();
    await expect(firstStudentLink).toBeVisible({ timeout: 10000 });
    await firstStudentLink.click();

    await page.waitForURL('**/fees/**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/fees\/.+/);
  });
});
