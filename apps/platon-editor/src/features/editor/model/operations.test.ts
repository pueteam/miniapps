import { expect, it } from 'vitest';
import { emptyDiagram } from './document';
import { createElement } from '../presets/elements';
import { groupElements, ungroup, reparentElements, fitGroup } from './groups';
import { absolutePosition } from './geometry';
import { alignElements, moveElements, deleteSelection, duplicateSelection, patchElement } from './operations';
import { startHistory, commitHistory, undo, redo } from './history';

function fixture() {
  const d = emptyDiagram(); d.elements = [createElement('job', 'a', { x: 120, y: 180 }), createElement('job', 'b', { x: 400, y: 200 })];
  d.edges = [{ id: 'e', source: 'a', target: 'b', sourcePort: 'bottom', targetPort: 'top', routing: 'orthogonal', waypoints: [{ x: 350, y: 400 }], color: '#000000', width: 2 }];
  return d;
}
it('agrupa, ajusta y desagrupa preservando coordenadas', () => {
  const d = fixture(); const g = groupElements(d, ['a'], 'g');
  expect(absolutePosition(g, 'a')).toEqual(d.elements[0].position);
  const fitted = fitGroup(g, 'g');
  expect(absolutePosition(fitted, 'a')).toEqual(d.elements[0].position);
  expect(absolutePosition(ungroup(fitted, 'g'), 'a')).toEqual(d.elements[0].position);
  expect(d.elements).toHaveLength(2);
});
it('mueve raíces seleccionadas una vez y puntos solo si ambos extremos se mueven', () => {
  const g = groupElements(fixture(), ['a', 'b'], 'g');
  const moved = moveElements(g, ['g', 'a'], { x: 10, y: 20 });
  expect(absolutePosition(moved, 'a')).toEqual({ x: 130, y: 200 });
  expect(moved.edges[0].waypoints).toEqual([{ x: 360, y: 420 }]);
  expect(moveElements(g, ['a'], { x: 10, y: 20 }).edges[0].waypoints).toEqual(g.edges[0].waypoints);
});
it.each([
  ['left', 120, 120, 180, 200],
  ['center', 220, 260, 180, 200],
  ['right', 320, 400, 180, 200],
  ['top', 120, 400, 180, 180],
  ['middle', 120, 400, 180, 200],
  ['bottom', 120, 400, 180, 220],
] as const)('alinea %s según los bordes de la selección, sin mutar el origen', (alignment, ax, bx, ay, by) => {
  const doc = fixture();
  Object.assign(doc.elements[0], { width: 160, height: 80 });
  Object.assign(doc.elements[1], { width: 80, height: 40 });

  const aligned = alignElements(doc, ['a', 'b'], alignment);

  expect(absolutePosition(aligned, 'a')).toEqual({ x: ax, y: ay });
  expect(absolutePosition(aligned, 'b')).toEqual({ x: bx, y: by });
  expect(doc.elements.map(e => e.position)).toEqual([{ x: 120, y: 180 }, { x: 400, y: 200 }]);
});

it('alinea raíces en coordenadas del lienzo y conserva posiciones locales y puntos de enlace', () => {
  const original = fixture();
  let doc = groupElements(original, ['a'], 'g1');
  doc = groupElements(doc, ['b'], 'g2');
  const childPosition = doc.elements.find(e => e.id === 'a')!.position;
  const groupPosition = absolutePosition(doc, 'g2');

  const acrossGroups = alignElements(doc, ['a', 'b'], 'left');
  expect(absolutePosition(acrossGroups, 'b').x).toBe(120);
  expect(absolutePosition(acrossGroups, 'g2')).toEqual(groupPosition);
  expect(acrossGroups.edges[0].waypoints).toEqual(original.edges[0].waypoints);

  const withAncestor = alignElements(doc, ['g1', 'a', 'g2'], 'right');
  expect(withAncestor.elements.find(e => e.id === 'a')!.position).toEqual(childPosition);
  expect(absolutePosition(withAncestor, 'a').x).toBe(400);
  expect(absolutePosition(withAncestor, 'b').x).toBe(400);
});

it('traslada los puntos de un enlace si sus dos extremos se desplazan juntos al alinear', () => {
  const original = fixture();
  const grouped = groupElements(original, ['a', 'b'], 'g');
  const target = createElement('text', 'guide', { x: -100, y: 0 });
  const doc = { ...grouped, elements: [...grouped.elements, target] };
  const dx = target.position.x - absolutePosition(doc, 'g').x;

  const aligned = alignElements(doc, ['g', 'guide'], 'left');

  expect(aligned.edges[0].waypoints).toEqual(original.edges[0].waypoints.map(point => ({ x: point.x + dx, y: point.y })));
});
it('rechaza ciclos y referencias inválidas', () => {
  const g = groupElements(groupElements(fixture(), ['a'], 'g'), ['g'], 'h');
  expect(() => reparentElements(g, ['h'], 'g')).toThrow();
  expect(() => moveElements(g, ['missing'], { x: 1, y: 0 })).toThrow();
  expect(() => patchElement(g, 'a', { width: -1 })).toThrow();
});
it('elimina subárbol y enlaces; duplica solo enlaces internos y remapea IDs', () => {
  const g = groupElements(fixture(), ['a', 'b'], 'g'); let n = 0;
  const copied = duplicateSelection(g, ['g', 'a'], () => `copy-${++n}`);
  expect(copied.elements).toHaveLength(6); expect(copied.edges).toHaveLength(2);
  expect(copied.edges[1].source).not.toBe('a');
  expect(duplicateSelection(g, ['a'], () => 'solo').edges).toHaveLength(1);
  expect(deleteSelection(g, { elementIds: ['g'], edgeIds: [] }).elements).toHaveLength(0);
  expect(deleteSelection(g, { elementIds: ['g'], edgeIds: [] }).edges).toHaveLength(0);
});
it('limita historial a 100, deshace, rehace y descarta futuro tras editar', () => {
  let h = startHistory(fixture());
  for (let i = 0; i < 101; i++) h = commitHistory(h, moveElements(h.present, ['a'], { x: 1, y: 0 }));
  expect(h.past).toHaveLength(100); expect(redo(undo(h)).present).toEqual(h.present);
  expect(commitHistory(undo(h), fixture()).future).toEqual([]);
  expect(commitHistory(h, h.present)).toBe(h);
});
