import { test, expect } from '@playwright/test';

test.describe('3-7. Gameplay, Combat, Weapons, Pause, and Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible({ timeout: 15000 });
  });

  test('should enter game, display HUD, execute movements and weapons, and support pause/resume', async ({ page }) => {
    // Start Game
    await page.getByRole('button', { name: 'PLAY' }).click();

    // Verify Pixi Canvas and HUD are present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Check HUD elements
    await expect(page.getByText('100 / 100')).toBeVisible();
    await expect(page.getByAltText('Score')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pause Game' })).toBeVisible();

    // Test Keyboard Movement and Weapon Controls
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyD');
    await page.waitForTimeout(200);

    // Test Frontal Cannon
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    // Test Port & Starboard Broadsides
    await page.keyboard.press('KeyQ');
    await page.waitForTimeout(300);
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(300);

    // Test Pause via UI Button
    await page.getByRole('button', { name: 'Pause Game' }).click();
    await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeVisible();
    await expect(page.getByText('Ready when you are.')).toBeVisible();

    // Resume Game
    await page.getByRole('button', { name: 'RESUME' }).click();
    await expect(page.getByRole('heading', { name: 'PAUSED' })).not.toBeVisible();

    // Test Pause via ESC key
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeVisible();

    // Test Abandon Match: returns to main menu without registering match
    await page.getByRole('button', { name: 'MAIN MENU' }).click();
    await expect(page.getByRole('button', { name: 'PLAY' })).toBeVisible();
  });

  test('should support virtual touch controls for steering and cannons', async ({ page, isMobile }) => {
    await page.getByRole('button', { name: 'PLAY' }).click();

    // Verify cannon buttons (present on both mobile and desktop)
    const bowBtn = page.getByRole('button', { name: 'Fire Frontal Cannon' });
    const portBtn = page.getByRole('button', { name: 'Fire Port Broadside' });
    const stbdBtn = page.getByRole('button', { name: 'Fire Starboard Broadside' });

    await expect(bowBtn).toBeVisible();
    await expect(portBtn).toBeVisible();
    await expect(stbdBtn).toBeVisible();

    if (isMobile) {
      // Mobile has virtual joystick on the left (Image 2) and triangular cannon buttons (Image 1)
      const joystick = page.getByRole('region', { name: 'Virtual Joystick' });
      const joystickKnob = page.getByTestId('joystick-knob');
      await expect(joystick).toBeVisible();
      await expect(joystickKnob).toBeVisible();

      // Trigger virtual touch interactions with joystick
      await joystick.dispatchEvent('pointerdown', { clientX: 70, clientY: 40 });
      await page.waitForTimeout(150);
      await joystick.dispatchEvent('pointerup');
    } else {
      // Desktop has movement buttons
      const turnLeftBtn = page.getByRole('button', { name: 'Turn Left' });
      const forwardBtn = page.getByRole('button', { name: 'Move Forward' });
      const turnRightBtn = page.getByRole('button', { name: 'Turn Right' });

      await expect(turnLeftBtn).toBeVisible();
      await expect(forwardBtn).toBeVisible();
      await expect(turnRightBtn).toBeVisible();

      await forwardBtn.dispatchEvent('pointerdown');
      await page.waitForTimeout(150);
      await forwardBtn.dispatchEvent('pointerup');
    }

    // Trigger cannon fires
    await bowBtn.dispatchEvent('pointerdown');
    await page.waitForTimeout(100);
    await bowBtn.dispatchEvent('pointerup');

    await portBtn.dispatchEvent('pointerdown');
    await page.waitForTimeout(100);
    await portBtn.dispatchEvent('pointerup');

    await stbdBtn.dispatchEvent('pointerdown');
    await page.waitForTimeout(100);
    await stbdBtn.dispatchEvent('pointerup');
  });
});
