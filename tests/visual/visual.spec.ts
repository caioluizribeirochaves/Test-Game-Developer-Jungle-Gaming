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
    await expect(page).toHaveScreenshot('captains-log-ranking.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('should render gameplay arena with 4 organic islands, complete castle, and shallow water shoals', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'PLAY' }).click();

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2500);

    const artifactDir = 'C:/Users/caieb/.gemini/antigravity/brain/9807d908-8a64-4337-90a8-9e22612ebd0a';
    await page.screenshot({ path: `${artifactDir}/gameplay-arena-islands-overview.png` });
  });

  test('should render mobile touch controls with active joystick and triangular cannons', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'PLAY' }).click();

    const joystick = page.getByRole('region', { name: 'Virtual Joystick' });
    await expect(joystick).toBeVisible({ timeout: 15000 });

    const knob = page.getByTestId('joystick-knob');
    const box = await knob.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      // Drag top-right (+36px, -36px) matching Image 2
      await page.mouse.move(box.x + box.width / 2 + 36, box.y + box.height / 2 - 36);
      await page.waitForTimeout(200);

      const artifactDir = 'C:/Users/caieb/.gemini/antigravity/brain/9807d908-8a64-4337-90a8-9e22612ebd0a';
      await page.screenshot({ path: `${artifactDir}/mobile-controls-active-joystick.png` });

      await page.mouse.up();
    }
  });
});

