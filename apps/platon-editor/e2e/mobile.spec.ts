import {test, expect} from '@playwright/test';
test('paneles móviles permiten añadir y documentar', async ({page}, testInfo) => {
  await page.setViewportSize({width:390, height:844});
  await page.goto('./');
  await page.getByRole('button', {name:'Elementos', exact:true}).click();
  await page.getByRole('button', {name:'Añadir Texto', exact:true}).click();
  await page.getByLabel('Texto', {exact:true}).fill('Documentación de la cadena');
  await page.getByLabel('Texto', {exact:true}).press('Tab');
  await expect(page.locator('.react-flow__node')).toContainText('Documentación de la cadena');
  await page.getByRole('button', {name:'Propiedades', exact:true}).click();
  await page.getByRole('button', {name:'Elementos', exact:true}).click();
  await page.screenshot({path:testInfo.outputPath('mobile.png'),fullPage:true});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
