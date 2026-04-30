import { expect, test } from '@playwright/test';

test('desktop layout presents a polished token-based workspace', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop-only layout assertion');
  await page.goto('/');

  const hero = page.locator('.hero-compact');
  await expect(hero).toBeVisible();
  await expect(page.getByRole('heading', { name: /convierte markdown/i })).toBeVisible();

  const editorPanel = page.locator('.panel--editor');
  const statusPanel = page.locator('.panel--status');
  await expect(editorPanel).toBeVisible();
  await expect(statusPanel).toBeVisible();

  await expect(editorPanel).toHaveCSS('border-radius', '24px');
  await expect(statusPanel).toHaveCSS('border-radius', '24px');
  await expect(page.locator('.editor')).toHaveCSS('background-color', 'rgb(247, 247, 245)');

  const editorBox = await editorPanel.boundingBox();
  const statusBox = await statusPanel.boundingBox();
  expect(editorBox?.width ?? 0).toBeGreaterThan(statusBox?.width ?? 0);
  expect(editorBox?.x ?? 0).toBeLessThan(statusBox?.x ?? 0);

  await expect(page.getByRole('button', { name: /convertir y descargar/i })).toHaveCSS('border-radius', '999px');
});

test('mobile keeps actions reachable and opens settings as a bottom sheet', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only layout assertion');
  await page.goto('/');

  const editorPanel = page.locator('.panel--editor');
  const statusPanel = page.locator('.panel--status');
  const editorBox = await editorPanel.boundingBox();
  const statusBox = await statusPanel.boundingBox();
  expect(editorBox?.x).toBe(statusBox?.x);
  expect(editorBox?.width).toBe(statusBox?.width);

  await page.getByRole('button', { name: 'Configuración' }).click();
  const dialog = page.getByRole('dialog', { name: /configuración/i });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS('border-bottom-left-radius', '0px');
  await expect(dialog).toHaveCSS('border-bottom-right-radius', '0px');
});
