import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsParent } from './helpers';

test.describe('Students Module', () => {
  test('should display students list page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/students');

    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible();
    await expect(page.getByText('Manage student records')).toBeVisible();
  });

  test('should show Add Student button for admin', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/students');

    await expect(page.getByRole('link', { name: /Add Student/i })).toBeVisible();
  });

  test('should display student table with data', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/students');

    // Check table headers exist
    const headers = page.locator('thead th');
    await expect(headers.first()).toBeVisible({ timeout: 10000 });
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(4);
  });

  test('should show student data from seed', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/students');

    // Wait for table to load with data
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 10000 });

    // Should have students loaded
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should search students', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/students');

    const searchInput = page.getByPlaceholder('Search students...');
    await expect(searchInput).toBeVisible();

    // Type a search query and submit
    await searchInput.fill('test');
    await searchInput.press('Enter');

    // URL should contain search param
    await expect(page).toHaveURL(/search=test/);
  });

  test('should navigate to add student form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/students');

    await page.getByRole('link', { name: /Add Student/i }).click();
    await page.waitForURL('**/students/new', { timeout: 10000 });

    await expect(page.getByRole('heading', { name: /Add Student|New Student/i })).toBeVisible();
  });

  test('should display add student form fields', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/students/new');

    await expect(page.getByLabel(/First Name/i)).toBeVisible();
    await expect(page.getByLabel(/Last Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });

  test('should navigate to student detail page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/students');

    // Click first student link
    const firstStudent = page.locator('tbody tr a').first();
    await expect(firstStudent).toBeVisible({ timeout: 10000 });
    await firstStudent.click();

    await page.waitForURL('**/students/**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/students\/.+/);
  });

  test('parent should not see Add Student button', async ({ page }) => {
    await loginAsParent(page);
    await page.goto('/students');

    await expect(page.getByRole('link', { name: /Add Student/i })).not.toBeVisible();
  });
});
