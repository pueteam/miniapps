import { fireEvent, render, screen } from '@testing-library/preact';
import { useState } from 'preact/hooks';
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
  it('leaves the panel landmark and heading to the editor', () => {
    render(<Inspector doc={doc} selection={selected} onChange={vi.fn()} />);
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
  });
  it.each([['Grosor del borde', 'Redondeo'], ['Ancho', 'Alto'], ['X', 'Y']])('pairs %s with %s', (first, second) => {
    render(<Inspector doc={doc} selection={selected} onChange={vi.fn()} />);
    const row = screen.getByLabelText(first).closest('.field-row');
    expect(row?.contains(screen.getByLabelText(second))).toBe(true);
  });
  it('groups presets by category', () => {
    render(<Inspector doc={doc} selection={selected} onChange={vi.fn()} />);
    const preset = screen.getByLabelText<HTMLSelectElement>('Preset');
    expect(Array.from(preset.querySelectorAll('optgroup'), (group) => group.label)).toEqual(['Monitorización', 'Planificación']);
    expect(preset.querySelector('optgroup[label="Monitorización"] option[value="monitor-abort-warning"]')).toBeTruthy();
    expect(preset.querySelector('optgroup[label="Planificación"] option[value="planning-planned"]')).toBeTruthy();
  });
  it.each([
    ['transparent', '#000000'],
    ['#aB3', '#aabb33'],
    ['#aB37', '#aabb33'],
    ['#aAbB3377', '#aabb33'],
  ])('shows %s in the picker as %s without saving that conversion', (fill, pickerValue) => {
    const change = vi.fn();
    const colored = { ...doc, elements: [{ ...node, style: { ...node.style, fill } }] };
    render(<Inspector doc={colored} selection={selected} onChange={change} />);
    expect(screen.getByLabelText<HTMLInputElement>('Selector de color de relleno').value).toBe(pickerValue);
    expect(screen.getByLabelText<HTMLInputElement>('Relleno').value).toBe(fill);
    expect(change).not.toHaveBeenCalled();
  });
  it('synchronizes color text and picker while committing only deliberate edits', () => {
    const change = vi.fn();
    function StatefulInspector() {
      const [current, setCurrent] = useState(doc);
      return <Inspector doc={current} selection={selected} onChange={(next) => { change(next); setCurrent(next); }} />;
    }
    render(<StatefulInspector />);
    const hex = screen.getByLabelText<HTMLInputElement>('Relleno');
    const picker = screen.getByLabelText<HTMLInputElement>('Selector de color de relleno');

    fireEvent.input(hex, { target: { value: '#0a8' } });
    expect(picker.value).toBe('#00aa88');
    expect(change).not.toHaveBeenCalled();
    fireEvent.blur(hex);
    expect(change.mock.calls[0][0].elements[0].style.fill).toBe('#0a8');

    fireEvent.input(hex, { target: { value: 'invalido' } });
    fireEvent.blur(hex);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(picker.value).toBe('#00aa88');
    fireEvent.change(picker, { target: { value: '#112233' } });
    expect(hex.value).toBe('#112233');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(change).toHaveBeenCalledTimes(2);
    expect(change.mock.calls[1][0].elements[0].style.fill).toBe('#112233');
  });
  it('aligns the selected elements in one update after explicit confirmation', () => {
    const two = { ...doc, elements: [node, { ...node, id: 'job2', position: { x: 90, y: 55 } }] };
    const change = vi.fn();
    render(<Inspector doc={two} selection={{ elementIds: ['job1', 'job2'], edgeIds: [] }} onChange={change} />);
    const alignment = screen.getByLabelText<HTMLSelectElement>('Alinear selección');
    const apply = screen.getByRole<HTMLButtonElement>('button', { name: 'Alinear', exact: true });
    expect(apply.disabled).toBe(true);
    fireEvent.change(alignment, { target: { value: 'left' } });
    fireEvent.change(alignment, { target: { value: 'right' } });
    expect(change).not.toHaveBeenCalled();
    expect(alignment.value).toBe('right');
    expect(apply.disabled).toBe(false);
    fireEvent.click(apply);
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0].elements.map((element: DiagramElement) => element.position)).toEqual([{ x: 90, y: 20 }, { x: 90, y: 55 }]);
  });
  it('applies the first element’s preset to every selected element in one update', () => {
    const palette = { fill: '#ffff00', stroke: '#000000', color: '#000000', presetId: 'monitor-wait' };
    const first = { ...node, style: { ...node.style, ...palette } };
    const second = { ...node, id: 'job2', style: { ...node.style, bold: true } };
    const third = { ...node, id: 'job3' };
    const multiple = { ...doc, elements: [first, second, third] };
    const change = vi.fn();
    render(<Inspector doc={multiple} selection={{ elementIds: ['job1', 'job2'], edgeIds: [] }} onChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar preset a la selección' }));
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0].elements).toEqual([first, { ...second, style: { ...second.style, ...palette } }, third]);
  });
  it.each([undefined, 'unknown-v1-preset'])('disables bulk styling when the first preset is %s', (presetId) => {
    const first = { ...node, style: { ...node.style, ...(presetId ? { presetId } : {}) } };
    const two = { ...doc, elements: [first, { ...node, id: 'job2' }] };
    render(<Inspector doc={two} selection={{ elementIds: ['job1', 'job2'], edgeIds: [] }} onChange={vi.fn()} />);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Aplicar preset a la selección' }).disabled).toBe(true);
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
