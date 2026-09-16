import { expect, it } from 'vitest';
import { emptyDiagram } from './document';
import { createElement } from '../presets/elements';
import { duplicateSelection, moveElements, patchElement } from './operations';

function docWithJob() {
  const doc = emptyDiagram();
  const job = createElement('job', 'a', { x: 10, y: 20 });
  job.data.parameters = ['p1'];
  return { ...doc, elements: [...doc.elements, job] };
}

it('duplicar clona data/style en profundidad (mutar la copia no contamina el original)', () => {
  const doc = docWithJob();
  const next = duplicateSelection(doc, ['a'], (() => { let n = 0; return () => `copy-${++n}`; })());
  const copy = next.elements.find((e) => e.id === 'copy-1')!;
  copy.data.parameters.push('hack');
  copy.data.name = 'hack';
  copy.style.fill = '#000000';
  const original = next.elements.find((e) => e.id === 'a')!;
  expect(original.data.parameters).toEqual(['p1']);
  expect(original.data.name).toBe('JOB');
  expect(original.style.fill).not.toBe('#000000');
});

it('mover no comparte data/style con el documento previo', () => {
  const doc = docWithJob();
  const next = moveElements(doc, ['a'], { x: 5, y: 5 });
  next.elements[0].data.parameters.push('hack');
  expect(doc.elements[0].data.parameters).toEqual(['p1']);
});

it('parchear clona los objetos anidados del parche', () => {
  const doc = docWithJob();
  const patchData = { ...doc.elements[0].data, parameters: ['x'] };
  const next = patchElement(doc, 'a', { data: patchData });
  patchData.parameters.push('hack');
  expect(next.elements[0].data.parameters).toEqual(['x']);
});
