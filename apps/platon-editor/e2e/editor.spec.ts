import { test, expect } from '@playwright/test';

test('los diálogos suspenden los atajos del lienzo y devuelven el foco', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Añadir JOB', exact: true }).click();

  const shortcuts = page.getByRole('button', { name: 'Ver atajos de teclado' });
  await shortcuts.click();
  const help = page.getByRole('dialog', { name: 'Atajos de teclado' });
  await expect(help).toBeVisible();
  for (const key of ['Delete', 'Backspace', 'Control+z', 'Control+y', 'Control+d']) {
    await page.keyboard.press(key);
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  }
  await page.keyboard.press('Escape');
  await expect(help).toHaveCount(0);
  await expect(shortcuts).toBeFocused();
  await expect(page.getByRole('button', { name: 'Duplicar', exact: true })).toBeEnabled();

  const exportButton = page.getByRole('button', { name: 'Exportar PNG' });
  await exportButton.click();
  const exportDialog = page.getByRole('dialog', { name: 'Exportar como PNG' });
  await expect(exportDialog).toBeVisible();
  await page.keyboard.press('Delete');
  await expect(page.locator('.react-flow__node')).toHaveCount(1);
  await page.locator('.modal-backdrop').click({ position: { x: 8, y: 8 } });
  await expect(exportDialog).toHaveCount(0);
  await expect(exportButton).toBeFocused();
});

test('la instalación ocupa su propio espacio en las acciones del documento', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Abrir JSON' })).toBeEnabled();
  await page.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt', { cancelable: true })));
  const install = page.getByRole('button', { name: 'Instalar app' });
  const exportButton = page.getByRole('button', { name: 'Exportar PNG' });
  await expect(install).toBeVisible();
  await expect(install).toHaveCSS('position', 'static');
  const [installBox, exportBox] = await Promise.all([install.boundingBox(), exportButton.boundingBox()]);
  expect(installBox!.x).toBeGreaterThanOrEqual(exportBox!.x + exportBox!.width);
});

test('alinea dos nodos desde el inspector y permite deshacer en una sola acción', async ({ page }) => {
  await page.goto('./');
  const canvas = page.locator('.react-flow');
  const addJob = page.getByRole('button', { name: 'Añadir JOB', exact: true });
  await addJob.dragTo(canvas, { targetPosition: { x: 100, y: 75 } });
  await addJob.dragTo(canvas, { targetPosition: { x: 330, y: 240 } });
  const nodes = page.locator('.react-flow__node');
  const horizontalDistance = async () => {
    const [first, second] = await Promise.all([nodes.first().boundingBox(), nodes.nth(1).boundingBox()]);
    return Math.abs(first!.x - second!.x);
  };
  const initialDistance = await horizontalDistance();
  expect(initialDistance).toBeGreaterThan(0);
  const [first, second] = await Promise.all([nodes.first().boundingBox(), nodes.nth(1).boundingBox()]);
  await page.mouse.move(Math.min(first!.x, second!.x) - 16, Math.min(first!.y, second!.y) - 16);
  await page.mouse.down();
  await page.mouse.move(
    Math.max(first!.x + first!.width, second!.x + second!.width) + 16,
    Math.max(first!.y + first!.height, second!.y + second!.height) + 16,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect(page.getByRole('note')).toContainText('2 seleccionados');
  await page.getByLabel('Alinear selección', { exact: true }).selectOption('left');
  expect(await horizontalDistance()).toBeCloseTo(initialDistance);
  await page.getByRole('button', { name: 'Alinear', exact: true }).click();
  await expect.poll(horizontalDistance).toBeCloseTo(0);
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect.poll(horizontalDistance).toBeCloseTo(initialDistance);
});
test('crea, modifica, deshace y elimina elementos', async ({page}) => {
  await page.goto('./');
  await page.getByRole('button', {name:'Añadir JOB',exact:true}).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(1);
  await page.getByLabel('Nombre', {exact:true}).fill('EXTRACCION');
  await page.getByLabel('Nombre', {exact:true}).press('Tab');
  await expect(page.locator('.react-flow__node')).toContainText('EXTRACCION');
  await page.getByRole('button',{name:'Duplicar',exact:true}).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(2);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(1);
  await page.locator('.react-flow__node').click();
  await page.getByRole('button',{name:'Eliminar selección',exact:true}).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(0);
});
test('arrastra elementos y conecta una bifurcación', async ({page})=> {
  await page.goto('./');
  const canvas = page.locator('.react-flow');
  await page.getByRole('button',{name:'Añadir JOB',exact:true}).dragTo(canvas,{targetPosition:{x:220,y:70}});
  await page.getByRole('button',{name:'Añadir JOB',exact:true}).dragTo(canvas,{targetPosition:{x:100,y:340}});
  await page.getByRole('button',{name:'Añadir JOB',exact:true}).dragTo(canvas,{targetPosition:{x:440,y:340}});
  await expect(page.locator('.react-flow__node')).toHaveCount(3);
  await page.locator('.react-flow__node').first().locator('.source[data-handlepos="bottom"]').dragTo(page.locator('.react-flow__node').nth(1).locator('.target[data-handlepos="top"]'));
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await page.locator('.react-flow__node').first().locator('.source[data-handlepos="bottom"]').dragTo(page.locator('.react-flow__node').nth(2).locator('.target[data-handlepos="top"]'));
  await expect(page.locator('.react-flow__edge')).toHaveCount(2);
});
