import { expect, test } from '@playwright/test';

test.describe('City search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows empty state on initial load', async ({ page }) => {
    await expect(page.getByText(/search for a city/i)).toBeVisible();
  });

  test('searches for a valid city and shows weather card', async ({ page }) => {
    await page.getByRole('searchbox').fill('London');
    await page.getByRole('button', { name: 'Search weather', exact: true }).click();

    await expect(page.getByTestId('weather-card')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /London/i })).toBeVisible();
  });

  test('shows error for an unknown city', async ({ page }) => {
    await page.getByRole('searchbox').fill('zzzyyyxxx_not_a_city');
    await page.getByRole('button', { name: 'Search weather', exact: true }).click();

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('alert')).toContainText(/not found/i);
  });
});
