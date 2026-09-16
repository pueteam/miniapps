import { test, expect } from '@playwright/test';
import { emptyDiagram } from '../src/features/editor/model/document';
import { createElement } from '../src/features/editor/presets/elements';

function fixture(){
  const doc=emptyDiagram();doc.metadata.title='Cadena de integración';
  const outer=createElement('group','outer',{x:30,y:40});outer.width=620;outer.height=490;outer.data.name='PLATAFORMA DE DATOS';outer.style.fill='#eef1fa';outer.style.radius=24;
  const inner=createElement('group','inner',{x:25,y:60});inner.parentId='outer';inner.width=250;inner.height=380;inner.data.name='Ingesta';inner.style.fill='#ffffff';inner.style.radius=18;
  const a=createElement('job','a',{x:30,y:60});a.parentId='inner';a.width=190;a.height=86;a.data.name='EXTRAER_DATOS';a.data.schedule='21:00-20:00+1';a.style.fill='#0000ff';a.style.color='#ffffff';
  const b=createElement('job','b',{x:30,y:205});b.parentId='inner';b.width=190;b.height=86;b.data.name='VALIDAR_DATOS';b.data.repetitive=true;b.style.fill='#ffff00';
  const c=createElement('action','c',{x:340,y:200});c.parentId='outer';c.width=200;c.height=100;c.data.name='PUBLICAR';c.style.fill='#0000ff';c.style.color='#ffffff';
  doc.elements=[outer,inner,a,b,c];
  doc.edges=[{id:'ab',source:'a',target:'b',sourcePort:'bottom',targetPort:'top',routing:'orthogonal',waypoints:[],color:'#334155',width:1.5},{id:'bc',source:'b',target:'c',sourcePort:'right',targetPort:'left',routing:'orthogonal',waypoints:[{x:350,y:420}],color:'#334155',width:1.5}];
  return doc;
}
test('JSON conserva grupos, exporta PNG completo y recupera borrador',async({page},testInfo)=>{
  await page.goto('./');
  await page.getByRole('button',{name:'Abrir JSON',exact:true}).waitFor();
  await expect(page.getByRole('button',{name:'Abrir JSON',exact:true})).toBeEnabled();
  await page.locator('input[type=file]').setInputFiles({name:'cadena.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture()))});
  await expect(page.locator('.react-flow__node')).toHaveCount(5);
  await page.getByRole('button',{name:'Ajustar contenido',exact:true}).click();
  await expect(page.locator('[data-id="a"]')).toContainText('21:00-20:00+1');
  const jsonDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Guardar JSON',exact:true}).click();
  const json=await jsonDownload; const stream=await json.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(chunk);
  expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual(fixture());
  await page.getByRole('button',{name:'Exportar PNG'}).click();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar PNG',exact:true}).click();const png=await download;
  const imagePath=testInfo.outputPath('cadena.png');await png.saveAs(imagePath);
  const pngStream=await png.createReadStream();const bytes:Buffer[]=[];for await(const chunk of pngStream!)bytes.push(chunk);const data=Buffer.concat(bytes);
  expect(data.subarray(1,4).toString()).toBe('PNG');expect(data.readUInt32BE(16)).toBeGreaterThan(1200);expect(data.readUInt32BE(20)).toBeGreaterThan(900);
  await expect(page.getByText('Guardado local',{exact:true})).toBeVisible();
  await page.reload();await expect(page.locator('.react-flow__node')).toHaveCount(5);
  await page.getByRole('button',{name:'Ajustar contenido',exact:true}).click();
  await page.screenshot({path:testInfo.outputPath('editor.png'),fullPage:true});
});
test('archivo inválido conserva documento abierto',async({page})=>{
  await page.goto('./');await page.getByRole('button',{name:'Añadir JOB',exact:true}).click();
  await page.locator('input[type=file]').setInputFiles({name:'error.json',mimeType:'application/json',buffer:Buffer.from('{"version":99}')});
  await expect(page.getByRole('alert')).toBeVisible();await expect(page.locator('.react-flow__node')).toHaveCount(1);
});
