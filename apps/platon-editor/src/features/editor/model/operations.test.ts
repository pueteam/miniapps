import { expect, it } from 'vitest';
import { emptyDiagram } from './document';
import { createElement } from '../presets/elements';
import { groupElements, ungroup, reparentElements, fitGroup } from './groups';
import { absolutePosition } from './geometry';
import { moveElements, deleteSelection, duplicateSelection, patchElement } from './operations';
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
