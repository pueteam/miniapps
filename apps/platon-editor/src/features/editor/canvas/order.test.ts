import { expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { createElement } from '../presets/elements';
import { orderElements } from './order';

it('muestra huérfanos con padre inexistente en el nivel superior', () => {
  const doc = emptyDiagram();
  const orphan = { ...createElement('job', 'x', { x: 0, y: 0 }), parentId: 'fantasma' };
  const ordered = orderElements([...doc.elements, orphan]);
  expect(ordered.map((e) => e.id)).toContain('x');
});

it('termina ante ciclos de pertenencia en vez de desbordar la pila', () => {
  const a = { ...createElement('group', 'a', { x: 0, y: 0 }), parentId: 'b' };
  const b = { ...createElement('group', 'b', { x: 0, y: 0 }), parentId: 'a' };
  const ordered = orderElements([a, b]);
  expect(ordered).toHaveLength(2);
});

it('ordena hijos tras su padre', () => {
  const g = createElement('group', 'g', { x: 0, y: 0 });
  const child = { ...createElement('job', 'c', { x: 5, y: 5 }), parentId: 'g' };
  const ordered = orderElements([child, g]);
  expect(ordered.map((e) => e.id)).toEqual(['g', 'c']);
});
