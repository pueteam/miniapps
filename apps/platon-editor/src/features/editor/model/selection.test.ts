import { expect, it } from 'vitest';
import { isSameSelection } from './selection';

it('compara selecciones sin depender del orden de claves', () => {
  expect(isSameSelection({ elementIds: ['a'], edgeIds: [] }, { elementIds: ['a'], edgeIds: [] })).toBe(true);
  expect(isSameSelection({ elementIds: ['a'], edgeIds: [] }, { elementIds: ['b'], edgeIds: [] })).toBe(false);
  expect(isSameSelection({ elementIds: [], edgeIds: ['e1'] }, { elementIds: [], edgeIds: ['e1', 'e2'] })).toBe(false);
});
