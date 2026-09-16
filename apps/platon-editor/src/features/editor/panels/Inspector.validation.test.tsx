import { fireEvent, render, screen } from '@testing-library/preact';
import { expect, it, vi } from 'vitest';
import type { Diagram, DiagramElement } from '../model/types';
import { Inspector } from './Inspector';

const node: DiagramElement = {
  id: 'job1', kind: 'job', position: { x: 10, y: 20 }, width: 160, height: 80,
  data: { name: 'JOB A', schedule: '', repetitive: false, parameters: [], annotations: '', url: '', semaphore: '', value: '', text: '', lote: '', cadena: '', description: '' },
  style: { fill: '#ffffff', stroke: '#000000', strokeWidth: 1, color: '#000000', fontSize: 14, bold: false, align: 'center', shape: 'rectangle', radius: 8 },
};
const doc: Diagram = { version: 1, metadata: { title: 'Cadena', lote: '', cadena: '', description: '' }, elements: [node], edges: [] };

it('rechaza colores inválidos sin commitear', () => {
  const change = vi.fn();
  render(<Inspector doc={doc} selection={{ elementIds: ['job1'], edgeIds: [] }} onChange={change} />);
  fireEvent.input(screen.getByLabelText('Relleno'), { target: { value: '#zzz' } });
  fireEvent.blur(screen.getByLabelText('Relleno'));
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toMatch(/color/i);
});

it('acepta URL con espacios alrededor', () => {
  const change = vi.fn();
  render(<Inspector doc={doc} selection={{ elementIds: ['job1'], edgeIds: [] }} onChange={change} />);
  fireEvent.input(screen.getByLabelText('URL'), { target: { value: '  https://ejemplo.es  ' } });
  fireEvent.blur(screen.getByLabelText('URL'));
  expect(change).toHaveBeenCalledTimes(1);
});

it('no commitea al elegir Personalizado si ya es personalizado', () => {
  const change = vi.fn();
  render(<Inspector doc={doc} selection={{ elementIds: ['job1'], edgeIds: [] }} onChange={change} />);
  fireEvent.change(screen.getByLabelText('Preset'), { target: { value: '' } });
  expect(change).not.toHaveBeenCalled();
});

it('avisa cuántos elementos hay seleccionados en multiselección', () => {
  const two = { ...doc, elements: [node, { ...node, id: 'job2' }] };
  render(<Inspector doc={two} selection={{ elementIds: ['job1', 'job2'], edgeIds: [] }} onChange={vi.fn()} />);
  expect(screen.getByText(/2 seleccionados/)).toBeTruthy();
});
