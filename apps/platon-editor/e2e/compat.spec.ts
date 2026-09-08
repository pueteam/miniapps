import { test, expect } from '@playwright/test';
test('mueve un grupo y deshace conservando al hijo', async ({page}) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./');
  await page.getByRole('button', {name:'Añadir JOB',exact:true}).click();
  await page.getByRole('button', {name:'Agrupar',exact:true}).click();
  const job = page.locator('[data-element-kind="job"]');
  await expect(job).toBeVisible();
  const before = (await job.boundingBox())!;
  const handle = (await page.locator('.group-drag-handle').boundingBox())!;
  await page.mouse.move(handle.x+10,handle.y+10); await page.mouse.down();
  await page.mouse.move(handle.x+90,handle.y+60,{steps:8}); await page.mouse.up();
  await expect.poll(async()=> (await job.boundingBox())!.x).toBeGreaterThan(before.x+60);
  await page.getByRole('button', {name:'Deshacer',exact:true}).click();
  await expect.poll(async()=> (await job.boundingBox())!.x).toBeCloseTo(before.x, 0);
  expect(errors).toEqual([]);
});
test('recupera la cadena al recargar sin conexión', async ({page, context}) => {
  await page.goto('./');
  await page.getByRole('button', {name:'Añadir JOB',exact:true}).click();
  await expect(page.getByText('Guardado local', {exact:true})).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.locator('.react-flow__node')).toHaveCount(1);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.react-flow__node')).toHaveCount(1);
});
