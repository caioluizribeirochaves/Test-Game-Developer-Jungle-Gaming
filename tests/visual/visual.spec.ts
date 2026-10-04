import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('should match Main Menu visual baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    // Stable menu screenshot
    await expect(page).toHaveScreenshot('main-menu.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('should match Options screen visual baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'OPTIONS' }).click();
    await expect(page.getByRole('heading', { name: 'OPTIONS' })).toBeVisible();

    await expect(page).toHaveScreenshot('options-screen.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('should match Captains Log Ranking visual baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'RANKING' }).click();
    await expect(page.getByRole('heading', { name: "CAPTAIN'S LOG" })).toBeVisible();

    await expect(page).toHaveScreenshot('captains-log-ranking.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});

