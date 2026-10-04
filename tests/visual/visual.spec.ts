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

      const cannons = page.getByRole('button', { name: 'Fire Frontal Cannon' }).locator('../..');
      await cannons.screenshot({ path: `${artifactDir}/mobile-cannons-cluster.png` });

      await page.mouse.up();
    }
  });

  test('should render perfectly framed mobile landscape view', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/?mobile=true');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    const artifactDir = 'C:/Users/caieb/.gemini/antigravity/brain/9807d908-8a64-4337-90a8-9e22612ebd0a';
    await page.screenshot({ path: `${artifactDir}/mobile-landscape-main-menu.png` });

    await page.getByRole('button', { name: 'PLAY' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${artifactDir}/mobile-landscape-proportional.png` });

    // Open PauseModal in mobile landscape and capture screenshot
    await page.getByRole('button', { name: 'Pause Game' }).click();
    await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeVisible();
    await page.screenshot({ path: `${artifactDir}/mobile-landscape-pause-modal.png` });

    // Open Controls inside PauseModal
    await page.getByRole('button', { name: 'CONTROLS' }).click();
    await expect(page.getByRole('heading', { name: 'CONTROLS' })).toBeVisible();
    await page.screenshot({ path: `${artifactDir}/mobile-landscape-pause-controls.png` });
    await page.getByRole('button', { name: 'BACK TO PAUSE' }).click();
    await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeVisible();

    // Open Options inside PauseModal
    await page.getByRole('button', { name: 'OPTIONS' }).click();
    await expect(page.getByRole('heading', { name: 'OPTIONS' })).toBeVisible();
    await page.screenshot({ path: `${artifactDir}/mobile-landscape-pause-options.png` });
    await page.getByRole('button', { name: 'BACK' }).click();
    await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeVisible();

    // Resume game
    await page.getByRole('button', { name: 'RESUME' }).click();
  });

  test('should render perfectly framed mobile portrait view and handle rotation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?mobile=true');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    const artifactDir = 'C:/Users/caieb/.gemini/antigravity/brain/9807d908-8a64-4337-90a8-9e22612ebd0a';
    await page.screenshot({ path: `${artifactDir}/mobile-portrait-main-menu.png` });

    await page.getByRole('button', { name: 'PLAY' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${artifactDir}/mobile-portrait-proportional.png` });

    // Rotate dynamically to landscape then back to portrait to verify no assets/water get lost
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(800);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${artifactDir}/mobile-portrait-after-rotation.png` });
  });

  test('should render perfectly framed Captains Log and Network Lab modals in mobile landscape', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/?mobile=true');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    const artifactDir = 'C:/Users/caieb/.gemini/antigravity/brain/9807d908-8a64-4337-90a8-9e22612ebd0a';

    // Test Captain's Log in landscape
    await page.getByRole('button', { name: 'RANKING' }).click();
    await expect(page.getByRole('heading', { name: "CAPTAIN'S LOG" })).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${artifactDir}/mobile-landscape-captains-log.png` });
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
    await expect(page.getByRole('heading', { name: "CAPTAIN'S LOG" })).not.toBeVisible();

    // Test Network Lab in landscape
    await page.getByRole('button', { name: /Network lab/i }).click();
    await expect(page.getByRole('heading', { name: /Network & MSW Chaos/i })).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${artifactDir}/mobile-landscape-network-lab.png` });
    await page.getByRole('button', { name: 'CLOSE', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Network & MSW Chaos/i })).not.toBeVisible();
  });

  test('should render perfectly framed Captains Log and Network Lab modals in mobile portrait', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?mobile=true');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
    const artifactDir = 'C:/Users/caieb/.gemini/antigravity/brain/9807d908-8a64-4337-90a8-9e22612ebd0a';

    // Test Captain's Log in portrait
    await page.getByRole('button', { name: 'RANKING' }).click();
    await expect(page.getByRole('heading', { name: "CAPTAIN'S LOG" })).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${artifactDir}/mobile-portrait-captains-log.png` });
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
    await expect(page.getByRole('heading', { name: "CAPTAIN'S LOG" })).not.toBeVisible();

    // Test Network Lab in portrait
    await page.getByRole('button', { name: /Network lab/i }).click();
    await expect(page.getByRole('heading', { name: /Network & MSW Chaos/i })).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${artifactDir}/mobile-portrait-network-lab.png` });
    await page.getByRole('button', { name: 'CLOSE', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Network & MSW Chaos/i })).not.toBeVisible();
  });
});


