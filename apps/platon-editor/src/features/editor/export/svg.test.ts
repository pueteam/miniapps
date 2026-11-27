import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { edgePath, routeEdge } from '../model/routes';
import { createElement } from '../presets/elements';
import { exportSvg } from './svg';

async function parseSvg(blob: Blob) {
  expect(blob.type).toBe('image/svg+xml');
  const xml = new DOMParser().parseFromString(await blob.text(), 'image/svg+xml');
  expect(xml.querySelector('parsererror')).toBeNull();
  return xml;
}

it('conserva etiquetas como texto XML sin interpretar su contenido', async () => {
  const doc = emptyDiagram();
  const job = createElement('job', 'tarea', { x: 0, y: 0 });
  job.data.name = `A<&>"'`;
  job.data.schedule = '21:00-20:00+1';
  job.data.repetitive = true;
  doc.elements = [job];

  const xml = await parseSvg(exportSvg(doc, { background: 'transparent' }));
  expect(xml.documentElement.namespaceURI).toBe('http://www.w3.org/2000/svg');
  expect([...xml.querySelectorAll('text')].map(text => text.textContent)).toEqual([job.data.name, job.data.schedule, 'R']);
  expect(xml.querySelector('foreignObject, image, script')).toBeNull();
});

it('distribuye el texto ancho en líneas y conserva saltos y espacios escritos', async () => {
  const doc = emptyDiagram();
  const text = createElement('text', 'nota', { x: 0, y: 0 });
  text.width = 72;
  text.height = 200;
  const firstLine = 'PLATON01PLATON02PLATON03';
  text.data.text = `${firstLine}\n  fin`;
  doc.elements = [text];

  const xml = await parseSvg(exportSvg(doc, { background: 'transparent' }));
  const labels = [...xml.querySelectorAll('text')].map(label => label.textContent);
  expect(labels.length).toBeGreaterThan(2);
  expect(labels.at(-1)).toBe('  fin');
  expect(labels.slice(0, -1).join('')).toBe(firstLine);
});

it('pinta grupos en orden jerárquico, luego conexiones y después elementos', async () => {
  const doc = emptyDiagram();
  const parent = createElement('group', 'padre', { x: 10, y: 20 });
  const child = createElement('group', 'hijo', { x: 30, y: 40 });
  const diamond = createElement('job', 'inicio', { x: 0, y: 0 });
  const hexagon = createElement('action', 'fin', { x: 250, y: 0 });
  child.parentId = parent.id;
  diamond.parentId = child.id;
  diamond.style.shape = 'diamond';
  parent.data.name = 'Padre';
  child.data.name = 'Hijo';
  doc.elements = [child, diamond, hexagon, parent];
  doc.edges = [{ id: 'e1', source: diamond.id, target: hexagon.id, sourcePort: 'right', targetPort: 'left', routing: 'orthogonal', waypoints: [], width: 2, color: '#334155' }];

  const xml = await parseSvg(exportSvg(doc, { background: 'transparent' }));
  const drawing = [...xml.documentElement.children].filter(element => element.localName !== 'defs');
  expect(drawing.map(element => element.localName)).toEqual(['g', 'g', 'path', 'g', 'g']);
  expect(drawing.slice(0, 2).map(element => element.querySelector('text')?.textContent)).toEqual(['Padre', 'Hijo']);
  expect(drawing[1].getAttribute('transform')).toBe('translate(40 60)');
  expect(drawing[2].getAttribute('d')).toBe(edgePath(routeEdge(doc, doc.edges[0])));
  expect(drawing[2].getAttribute('marker-end')).toBe(`url(#${xml.querySelector('marker')?.id})`);
  expect(drawing[3].querySelector('polygon')?.getAttribute('points')?.split(' ')).toHaveLength(6);
  expect(drawing[4].querySelector('polygon')?.getAttribute('points')?.split(' ')).toHaveLength(4);
});

it('cubre el diagrama con un fondo blanco solo cuando se solicita', async () => {
  const white = await parseSvg(exportSvg(emptyDiagram(), { background: 'white' }));
  const transparent = await parseSvg(exportSvg(emptyDiagram(), { background: 'transparent' }));
  expect(white.documentElement.getAttribute('viewBox')).toBe('0 0 640 480');
  expect(white.querySelector('rect')?.getAttribute('fill')).toBe('#ffffff');
  expect(transparent.querySelector('rect')).toBeNull();
});
