import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsParent } from './helpers';

test.describe('Announcements Module', () => {
  test('should display announcements page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/announcements');

    await expect(page.getByRole('heading', { name: 'Announcements' })).toBeVisible();
    await expect(page.getByText('School announcements and notices')).toBeVisible();
  });

  test('admin should see New Announcement button', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/announcements');

    await expect(page.getByRole('link', { name: /New Announcement/i })).toBeVisible();
  });

  test('parent should not see New Announcement button', async ({ page }) => {
    await loginAsParent(page);
    await page.goto('/announcements');

    await expect(page.getByRole('link', { name: /New Announcement/i })).not.toBeVisible();
  });

  test('should display announcements from seed data', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/announcements');

    // Should have announcement cards
    const cards = page.locator('[class*="card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to new announcement form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/announcements');

    await page.getByRole('link', { name: /New Announcement/i }).click();
    await page.waitForURL('**/announcements/new', { timeout: 10000 });

    await expect(page.getByRole('heading', { name: 'New Announcement' })).toBeVisible();
  });

  test('new announcement form should have required fields', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/announcements/new');

    await expect(page.getByPlaceholder('Announcement title')).toBeVisible();
    await expect(page.getByPlaceholder('Write your announcement...')).toBeVisible();
    await expect(page.getByRole('button', { name: /Publish/i })).toBeVisible();
  });
});
