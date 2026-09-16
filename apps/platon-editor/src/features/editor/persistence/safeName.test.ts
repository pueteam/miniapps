import { expect, it } from 'vitest';
import { safeName } from './files';

it('sanea nombres para descarga', () => {
  expect(safeName('Mi/Cadena')).toBe('Mi-Cadena');
  expect(safeName('  ')).toBe('cadena-platon');
  expect(safeName('Cadena 1')).toBe('Cadena 1');
});
