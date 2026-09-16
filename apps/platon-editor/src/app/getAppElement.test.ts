import { expect, it } from 'vitest';
import { getAppElement } from './getAppElement';

it('devuelve el contenedor #app cuando existe', () => {
  document.body.innerHTML = '<div id="app"></div>';
  expect(getAppElement(document).id).toBe('app');
});

it('lanza un error legible si falta #app', () => {
  document.body.innerHTML = '';
  expect(() => getAppElement(document)).toThrowError(/#app/);
});
