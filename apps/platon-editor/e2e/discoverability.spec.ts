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

test('los puertos están ocultos en reposo', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).click();
  await page.locator('.react-flow__pane').click({ position: { x: 30, y: 30 } });
  await page.waitForTimeout(400);
  const opacity = await page.locator('.react-flow__node .react-flow__handle').first().evaluate((el) => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBe(0);
});

test('al pasar el ratón la caja destaca sus salidas', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).click();
  await page.locator('.react-flow__pane').click({ position: { x: 30, y: 30 } });
  const node = page.locator('.react-flow__node').first();
  const target = node.locator('.port-target').first();
  const source = node.locator('.port-source').first();
  await expect.poll(async () => target.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  await expect.poll(async () => source.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  await node.hover({ position: { x: 50, y: 20 } });
  await page.waitForTimeout(400);
  await expect.poll(async () => source.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  await expect.poll(async () => target.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  expect(await source.evaluate((el) => getComputedStyle(el).cursor)).toBe('crosshair');
});

test('al crear enlace la caja destino remarca sus entradas', async ({ page }) => {
  await page.goto('./');
  const canvas = page.locator('.react-flow');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).dragTo(canvas, { targetPosition: { x: 220, y: 70 } });
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).dragTo(canvas, { targetPosition: { x: 220, y: 340 } });
  const from = await page.locator('.react-flow__node').first().locator('.port-source[data-handlepos="bottom"]').boundingBox();
  const destTarget = page.locator('.react-flow__node').nth(1).locator('.port-target[data-handlepos="top"]');
  const destBox = await destTarget.boundingBox();
  await page.mouse.move(from!.x + 4, from!.y + 4);
  await page.mouse.down();
  await page.mouse.move(destBox!.x + 4, destBox!.y + 4, { steps: 12 });
  await expect.poll(async () => destTarget.evaluate((el) => el.classList.contains('valid'))).toBe(true);
  await expect.poll(async () => destTarget.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  const destNode = page.locator('.react-flow__node').nth(1);
  await expect.poll(async () => destNode.locator('.port-source').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  await page.mouse.move(30, 30, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  await expect(page.locator('.react-flow__edge')).toHaveCount(0);
});

test('soltar en la caja crea el enlace en la entrada más cercana', async ({ page }) => {
  await page.goto('./');
  const canvas = page.locator('.react-flow');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).dragTo(canvas, { targetPosition: { x: 220, y: 70 } });
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).dragTo(canvas, { targetPosition: { x: 220, y: 340 } });
  const from = await page.locator('.react-flow__node').first().locator('.port-source[data-handlepos="bottom"]').boundingBox();
  const destBox = await page.locator('.react-flow__node').nth(1).boundingBox();
  await page.mouse.move(from!.x + 4, from!.y + 4);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.move(destBox!.x + destBox!.width / 2, destBox!.y + destBox!.height / 2, { steps: 20 });
  await page.mouse.up();
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await expect(page.getByRole('alert')).toHaveCount(0);
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
  const from = await page.locator('.react-flow__node').first().locator('.source[data-handlepos="bottom"]').boundingBox();
  const to = await page.locator('.react-flow__node').nth(1).locator('.target[data-handlepos="top"]').boundingBox();
  const drag = async (a: { x: number; y: number }, b: { x: number; y: number }) => {
    await page.mouse.move(a.x + 4, a.y + 4);
    await page.mouse.down();
    await page.waitForTimeout(300);
    await page.mouse.move(b.x + 4, b.y + 4, { steps: 20 });
    await page.mouse.up();
  };
  const boxOf = (node: number, cls: string, pos: string) =>
    page.locator('.react-flow__node').nth(node).locator(`.${cls}[data-handlepos="${pos}"]`).boundingBox();
  await drag({ x: from!.x, y: from!.y }, { x: to!.x, y: to!.y });
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await drag({ x: from!.x, y: from!.y }, { x: to!.x, y: to!.y });
  await expect(page.getByRole('alert')).toContainText('Ya existe ese enlace');
  await page.getByRole('button', { name: 'Cerrar aviso' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  const backFrom = await boxOf(1, 'source', 'bottom');
  const backTo = await boxOf(0, 'target', 'top');
  await drag({ x: backFrom!.x, y: backFrom!.y }, { x: backTo!.x, y: backTo!.y });
  await expect(page.getByRole('alert')).toContainText('sentido contrario');
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
});
