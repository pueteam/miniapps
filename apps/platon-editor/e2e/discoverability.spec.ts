import { test, expect } from '@playwright/test';

test('el lienzo vacío ofrece empezar con un JOB', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Empezar con un JOB', exact: true }).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(1);
  await expect(page.locator('.canvas-status')).toContainText('1 elementos');
});

test('los puertos de conexión son visibles sin hover', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).click();
  const opacity = await page.locator('.react-flow__node .react-flow__handle').first().evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeGreaterThan(0);
});
