import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsTeacher, loginAsParent } from './helpers';

test.describe('Dashboard', () => {
  test('admin dashboard shows all stat cards', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText('Total Students')).toBeVisible();
    await expect(page.getByText('Attendance Rate')).toBeVisible();
    await expect(page.getByText('Revenue Collected')).toBeVisible();
    await expect(page.getByText('Teachers')).toBeVisible();
  });

  test('admin dashboard shows welcome message', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
  });

  test('dashboard shows attendance trend chart', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText('Attendance Trend')).toBeVisible();
  });

  test('dashboard shows recent announcements', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText('Recent Announcements')).toBeVisible();
  });

  test('dashboard shows recent payments', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText('Recent Payments')).toBeVisible();
  });

  test('teacher dashboard shows correct greeting', async ({ page }) => {
    await loginAsTeacher(page);

    await expect(page.getByText('Teacher Dashboard')).toBeVisible();
  });

  test('parent dashboard shows correct greeting', async ({ page }) => {
    await loginAsParent(page);

    await expect(page.getByText('Parent Dashboard')).toBeVisible();
  });
});
