import { expect, it } from 'vitest';
import { emptyDiagram } from './document';
import { DiagramError, validateDiagram } from './validation';
import { createElement } from '../presets/elements';

it('informa la ruta del campo inválido', () => {
  const doc = emptyDiagram();
  const bad = { ...createElement('job', 'a', { x: 0, y: 0 }), width: -5 };
  try {
    validateDiagram({ ...doc, elements: [bad] });
    expect.unreachable();
  } catch (e) {
    expect(e).toBeInstanceOf(DiagramError);
    expect((e as DiagramError).path).toBe('elements[0].width');
  }
});

it('tipifica el identificador duplicado', () => {
  const doc = emptyDiagram();
  const a = createElement('job', 'a', { x: 0, y: 0 });
  const b = createElement('job', 'a', { x: 50, y: 50 });
  try {
    validateDiagram({ ...doc, elements: [a, b] });
    expect.unreachable();
  } catch (e) {
    expect(e).toBeInstanceOf(DiagramError);
    expect((e as DiagramError).code).toBe('duplicate-id');
  }
});

it('rechaza documentos gigantes (límite anti-DoS)', () => {
  const doc = emptyDiagram();
  const elements = Array.from({ length: 5001 }, (_, i) => createElement('job', `n${i}`, { x: i, y: 0 }));
  expect(() => validateDiagram({ ...doc, elements })).toThrowError(DiagramError);
});
