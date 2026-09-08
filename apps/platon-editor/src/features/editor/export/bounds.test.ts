import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { createElement } from '../presets/elements';
import { diagramBounds, safeExportScale } from './bounds';

it('incluye grupos negativos, descendientes y enlaces fuera del contenido', () => {
  const doc = emptyDiagram();
  const group = createElement('group', 'g', { x: -150, y: -100 });
  const a = createElement('job', 'a', { x: 50, y: 80 });
  a.parentId = 'g';
  const b = createElement('job', 'b', { x: 600, y: 400 });
  doc.elements = [group, a, b];
  doc.edges = [{ id: 'e', source: 'a', target: 'b', sourcePort: 'right', targetPort: 'top', routing: 'orthogonal', waypoints: [{ x: 1200, y: -500 }], color: '#000000', width: 10 }];
  const bounds = diagramBounds(doc);
  expect(bounds.x).toBeLessThan(-150);
  expect(bounds.y).toBeLessThan(-500);
  expect(bounds.x + bounds.width).toBeGreaterThan(1200);
  expect(bounds.y + bounds.height).toBeGreaterThan(400 + b.height);
});

it('limita dimensión y área incluso después del redondeo a píxeles', () => {
  const b = { x: 0, y: 0, width: 10001, height: 10003 };
  const scale = safeExportScale(b, 2);
  expect(Math.ceil(b.width * scale)).toBeLessThanOrEqual(8192);
  expect(Math.ceil(b.width * scale) * Math.ceil(b.height * scale)).toBeLessThanOrEqual(32000000);
  expect(scale).toBeLessThan(2);
});

it('usa un área útil para el documento vacío y conserva escalas seguras', () => {
  const bounds = diagramBounds(emptyDiagram());
  expect(bounds).toEqual({ x: 0, y: 0, width: 640, height: 480 });
  expect(safeExportScale(bounds, 2)).toBe(2);
});
