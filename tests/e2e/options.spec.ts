import { test, expect } from '@playwright/test';

test.describe('1. Navigation, Validation, and Persistence of Options', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to options, modify values, and persist across page reload', async ({ page }) => {
    // Open Options
    await page.getByRole('button', { name: 'OPTIONS' }).click();
    await expect(page.getByRole('heading', { name: 'OPTIONS' })).toBeVisible();

    // Verify initial default labels
    await expect(page.getByText('Game session time')).toBeVisible();
    await expect(page.getByText('Enemy spawn time')).toBeVisible();

    // Modify Game Session Time (Increase: 120 -> 130s)
    const increaseDurationBtn = page.getByRole('button', { name: 'Increase session duration' });
    await increaseDurationBtn.click();

    // Modify Enemy Spawn Time (Increase: 3 -> 3.5 -> 4s)
    const increaseSpawnBtn = page.getByRole('button', { name: 'Increase spawn interval' });
    await increaseSpawnBtn.click();
    await increaseSpawnBtn.click();

    // Verify updated values displayed
    await expect(page.getByText('130 s')).toBeVisible();
    await expect(page.getByText('4 s')).toBeVisible();

    // Click SAVE and then Main Menu
    await page.getByRole('button', { name: 'SAVE' }).click();
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible();

    // Reload Page
    await page.reload();
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });

    // Open Options again and verify persistence
    await page.getByRole('button', { name: 'OPTIONS' }).click();
    await expect(page.getByText('130 s')).toBeVisible();
    await expect(page.getByText('4 s')).toBeVisible();

    // Verify bounds validation (Cannot exceed 180s)
    for (let i = 0; i < 10; i++) {
      if (await increaseDurationBtn.isEnabled()) {
        await increaseDurationBtn.click();
      }
    }
    await expect(page.getByText('180 s', { exact: true })).toBeVisible();
    await expect(increaseDurationBtn).toBeDisabled();

    // Return to main menu
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
  });
});
