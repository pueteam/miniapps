import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import type { Diagram, DiagramElement } from '../model/types';
import { Inspector } from './Inspector';
import { Palette } from './Palette';

const node: DiagramElement = {
  id: 'job1', kind: 'job', position: { x: 10, y: 20 }, width: 160, height: 80,
  data: { name: 'JOB A', schedule: '10:00+1', repetitive: false, parameters: [], annotations: '', url: '', semaphore: '', value: '', text: '', lote: '', cadena: '', description: '' },
  style: { fill: '#ffffff', stroke: '#000000', strokeWidth: 1, color: '#000000', fontSize: 14, bold: false, align: 'center', shape: 'rectangle', radius: 8 },
};
const doc: Diagram = { version: 1, metadata: { title: 'Cadena', lote: '', cadena: '', description: '' }, elements: [node], edges: [] };
const selected = { elementIds: ['job1'], edgeIds: [] };

describe('editor panels', () => {
  it('offers all five kinds with keyboard accessible add buttons', () => {
    const add = vi.fn();
    render(<Palette onAdd={add} />);
    for (const name of ['JOB', 'Actuación', 'Texto', 'Grupo', 'Cabecera']) fireEvent.click(screen.getByRole('button', { name: `Añadir ${name}` }));
    expect(add.mock.calls.map(([kind]) => kind)).toEqual(['job', 'action', 'text', 'group', 'header']);
    const transfer = { setData: vi.fn(), effectAllowed: '' };
    fireEvent.dragStart(screen.getByRole('button', { name: 'Añadir JOB' }), { dataTransfer: transfer });
    expect(transfer.setData).toHaveBeenCalledWith('application/platon-kind', 'job');
  });
  it('commits a text edit once on blur and preserves the original document', () => {
    const change = vi.fn();
    render(<Inspector doc={doc} selection={selected} onChange={change} />);
    const input = screen.getByLabelText('Nombre');
    fireEvent.input(input, { target: { value: 'JOB B' } });
    expect(change).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0].elements[0].data.name).toBe('JOB B');
    expect(doc.elements[0].data.name).toBe('JOB A');
  });
  it('edits document metadata when nothing is selected', () => {
    const change = vi.fn();
    render(<Inspector doc={doc} selection={{ elementIds: [], edgeIds: [] }} onChange={change} />);
    fireEvent.input(screen.getByLabelText('Título'), { target: { value: 'Otra cadena' } });
    fireEvent.blur(screen.getByLabelText('Título'));
    expect(change.mock.calls[0][0].metadata.title).toBe('Otra cadena');
  });
  it('rejects invalid dimensions and URL schemes', () => {
    const change = vi.fn();
    render(<Inspector doc={doc} selection={selected} onChange={change} />);
    fireEvent.input(screen.getByLabelText('Ancho'), { target: { value: '-3' } });
    fireEvent.blur(screen.getByLabelText('Ancho'));
    fireEvent.input(screen.getByLabelText('URL'), { target: { value: 'javascript:alert(1)' } });
    fireEvent.blur(screen.getByLabelText('URL'));
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('http');
  });
  it('edits and adds orthogonal waypoints without mutating the edge', () => {
    const edgeDoc: Diagram = { ...doc, elements: [...doc.elements, { ...node, id: 'job2' }], edges: [{ id: 'e', source: 'job1', target: 'job2', sourcePort: 'bottom', targetPort: 'top', routing: 'orthogonal', waypoints: [{ x: 5, y: 7 }], color: '#000000', width: 2 }] };
    const change = vi.fn();
    render(<Inspector doc={edgeDoc} selection={{ elementIds: [], edgeIds: ['e'] }} onChange={change} />);
    fireEvent.input(screen.getByLabelText('Punto 1 X'), { target: { value: '42' } });
    fireEvent.blur(screen.getByLabelText('Punto 1 X'));
    expect(change.mock.calls[0][0].edges[0].waypoints).toEqual([{ x: 42, y: 7 }]);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir punto' }));
    expect(change.mock.calls[1][0].edges[0].waypoints).toHaveLength(2);
    expect(edgeDoc.edges[0].waypoints).toEqual([{ x: 5, y: 7 }]);
  });
  it('shows the complete JOB fields and commits manual style changes', () => {
    const change = vi.fn();
    render(<Inspector doc={doc} selection={selected} onChange={change} />);
    for (const label of ['Nombre', 'Horario', 'R', 'Preset', 'Forma', 'Relleno', 'Borde', 'Grosor del borde', 'Color del texto', 'Tamaño del texto', 'Negrita', 'Alineación', 'Ancho', 'Alto', 'X', 'Y', 'Anotaciones', 'Parámetros', 'URL']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    fireEvent.input(screen.getByLabelText('Relleno'), { target: { value: '#123456' } });
    fireEvent.blur(screen.getByLabelText('Relleno'));
    expect(change.mock.calls[0][0].elements[0].style.fill).toBe('#123456');
    fireEvent.change(screen.getByLabelText('Preset'), { target: { value: 'monitor-abort-warning' } });
    expect(change.mock.calls[1][0].elements[0].style.presetId).toBe('monitor-abort-warning');
  });
  it('shows fields specific to action, text and header elements', () => {
    const action = { ...node, id: 'action1', kind: 'action' as const };
    const { rerender } = render(<Inspector doc={{ ...doc, elements: [action] }} selection={{ elementIds: ['action1'], edgeIds: [] }} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Semáforo')).toBeTruthy();
    expect(screen.getByLabelText('Valor')).toBeTruthy();

    const text = { ...node, id: 'text1', kind: 'text' as const };
    rerender(<Inspector doc={{ ...doc, elements: [text] }} selection={{ elementIds: ['text1'], edgeIds: [] }} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Texto')).toBeTruthy();

    const header = { ...node, id: 'header1', kind: 'header' as const };
    rerender(<Inspector doc={{ ...doc, elements: [header] }} selection={{ elementIds: ['header1'], edgeIds: [] }} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Lote')).toBeTruthy();
    expect(screen.getByLabelText('Cadena')).toBeTruthy();
    expect(screen.getByLabelText('Descripción')).toBeTruthy();
  });
  it('edits edge routing and removes a waypoint without mutation', () => {
    const edgeDoc: Diagram = { ...doc, elements: [...doc.elements, { ...node, id: 'job2' }], edges: [{ id: 'e', source: 'job1', target: 'job2', sourcePort: 'bottom', targetPort: 'top', routing: 'orthogonal', waypoints: [{ x: 5, y: 7 }], color: '#000000', width: 2 }] };
    const change = vi.fn();
    render(<Inspector doc={edgeDoc} selection={{ elementIds: [], edgeIds: ['e'] }} onChange={change} />);
    fireEvent.change(screen.getByLabelText('Recorrido'), { target: { value: 'straight' } });
    expect(change.mock.calls[0][0].edges[0].routing).toBe('straight');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar punto 1' }));
    expect(change.mock.calls[1][0].edges[0].waypoints).toEqual([]);
    expect(edgeDoc.edges[0].routing).toBe('orthogonal');
    expect(edgeDoc.edges[0].waypoints).toEqual([{ x: 5, y: 7 }]);
  });
});
