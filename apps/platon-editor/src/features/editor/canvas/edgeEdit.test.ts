import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { createElement } from '../presets/elements';
import type { DiagramEdge } from '../model/types';
import { addWaypointAt } from './edgeEdit';

function edgeFixture(): DiagramEdge {
  return { id: 'e', source: 'a', target: 'b', sourcePort: 'bottom', targetPort: 'top', routing: 'orthogonal', waypoints: [{ x: 5, y: 7 }], color: '#000000', width: 2 };
}

it('añade un punto intermedio sin mutar la arista original', () => {
  const edge = edgeFixture();
  const next = addWaypointAt(edge, { x: 42, y: 43 });
  expect(next.waypoints).toEqual([{ x: 5, y: 7 }, { x: 42, y: 43 }]);
  expect(edge.waypoints).toEqual([{ x: 5, y: 7 }]);
});

it('ignora puntos duplicados del último tramo', () => {
  const edge = edgeFixture();
  expect(addWaypointAt(edge, { x: 5, y: 7 }).waypoints).toHaveLength(1);
});
