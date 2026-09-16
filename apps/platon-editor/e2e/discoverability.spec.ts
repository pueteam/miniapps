import { test, expect } from '@playwright/test';

test('el lienzo vacío ofrece empezar con un JOB', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Empezar con un JOB', exact: true }).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(1);
  await expect(page.locator('.canvas-status')).toContainText('1 elementos');
  await expect(page.locator('.react-flow__node').first()).toContainText('JOB1');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).click();
  await page.getByRole('button', { name: 'Añadir Texto', exact: true }).click();
  await expect(page.locator('.react-flow__node')).toContainText(['JOB1', 'JOB2', 'TEXTO1']);
});

test('pinchar fuera de la caja confirma el nombre editado', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).click();
  await page.locator('.react-flow__node').dblclick();
  await page.getByLabel('Editar texto').fill('EXTRACCION');
  await page.locator('.react-flow__pane').click({ position: { x: 30, y: 30 } });
  await expect(page.getByLabel('Editar texto')).toHaveCount(0);
  await expect(page.locator('.react-flow__node')).toContainText('EXTRACCION');
});

test('los puertos de conexión son visibles sin hover', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).click();
  const opacity = await page.locator('.react-flow__node .react-flow__handle').first().evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeGreaterThan(0);
});

test('arrastrar desde un punto de entrada no crea flechas: solo las salidas originan', async ({ page }) => {
  await page.goto('./');
  const canvas = page.locator('.react-flow');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).dragTo(canvas, { targetPosition: { x: 220, y: 70 } });
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).dragTo(canvas, { targetPosition: { x: 220, y: 340 } });
  await page.locator('.react-flow__node').first().locator('.target[data-handlepos="bottom"]').dragTo(
    page.locator('.react-flow__node').nth(1).locator('.source[data-handlepos="top"]'),
  );
  await page.waitForTimeout(800);
  await expect(page.locator('.react-flow__edge')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('duplicar o invertir un enlace avisa en vez de fallar en silencio', async ({ page }) => {
  await page.goto('./');
  const canvas = page.locator('.react-flow');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).dragTo(canvas, { targetPosition: { x: 220, y: 70 } });
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).dragTo(canvas, { targetPosition: { x: 220, y: 340 } });
  const source = page.locator('.react-flow__node').first().locator('.source[data-handlepos="bottom"]');
  const target = page.locator('.react-flow__node').nth(1).locator('.target[data-handlepos="top"]');
  await source.dragTo(target);
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await source.dragTo(target);
  await expect(page.getByRole('alert')).toContainText('Ya existe ese enlace');
  await page.getByRole('button', { name: 'Cerrar aviso' }).click();
  await page.locator('.react-flow__node').nth(1).locator('.source[data-handlepos="bottom"]').dragTo(
    page.locator('.react-flow__node').first().locator('.target[data-handlepos="top"]'),
  );
  await expect(page.getByRole('alert')).toContainText('sentido contrario');
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
});
