import { test, expect } from '@playwright/test';
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
