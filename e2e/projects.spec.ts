import { expect, test } from '@playwright/test';

const importPayload = {
  version: 1,
  project: {
    id: 'import-id',
    name: 'Imported Demo',
    createdAt: '2026-05-18T10:00:00.000Z',
    updatedAt: '2026-05-18T10:00:00.000Z',
    state: {
      activeTab: 'text',
      text: 'Imported Watermark',
      font: 'Arial',
      size: 36,
      style: '',
      color: '#ffffff',
      wmImgScale: 25,
      position: 'free',
      opacity: 60,
      rotation: -30,
      margin: 20,
      freeX: 0.5,
      freeY: 0.5,
      mode: 'single',
      projectName: 'Imported Demo',
      currentProjectId: null,
      currentProjectCreatedAt: null,
    },
  },
};

test.describe('Projects Explorer flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/projects');
    await page.evaluate(async () => {
      localStorage.clear();
      await indexedDB.deleteDatabase('mark-your-picture-db');
    });
    await page.reload();
    await expect(page).toHaveURL(/#\/projects$/);
    await expect(
      page.getByPlaceholder(/Name this project|Projektname eingeben/),
    ).toBeVisible();
  });

  test('supports save, open, delete, import, and export', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Name this project');
    await nameInput.fill('Flow Alpha');
    await page.getByRole('button', { name: 'Save current' }).click();

    const alphaCard = page.locator('article', { hasText: 'Flow Alpha' });
    await expect(alphaCard).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await alphaCard.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('flow-alpha');

    await alphaCard.getByRole('button', { name: 'Duplicate' }).click();
    const duplicateCard = page.locator('article', { hasText: 'Flow Alpha Copy' });
    await expect(duplicateCard).toBeVisible();

    await duplicateCard.getByRole('button', { name: 'Delete' }).click();
    await expect(duplicateCard).toHaveCount(0);

    await nameInput.fill('Temporary Draft');
    await alphaCard.getByRole('button', { name: 'Open' }).click();
    await expect(page).toHaveURL(/#\/$/);

    await page.goto('./#/projects');
    await expect(nameInput).toHaveValue('Flow Alpha');

    const importInput = page.locator('input[type="file"]').first();
    await importInput.setInputFiles({
      name: 'import.myp-project.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(importPayload), 'utf-8'),
    });

    await expect(page.locator('article', { hasText: 'Imported Demo (Imported)' })).toBeVisible();
  });
});
