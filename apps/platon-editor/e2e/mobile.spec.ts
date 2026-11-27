import {test, expect} from '@playwright/test';

test('solo abre un cajón móvil y ofrece un cierre accesible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('./');
  const elements = page.getByRole('button', { name: 'Elementos', exact: true });
  const properties = page.getByRole('button', { name: 'Propiedades', exact: true });
  await elements.click();
  await expect(elements).toHaveAttribute('aria-expanded', 'true');
  await properties.click();
  await expect(elements).toHaveAttribute('aria-expanded', 'false');
  await expect(properties).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.editor-layout .panel-open')).toHaveCount(1);
  await page.getByRole('button', { name: 'Cerrar propiedades' }).click();
  await expect(properties).toHaveAttribute('aria-expanded', 'false');
  await expect(properties).toBeFocused();
  await expect(page.locator('.react-flow')).toBeVisible();
  const size = await elements.boundingBox();
  expect(size?.height).toBeGreaterThanOrEqual(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('al añadir un elemento con teclado el foco pasa al inspector móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Elementos', exact: true }).click();
  await page.getByRole('button', { name: 'Añadir Texto', exact: true }).press('Enter');
  const inspectorHeading = page.getByRole('heading', { name: 'Personaliza el elemento' });
  await expect(inspectorHeading).toBeFocused();
  await expect(page.getByLabel('Texto', { exact: true })).toBeVisible();
});
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
