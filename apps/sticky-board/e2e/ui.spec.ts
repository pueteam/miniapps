import { expect, test } from '@playwright/test';

test('creates, drags and persists a sticky note', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Drag flow is covered on desktop');
  await page.goto('/');

  await page.getByRole('button', { name: /nueva nota/i }).click();
  const editor = page.getByLabel(/contenido de la nota/i);
  await editor.dblclick();
  await editor.fill('Persistir despues de mover');
  await page.locator('[data-testid="sticky-canvas"]').click({ position: { x: 20, y: 20 } });

  const note = page.locator('.sticky-note').first();
  const before = await note.boundingBox();
  const grip = note.locator('.sticky-note__grip');
  const gripBox = await grip.boundingBox();
  expect(before).not.toBeNull();
  expect(gripBox).not.toBeNull();

  await page.mouse.move((gripBox?.x ?? 0) + 110, (gripBox?.y ?? 0) + 12);
  await page.mouse.down();
  await page.mouse.move((gripBox?.x ?? 0) + 190, (gripBox?.y ?? 0) + 72);
  await page.mouse.up();

  const after = await note.boundingBox();
  expect((after?.x ?? 0) - (before?.x ?? 0)).toBeGreaterThan(40);
  await expect(page.getByText(/guardados en indexeddb/i)).toBeVisible();

  await page.reload();
  await expect(page.getByLabel(/contenido de la nota/i)).toHaveValue('Persistir despues de mover');
});

test('mobile keeps the toolbar usable above the board', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'Mobile-only layout assertion');
  await page.goto('/');

  await expect(page.getByRole('button', { name: /nueva nota/i })).toBeVisible();
  const toolbarBox = await page.locator('.sticky-toolbar').boundingBox();
  const boardBox = await page.locator('.board-frame').boundingBox();
  expect(toolbarBox?.y ?? 0).toBeLessThan(boardBox?.y ?? 0);
});
