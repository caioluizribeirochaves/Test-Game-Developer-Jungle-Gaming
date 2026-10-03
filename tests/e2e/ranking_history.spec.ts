import { test, expect } from '@playwright/test';

test.describe('10-12. Ranking, Match History, Idempotency and Sync', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
  });

  test('should display fleet rankings, navigate pages, and switch to match history', async ({ page }) => {
    // Open Ranking
    await page.getByRole('button', { name: 'RANKING' }).click();
    await expect(page.getByRole('heading', { name: "CAPTAIN'S LOG" })).toBeVisible();

    // Verify Ranking Table Headers
    await expect(page.getByRole('columnheader', { name: 'RANK' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'CAPTAIN' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'POINTS' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'PLAYED' })).toBeVisible();

    // Verify top player from fixtures
    await expect(page.getByText('Captain Flint')).toBeVisible();

    // Check pagination
    const nextBtn = page.getByRole('button', { name: 'Next Page' });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await expect(page.getByText(/PAGE 2 OF/)).toBeVisible();
    }

    // Switch to Match History Tab
    await page.getByRole('button', { name: 'MATCH HISTORY' }).click();
    await expect(page.getByText(/CAPTAIN JACK/)).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'DATE' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'DURATION' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'RESULT' })).toBeVisible();

    // Return to Main Menu
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible();
  });
});
