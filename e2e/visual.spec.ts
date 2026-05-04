import { expect, test } from '@playwright/test';

// Visual snapshots — run `npm run e2e:update` to refresh baselines after
// intentional UI changes.

test.describe('Visual regression', () => {
  test('tool page — initial state (drop zone)', async ({ page }) => {
    await page.goto('./');
    // Wait for fonts/icons to settle
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('tool-initial.png', { fullPage: true });
  });

  test('about page', async ({ page }) => {
    await page.goto('./#/about');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('about.png', { fullPage: true });
  });

  test('imprint page', async ({ page }) => {
    await page.goto('./#/imprint');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('imprint.png', { fullPage: true });
  });
});
