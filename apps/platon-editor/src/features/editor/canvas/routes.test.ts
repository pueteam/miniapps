import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { createElement } from '../presets/elements';
import type { DiagramEdge } from '../model/types';
import { edgePath, routeEdge } from './routes';

function fixture() {
  const doc = emptyDiagram();
  const group = createElement('group', 'g', { x: -100, y: 80 });
  const a = createElement('job', 'a', { x: 20, y: 40 });
  a.parentId = 'g';
  const b = createElement('job', 'b', { x: 300, y: 200 });
  doc.elements = [group, a, b];
  const edge: DiagramEdge = { id: 'e', source: 'a', target: 'b', sourcePort: 'bottom', targetPort: 'top', routing: 'orthogonal', waypoints: [{ x: 500, y: -100 }], color: '#000000', width: 2 };
  return { doc, a, b, edge };
}

it('conserva waypoints absolutos y segmentos ortogonales entre puertos', () => {
  const { doc, a, b, edge } = fixture();
  const points = routeEdge(doc, edge);
  expect(points[0]).toEqual({ x: -80 + a.width / 2, y: 120 + a.height });
  expect(points.at(-1)).toEqual({ x: 300 + b.width / 2, y: 200 });
  expect(points).toContainEqual({ x: 500, y: -100 });
  expect(points.slice(1).every((p, i) => p.x === points[i].x || p.y === points[i].y)).toBe(true);
  expect(points[1].x).toBe(points[0].x);
  expect(points.at(-2)!.x).toBe(points.at(-1)!.x);
});

it('el recorrido recto ignora puntos intermedios', () => {
  const { doc, edge } = fixture();
  expect(routeEdge(doc, { ...edge, routing: 'straight' })).toHaveLength(2);
});

it('no dibuja referencias inexistentes', () => {
  const { doc, edge } = fixture();
  expect(routeEdge(doc, { ...edge, source: 'missing' })).toEqual([]);
});

it('convierte puntos en un path SVG sin inventar geometría', () => {
  expect(edgePath([])).toBe('');
  expect(edgePath([{ x: -1, y: 2 }, { x: 3, y: 4 }])).toBe('M -1 2 L 3 4');
});
