import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { createElement } from '../presets/elements';
import { createEdgeFromConnection, getRejectionReason, nearestTargetPort, nodeAtPoint } from './connect';

function docWithJobs() {
  const doc = emptyDiagram();
  const a = createElement('job', 'a', { x: 0, y: 0 });
  const b = createElement('job', 'b', { x: 300, y: 0 });
  const t = createElement('text', 't', { x: 600, y: 0 });
  return { ...doc, elements: [a, b, t] };
}

it('crea aristas válidas entre job y action', () => {
  const edge = createEdgeFromConnection(
    docWithJobs(),
    { source: 'a', target: 'b', sourceHandle: 'out-right', targetHandle: 'in-left' },
    () => 'e1',
  );
  expect(edge?.id).toBe('e1');
  expect(edge?.sourcePort).toBe('right');
  expect(edge?.targetPort).toBe('left');
});

it('rechaza autoenlaces, extremos no conectables y duplicadas', () => {
  const doc = docWithJobs();
  expect(createEdgeFromConnection(doc, { source: 'a', target: 'a' }, () => 'x')).toBeNull();
  expect(createEdgeFromConnection(doc, { source: 'a', target: 't' }, () => 'x')).toBeNull();
  expect(createEdgeFromConnection(doc, { source: null, target: 'b' }, () => 'x')).toBeNull();
  const withEdge = { ...doc, edges: [{ id: 'e0', source: 'a', target: 'b', sourcePort: 'bottom', targetPort: 'top', routing: 'orthogonal', waypoints: [], color: '#334155', width: 1.5 }] as never };
  expect(
    createEdgeFromConnection(withEdge as never, { source: 'a', target: 'b', sourceHandle: 'out-bottom', targetHandle: 'in-top' }, () => 'x'),
  ).toBeNull();
});

it('rechaza el enlace inverso si ya existe el directo', () => {
  const doc = docWithJobs();
  const withEdge = {
    ...doc,
    edges: [{ id: 'e0', source: 'a', target: 'b', sourcePort: 'bottom', targetPort: 'top', routing: 'orthogonal', waypoints: [], color: '#334155', width: 1.5 }],
  };
  expect(createEdgeFromConnection(withEdge as never, { source: 'b', target: 'a' }, () => 'x')).toBeNull();
  expect(getRejectionReason(withEdge as never, { source: 'b', target: 'a' })).toBe('reverse-duplicate');
});

it('explica cada motivo de rechazo en lenguaje claro', () => {
  const doc = docWithJobs();
  expect(getRejectionReason(doc, { source: null, target: 'b' })).toBe('missing');
  expect(getRejectionReason(doc, { source: 'a', target: 'a' })).toBe('self');
  expect(getRejectionReason(doc, { source: 'a', target: 't' })).toBe('not-connectable');
  expect(getRejectionReason(doc, { source: 'a', target: 'b' })).toBeNull();
});

it('elige la entrada más cercana al punto donde se suelta', () => {
  const doc = docWithJobs();
  expect(nearestTargetPort(doc, 'b', { x: 410, y: 10 })).toBe('top');
  expect(nearestTargetPort(doc, 'b', { x: 600, y: 50 })).toBe('right');
  expect(nearestTargetPort(doc, 'b', { x: 410, y: 200 })).toBe('bottom');
  expect(nearestTargetPort(doc, 'b', { x: 200, y: 50 })).toBe('left');
  expect(nearestTargetPort(doc, 'inexistente', { x: 0, y: 0 })).toBeNull();
});

it('encuentra la caja bajo el punto donde se suelta', () => {
  const doc = docWithJobs();
  expect(nodeAtPoint(doc, { x: 410, y: 50 }, 'a')).toBe('b');
  expect(nodeAtPoint(doc, { x: 10, y: 10 }, 'a')).toBeNull();
  expect(nodeAtPoint(doc, { x: 410, y: 50 })).toBe('b');
});
