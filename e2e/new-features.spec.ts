import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsParent } from './helpers';

test.describe('Timetable Module', () => {
  test('should display timetable page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/timetable');
    await expect(page.getByRole('heading', { name: /Timetable/i })).toBeVisible();
  });

  test('should show class selector', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/timetable');
    await expect(page.getByText(/Select class|select a class/i)).toBeVisible();
  });

  test('should navigate to add period form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/timetable/new');
    await expect(page.getByRole('heading', { name: /Add Period|New Period|Timetable/i })).toBeVisible();
  });
});

test.describe('Teacher Management', () => {
  test('should display teachers page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/teachers');
    await expect(page.getByRole('heading', { name: /Teachers/i })).toBeVisible();
  });

  test('should show teacher cards or list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/teachers');
    // Should have some content loaded
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Examination Management', () => {
  test('should display examinations page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/examinations');
    await expect(page.getByRole('heading', { name: /Exam/i })).toBeVisible();
  });

  test('should navigate to create exam form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/examinations/new');
    await expect(page.getByRole('heading', { name: /Exam/i })).toBeVisible();
  });
});

test.describe('Admissions Module', () => {
  test('should display admissions page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admissions');
    await expect(page.getByRole('heading', { name: /Admissions/i })).toBeVisible();
  });

  test('should show stat cards', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admissions');
    await expect(page.getByText(/Total Applications|Applications/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to new application form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admissions/new');
    await expect(page.getByRole('heading', { name: /Application|Admission/i })).toBeVisible();
  });
});

test.describe('Library Module', () => {
  test('should display library page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/library');
    await expect(page.getByRole('heading', { name: /Library/i })).toBeVisible();
  });

  test('should navigate to add book form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/library/new');
    await expect(page.getByRole('heading', { name: /Book|Library/i })).toBeVisible();
  });

  test('should navigate to book issues page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/library/issues');
    await expect(page.getByRole('heading', { name: /Issue|Book/i })).toBeVisible();
  });
});

test.describe('Events Module', () => {
  test('should display events page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/events');
    await expect(page.getByRole('heading', { name: /Events/i })).toBeVisible();
  });

  test('should navigate to new event form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/events/new');
    await expect(page.getByRole('heading', { name: /Event/i })).toBeVisible();
  });
});

test.describe('Transport Module', () => {
  test('should display transport page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/transport');
    await expect(page.getByRole('heading', { name: /Transport/i })).toBeVisible();
  });
});

test.describe('Inventory Module', () => {
  test('should display inventory page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/inventory');
    await expect(page.getByRole('heading', { name: /Inventory/i })).toBeVisible();
  });

  test('should navigate to add item form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/inventory/new');
    await expect(page.getByRole('heading', { name: /Inventory|Item/i })).toBeVisible();
  });
});

test.describe('Payroll Module', () => {
  test('should display payroll page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/payroll');
    await expect(page.getByRole('heading', { name: /Payroll/i })).toBeVisible();
  });

  test('should navigate to process payroll form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/payroll/new');
    await expect(page.getByRole('heading', { name: /Payroll/i })).toBeVisible();
  });
});

test.describe('Messages Module', () => {
  test('should display messages page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/messages');
    await expect(page.getByRole('heading', { name: /Messages/i })).toBeVisible();
  });

  test('should navigate to compose message', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/messages/new');
    await expect(page.getByRole('heading', { name: /Message/i })).toBeVisible();
  });
});

test.describe('Data Export', () => {
  test('should display export page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports/export');
    await expect(page.getByRole('heading', { name: /Export/i })).toBeVisible();
  });

  test('should show export options', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reports/export');
    await expect(page.getByText('Students')).toBeVisible();
    await expect(page.getByText('Attendance')).toBeVisible();
    await expect(page.getByText('Fee Payments')).toBeVisible();
  });
});

test.describe('New Navigation Items', () => {
  test('admin sidebar shows all new nav items', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByRole('link', { name: 'Teachers' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Timetable' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Exams' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admissions' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Messages' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Transport' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inventory' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Payroll' })).toBeVisible();
  });

  test('parent should not see admin-only nav items', async ({ page }) => {
    await loginAsParent(page);

    await expect(page.getByRole('link', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Timetable' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Teachers' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Admissions' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Inventory' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Payroll' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Hostel' })).not.toBeVisible();
  });
});

test.describe('Hostel Management', () => {
  test('should display hostel page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/hostel');
    await expect(page.getByRole('heading', { name: /Hostel/i })).toBeVisible();
  });

  test('should navigate to add room form', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/hostel/new');
    await expect(page.getByRole('heading', { name: /Room|Hostel/i })).toBeVisible();
  });

  test('should navigate to allocations page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/hostel/allocations');
    await expect(page.getByRole('heading', { name: /Allocation|Hostel/i })).toBeVisible();
  });
});

test.describe('AI Analytics', () => {
  test('should display analytics page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /Analytics/i })).toBeVisible();
  });

  test('should show risk assessment stats', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/analytics');
    await expect(page.getByText(/At-Risk Students/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/On Track/i)).toBeVisible();
  });

  test('should show student risk table', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/analytics');
    await expect(page.getByText(/Student Risk Assessment/i)).toBeVisible({ timeout: 10000 });
  });
});
