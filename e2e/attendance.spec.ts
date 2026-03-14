import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Attendance Module', () => {
  test('should display attendance page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/attendance');

    await expect(page.getByRole('heading', { name: 'Attendance' })).toBeVisible();
    await expect(page.getByText('Mark and manage daily attendance')).toBeVisible();
  });

  test('should show View Reports button', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/attendance');

    await expect(page.getByRole('link', { name: /View Reports/i })).toBeVisible();
  });

  test('should show class selector', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/attendance');

    await expect(page.getByText('Select class')).toBeVisible();
  });

  test('should show date picker', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/attendance');

    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
  });

  test('should load students when class is selected', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/attendance');

    // Open class selector and pick first class
    await page.getByText('Select class').click();
    const firstOption = page.getByRole('option').first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    await firstOption.click();

    // Should show student table
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Should show Save Attendance button
    await expect(page.getByRole('button', { name: /Save Attendance/i })).toBeVisible();
  });

  test('should show attendance summary when class is selected', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/attendance');

    await page.getByText('Select class').click();
    const firstOption = page.getByRole('option').first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    await firstOption.click();

    // Wait for data to load
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Should show summary stats - check for the percentage which is always present
    await expect(page.getByText(/%/).first()).toBeVisible();
  });

  test('should toggle attendance status on click', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/attendance');

    await page.getByText('Select class').click();
    const firstOption = page.getByRole('option').first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    await firstOption.click();

    // Wait for students
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Find first status badge and click to toggle
    const firstBadge = page.locator('tbody tr').first().locator('button');
    const initialText = await firstBadge.innerText();
    await firstBadge.click();
    const newText = await firstBadge.innerText();

    expect(initialText).not.toBe(newText);
  });

  test('should navigate to attendance reports', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/attendance');

    await page.getByRole('link', { name: /View Reports/i }).click();
    await page.waitForURL('**/attendance/reports', { timeout: 10000 });
    await expect(page).toHaveURL(/\/attendance\/reports/);
  });
});
