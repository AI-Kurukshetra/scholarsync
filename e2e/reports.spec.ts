import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Reports Module', () => {
  test('should display reports page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports');

    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await expect(page.getByText('Access various school reports')).toBeVisible();
  });

  test('should show all report cards', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports');

    await expect(page.getByText('Attendance Report')).toBeVisible();
    await expect(page.getByText('Grade Summary')).toBeVisible();
    await expect(page.getByText('Fee Collection')).toBeVisible();
  });

  test('should navigate to attendance reports', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports');

    await page.getByText('Attendance Report').click();
    await page.waitForURL('**/attendance/reports', { timeout: 10000 });
    await expect(page).toHaveURL(/\/attendance\/reports/);
  });

  test('should navigate to grade summary', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports');

    await page.getByText('Grade Summary').click();
    await page.waitForURL('**/grades', { timeout: 10000 });
    await expect(page).toHaveURL(/\/grades/);
  });

  test('should navigate to fee collection', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports');

    await page.getByText('Fee Collection').click();
    await page.waitForURL('**/fees', { timeout: 10000 });
    await expect(page).toHaveURL(/\/fees/);
  });
});
