import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { createElement } from './elements';
import { nextName } from './autoName';

it('empieza en JOB1 con documento vacío', () => {
  expect(nextName(emptyDiagram().elements, 'job')).toBe('JOB1');
  expect(nextName(emptyDiagram().elements, 'text')).toBe('TEXTO1');
});

it('lleva contadores independientes por tipo sin reutilizar huecos', () => {
  const a = createElement('job', 'a', { x: 0, y: 0 });
  const b = createElement('job', 'b', { x: 0, y: 0 });
  const t = createElement('text', 't', { x: 0, y: 0 });
  const named = [
    { ...a, data: { ...a.data, name: 'JOB1' } },
    { ...b, data: { ...b.data, name: 'JOB2' } },
    { ...t, data: { ...t.data, text: 'TEXTO1' } },
  ];
  expect(nextName(named.slice(0, 1), 'job')).toBe('JOB2');
  expect(nextName(named, 'job')).toBe('JOB3');
  expect(nextName(named, 'text')).toBe('TEXTO2');
  expect(nextName(named, 'group')).toBe('GRUPO1');
});

it('ignora nombres que no siguen el patrón', () => {
  const a = createElement('job', 'a', { x: 0, y: 0 });
  const named = [{ ...a, data: { ...a.data, name: 'EXTRACCION' } }];
  expect(nextName(named, 'job')).toBe('JOB1');
});
