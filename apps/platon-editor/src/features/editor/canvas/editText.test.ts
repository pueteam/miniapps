import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { createElement } from '../presets/elements';
import { applyTextEdit } from './editText';

it('edita el campo según el kind sin tocar el resto', () => {
  const doc = emptyDiagram();
  const job = createElement('job', 'j', { x: 0, y: 0 });
  const text = { ...createElement('text', 't', { x: 0, y: 0 }) };
  const base = { ...doc, elements: [job, text] };
  const next = applyTextEdit(base, 't', 'Hola');
  expect(next.elements.find((e) => e.id === 't')?.data.text).toBe('Hola');
  expect(next.elements.find((e) => e.id === 'j')?.data.name).toBe('JOB');
  expect(base.elements.find((e) => e.id === 't')?.data.text).toBe('Texto');
});
