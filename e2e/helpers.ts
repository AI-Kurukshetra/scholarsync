import { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /Admin/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

export async function loginAsTeacher(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /Teacher/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

export async function loginAsParent(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /Parent/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}
