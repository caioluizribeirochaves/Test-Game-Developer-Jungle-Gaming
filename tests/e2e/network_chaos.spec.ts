import { test, expect } from '@playwright/test';

test.describe('6. Network Conditions and Fault Injection (MSW Chaos)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
  });

  test('should open network simulator, toggle empty lists, and verify UI handling', async ({ page }) => {
    // Open Network Simulator via UI button or shortcut
    const simBtn = page.getByRole('button', { name: 'Network Simulator' });
    if (await simBtn.isVisible()) {
      await simBtn.click();
    } else {
      await page.keyboard.press('Control+Shift+KeyD');
    }

    await expect(page.getByText('Network & MSW Chaos Simulator')).toBeVisible();

    // Select Empty Lists Mode
    await page.getByText('⚪ Empty Lists').click();
    await page.getByRole('button', { name: 'CLOSE SIMULATOR' }).click();

    // Open Ranking
    await page.getByRole('button', { name: 'RANKING' }).click();
    await expect(page.getByText('No voyages recorded for this configuration yet.')).toBeVisible();

    // Switch to History
    await page.getByRole('button', { name: 'MATCH HISTORY' }).click();
    await expect(page.getByText(/You haven't fought any battles yet/)).toBeVisible();

    // Reset back to Normal
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
    if (await simBtn.isVisible()) {
      await simBtn.click();
    } else {
      await page.keyboard.press('Control+Shift+KeyD');
    }
    await page.getByText('Reset DB & Restore Default Fixtures').click();
    await page.getByRole('button', { name: 'CLOSE SIMULATOR' }).click();
  });

  test('should simulate HTTP 500 and verify graceful error states with retry option', async ({ page }) => {
    const simBtn = page.getByRole('button', { name: 'Network Simulator' });
    if (await simBtn.isVisible()) {
      await simBtn.click();
    } else {
      await page.keyboard.press('Control+Shift+KeyD');
    }

    // Select HTTP 500
    await page.getByText('🔴 HTTP 500 Internal Error').click();
    await page.getByRole('button', { name: 'CLOSE SIMULATOR' }).click();

    // Open Ranking and verify error fallback
    await page.getByRole('button', { name: 'RANKING' }).click();
    await expect(page.getByText('Failed to load ranking records.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry Query' })).toBeVisible();

    // Reopen Simulator and restore to Normal
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
    if (await simBtn.isVisible()) {
      await simBtn.click();
    } else {
      await page.keyboard.press('Control+Shift+KeyD');
    }
    await page.getByText('🟢 Normal (Success)').click();
    await page.getByRole('button', { name: 'CLOSE SIMULATOR' }).click();

    // Verify recovery
    await page.getByRole('button', { name: 'RANKING' }).click();
    await expect(page.getByText('Captain Flint')).toBeVisible();
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
  });
});
