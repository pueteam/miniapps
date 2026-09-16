import { expect, it } from 'vitest';
import { emptyDiagram } from './document';
import { commitHistory, startHistory } from './history';

it('acota el pasado a 100 entradas', () => {
  let h = startHistory(emptyDiagram());
  for (let i = 0; i < 105; i += 1) {
    const doc = { ...emptyDiagram(), metadata: { ...emptyDiagram().metadata, title: `t${i}` } };
    h = commitHistory(h, doc);
  }
  expect(h.past.length).toBeLessThanOrEqual(100);
});

it('devuelve el mismo historial si el documento no cambió', () => {
  const doc = emptyDiagram();
  const h = startHistory(doc);
  expect(commitHistory(h, doc)).toBe(h);
});
