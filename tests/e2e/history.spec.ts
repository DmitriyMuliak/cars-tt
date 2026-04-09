import { expect, test } from '@playwright/test';

async function searchCity(page: import('@playwright/test').Page, city: string) {
  await page.getByRole('searchbox').fill(city);
  await page.getByRole('button', { name: 'Search weather', exact: true }).click();
  await expect(page.getByTestId('weather-card')).toBeVisible({ timeout: 10_000 });
}

test.describe('Search history', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('searched city appears in history after successful fetch', async ({ page }) => {
    await searchCity(page, 'London');

    await expect(page.getByRole('button', { name: /search weather for London/i })).toBeVisible({
      timeout: 5_000,
    });
  });

  test('searching the same city again keeps only one entry and does not reorder', async ({
    page,
  }) => {
    await searchCity(page, 'London');
    await searchCity(page, 'Paris');

    // Re-select London from history — should not move it to top
    await page.getByRole('button', { name: /search weather for London/i }).click();
    await expect(page.getByTestId('weather-card')).toBeVisible({ timeout: 10_000 });

    const historyButtons = page.getByRole('button', { name: /search weather for London/i });
    await expect(historyButtons).toHaveCount(1);

    // Paris was added last → should still be first
    const allItems = page.getByRole('button', { name: /search weather for/i });
    await expect(allItems.first()).toContainText('Paris');
  });

  test('clicking a history item re-fetches weather for that city', async ({ page }) => {
    await searchCity(page, 'London');
    await searchCity(page, 'Paris');

    await page.getByRole('button', { name: /search weather for London/i }).click();
    await expect(page.getByTestId('weather-card')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /London/i })).toBeVisible();
  });

  test('clicking × removes a city from history and shows undo toast', async ({ page }) => {
    await searchCity(page, 'London');
    await expect(page.getByRole('button', { name: /search weather for London/i })).toBeVisible({
      timeout: 5_000,
    });

    await page.getByRole('button', { name: /remove London from history/i }).click();

    await expect(
      page.getByRole('button', { name: /search weather for London/i }),
    ).not.toBeVisible();
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('status')).toContainText(/London/);
  });

  test('clicking Undo restores the removed city', async ({ page }) => {
    await searchCity(page, 'London');
    await expect(page.getByRole('button', { name: /search weather for London/i })).toBeVisible({
      timeout: 5_000,
    });

    await page.getByRole('button', { name: /remove London from history/i }).click();
    await page.getByRole('button', { name: /undo removal/i }).click();

    await expect(page.getByRole('button', { name: /search weather for London/i })).toBeVisible();
  });

  test('"Clear all" removes all history and shows undo toast', async ({ page }) => {
    await searchCity(page, 'London');
    await expect(page.getByRole('button', { name: /search weather for London/i })).toBeVisible({
      timeout: 5_000,
    });

    await page.getByRole('button', { name: /clear all search history/i }).click();

    await expect(page.getByRole('button', { name: /search weather for/i })).not.toBeVisible();
    await expect(page.getByRole('status')).toBeVisible();
  });
});
