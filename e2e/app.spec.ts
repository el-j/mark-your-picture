import { expect, test } from '@playwright/test';

test.describe('App shell', () => {
  test('page title is correct', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle('Mark Your Picture');
  });

  test('header renders logo and tagline', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('img', { name: 'Mark Your Picture logo' })).toBeVisible();
    await expect(page.getByText('100% client-side · no upload')).toBeVisible();
  });

  test('desktop navigation links are visible', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('link', { name: 'Tool' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Imprint' }).first()).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('./#/about');
    await expect(page.getByRole('heading', { name: 'About Mark Your Picture' })).toBeVisible();
  });

  test('imprint page loads', async ({ page }) => {
    await page.goto('./#/imprint');
    await expect(page.getByRole('heading', { name: 'Imprint' })).toBeVisible();
  });

  test('language switcher switches to German', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('combobox', { name: 'Language' }).selectOption('de');
    // tagline changes language
    await expect(page.getByText('100% client-seitig · kein Upload')).toBeVisible();
    // switch back
    await page.getByRole('combobox', { name: 'Sprache' }).selectOption('en');
    await expect(page.getByText('100% client-side · no upload')).toBeVisible();
  });

  test('theme toggle switches theme', async ({ page }) => {
    await page.goto('./');
    const html = page.locator('html');
    const initial = await html.getAttribute('data-theme');
    await page.getByRole('button', { name: /switch to/i }).click();
    const toggled = await html.getAttribute('data-theme');
    expect(toggled).not.toBe(initial);
  });
});
