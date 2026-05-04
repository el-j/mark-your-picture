import path from 'node:path';
import { expect, test } from '@playwright/test';

const FIXTURE_IMAGE = path.resolve(__dirname, 'fixtures/test-image.png');

test.describe('Drop zone', () => {
  test('drop zone is visible on initial load', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#drop-zone')).toBeVisible();
    await expect(page.getByText('click to browse')).toBeVisible();
  });

  test('selecting a file loads the image and shows canvas', async ({ page }) => {
    await page.goto('./');
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles(FIXTURE_IMAGE);
    // After loading, canvas should appear instead of the drop zone
    await expect(page.locator('#drop-zone')).not.toBeVisible();
    await expect(page.locator('canvas#canvas')).toBeVisible();
    // Toast notification should appear
    await expect(page.getByText('Image loaded ✓')).toBeVisible({ timeout: 3000 });
  });

  test('"New Image" button clears canvas and restores drop zone', async ({ page }) => {
    await page.goto('./');
    await page.locator('#file-input').setInputFiles(FIXTURE_IMAGE);
    await expect(page.locator('canvas#canvas')).toBeVisible();
    await page.getByRole('button', { name: 'New Image' }).click();
    await expect(page.locator('#drop-zone')).toBeVisible();
  });
});

test.describe('Watermark controls (with image)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.locator('#file-input').setInputFiles(FIXTURE_IMAGE);
    await expect(page.locator('canvas#canvas')).toBeVisible();
  });

  test('apply button is enabled and triggers apply', async ({ page }) => {
    const applyBtn = page.locator('#btn-apply');
    await expect(applyBtn).toBeEnabled();
    await applyBtn.click();
    // Button stays visible (no error thrown)
    await expect(applyBtn).toBeVisible();
  });

  test('download button is enabled after image is loaded', async ({ page }) => {
    await expect(page.locator('#btn-download')).toBeEnabled();
  });

  test('reset button is visible', async ({ page }) => {
    await expect(page.locator('#btn-reset')).toBeVisible();
  });
});
