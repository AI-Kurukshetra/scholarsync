import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsParent } from './helpers';

test.describe('Navigation & Sidebar', () => {
  test('sidebar should show all nav items for admin', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Students' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Attendance' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Grades' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Fees' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Announcements' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
  });

  test('sidebar should hide Reports for parent', async ({ page }) => {
    await loginAsParent(page);

    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Students' })).toBeVisible();

    // Reports should not be visible for parents
    const reportsLinks = page.getByRole('link', { name: 'Reports' });
    await expect(reportsLinks).not.toBeVisible();
  });

  test('should navigate to each page via sidebar', async ({ page }) => {
    await loginAsAdmin(page);

    // Students
    await page.getByRole('link', { name: 'Students' }).click();
    await page.waitForURL('**/students', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();

    // Attendance
    await page.getByRole('link', { name: 'Attendance' }).click();
    await page.waitForURL('**/attendance', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Attendance' })).toBeVisible();

    // Grades
    await page.getByRole('link', { name: 'Grades' }).click();
    await page.waitForURL('**/grades', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Grades' })).toBeVisible();

    // Fees
    await page.getByRole('link', { name: 'Fees' }).click();
    await page.waitForURL('**/fees', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Fee Management' })).toBeVisible();

    // Announcements
    await page.getByRole('link', { name: 'Announcements' }).click();
    await page.waitForURL('**/announcements', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Announcements' })).toBeVisible();

    // Reports
    await page.getByRole('link', { name: 'Reports' }).click();
    await page.waitForURL('**/reports', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();

    // Settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await page.waitForURL('**/settings', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Back to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.getByText(/Welcome back/)).toBeVisible();
  });

  test('should show role badge in topbar', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.locator('header').getByText('admin', { exact: true })).toBeVisible();
  });

  test('should show user dropdown menu', async ({ page }) => {
    await loginAsAdmin(page);

    // Click the dropdown trigger in header (the button with avatar)
    const dropdownTrigger = page.locator('header [data-state]').last();
    await dropdownTrigger.click();

    // Menu should show sign out option
    await expect(page.getByRole('menuitem', { name: /Sign out/i })).toBeVisible({ timeout: 5000 });
  });

  test('theme toggle should work from topbar', async ({ page }) => {
    await loginAsAdmin(page);

    // The page starts in dark mode. Click the theme toggle (sun icon in dark mode)
    const themeToggle = page.locator('header button').filter({ has: page.locator('svg') }).nth(1);
    await themeToggle.click();

    // Check that theme class changed
    const htmlClass = await page.locator('html').getAttribute('class');
    // It should have toggled from dark to light
    expect(htmlClass).not.toContain('dark');
  });
});
