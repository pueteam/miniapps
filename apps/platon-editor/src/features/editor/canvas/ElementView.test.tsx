import { render, screen } from '@testing-library/preact';
import { expect, it } from 'vitest';
import { createElement } from '../presets/elements';
import { ElementView } from './ElementView';

it('conserva horarios, repetición y texto literal sin interpretar HTML', () => {
  const element = createElement('action', 'a', { x: 0, y: 0 });
  element.data.name = '<img src=x onerror=alert(1)>';
  element.data.schedule = '21:00-20:00+1';
  element.data.repetitive = true;
  const { container } = render(<ElementView element={element} />);
  expect(screen.getByText(element.data.name)).toBeTruthy();
  expect(screen.getByText('21:00-20:00+1')).toBeTruthy();
  expect(screen.getByText('R')).toBeTruthy();
  expect(container.querySelector('img')).toBeNull();
});

it('muestra cabecera derivada y título de grupo sin enlace navegable', () => {
  const header = createElement('header', 'h', { x: 0, y: 0 });
  header.data.lote = 'L001'; header.data.cadena = 'CAD'; header.data.description = 'Descripción';
  const group = createElement('group', 'g', { x: 0, y: 0 });
  group.data.url = 'https://example.com';
  const { container } = render(<><ElementView element={header} /><ElementView element={group} /></>);
  expect(screen.getByText('L001')).toBeTruthy();
  expect(screen.getByText('CAD')).toBeTruthy();
  expect(screen.getByText('Descripción')).toBeTruthy();
  expect(container.querySelector('a')).toBeNull();
});
