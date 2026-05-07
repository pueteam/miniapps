import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { db } from '../features/sticky-board/persistence/notesRepository';
import { stickyBoardController } from '../features/sticky-board/state/useStickyBoardController';

describe('Sticky Board app', () => {
  afterEach(async () => {
    cleanup();
    vi.restoreAllMocks();
    stickyBoardController.store.searchQuery.value = '';
    stickyBoardController.store.importNotes([]);
    await db.notes.clear();
  });

  it('creates, edits and searches a sticky note', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    const editor = await screen.findByLabelText(/contenido de la nota/i);
    expect(editor.hasAttribute('readonly')).toBe(true);

    fireEvent.dblClick(editor);
    expect(editor.hasAttribute('readonly')).toBe(false);
    fireEvent.input(editor, { target: { value: 'Prioridad semanal' } });
    fireEvent.mouseDown(document.body);
    expect(editor.hasAttribute('readonly')).toBe(true);
    fireEvent.input(screen.getByLabelText(/buscar notas/i), { target: { value: 'semanal' } });

    expect(await screen.findByDisplayValue('Prioridad semanal')).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(/sin resultados/i)).toBeNull());
  });

  it('keeps non-matching notes visible but dimmed while highlighting matches', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    let editor = await screen.findByLabelText(/contenido de la nota/i);
    fireEvent.dblClick(editor);
    fireEvent.input(editor, { target: { value: 'Prioridad semanal' } });
    fireEvent.mouseDown(document.body);

    fireEvent.click(screen.getByRole('button', { name: /nueva nota/i }));
    const editors = await screen.findAllByLabelText(/contenido de la nota/i);
    editor = editors[editors.length - 1];
    fireEvent.dblClick(editor);
    fireEvent.input(editor, { target: { value: 'Comprar cafe' } });
    fireEvent.mouseDown(document.body);

    fireEvent.input(screen.getByLabelText(/buscar notas/i), { target: { value: 'semanal' } });

    expect(await screen.findByDisplayValue('Prioridad semanal')).toBeTruthy();
    expect(screen.getByDisplayValue('Comprar cafe')).toBeTruthy();
    expect(screen.getByText('semanal').tagName.toLowerCase()).toBe('mark');
    expect(screen.getByLabelText('Nota sticky sin coincidencia de busqueda')).toBeTruthy();
  });

  it('shows a circular rotation dial instead of a slider', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    const rotateButton = await screen.findByRole('button', { name: /girar nota/i });

    fireEvent.click(rotateButton);
    expect(screen.getByLabelText(/dial de rotacion de la nota/i)).toBeTruthy();
    expect(screen.queryByRole('slider')).toBeNull();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByLabelText(/dial de rotacion de la nota/i)).toBeNull();
  });

  it('closes the rotation dial on outside pointer down', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    fireEvent.click(await screen.findByRole('button', { name: /girar nota/i }));
    expect(screen.getByLabelText(/dial de rotacion de la nota/i)).toBeTruthy();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByLabelText(/dial de rotacion de la nota/i)).toBeNull();
  });

  it('uses only the header button to show the rotation dial', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));

    expect(screen.queryByRole('button', { name: /rotar nota arrastrando/i })).toBeNull();
    fireEvent.click(await screen.findByRole('button', { name: /girar nota/i }));
    expect(screen.getByLabelText(/dial de rotacion de la nota/i)).toBeTruthy();
  });

  it('hides rotation and controls while pinned and allows unpinning from the lock button', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    const editor = await screen.findByLabelText(/contenido de la nota/i);

    fireEvent.click(screen.getByRole('button', { name: /fijar nota/i }));

    expect(screen.queryByRole('button', { name: /girar nota/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /borrar nota/i })).toBeNull();
    expect(screen.queryByLabelText(/cambiar color de la nota/i)).toBeNull();
    expect(screen.queryByLabelText(/redimensionar nota/i)).toBeNull();
    expect(editor.hasAttribute('readonly')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /desfijar nota/i }));

    expect(await screen.findByRole('button', { name: /girar nota/i })).toBeTruthy();
    expect(await screen.findByLabelText(/redimensionar nota/i)).toBeTruthy();
  });

  it('asks for confirmation before deleting a sticky note', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    const editor = await screen.findByLabelText(/contenido de la nota/i);
    fireEvent.input(editor, { target: { value: 'No borrar todavia' } });
    fireEvent.click(screen.getByRole('button', { name: /borrar nota/i }));

    expect(confirm).toHaveBeenCalledWith('Quieres eliminar este post-it?');
    expect(screen.getByDisplayValue('No borrar todavia')).toBeTruthy();
  });

  it('shows a subtle empty board hint before the first note is created', async () => {
    render(<App />);

    expect(await screen.findByText(/haz clic para crear tu primera nota/i)).toBeTruthy();
    expect(screen.queryByText(/sin resultados/i)).toBeNull();
  });

  it('marks the active color swatch with a checkmark and accessible color name', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    const activeSwatch = await screen.findByRole('button', { name: /color amarillo activo/i });

    expect(activeSwatch.getAttribute('aria-pressed')).toBe('true');
    expect(activeSwatch.getAttribute('title')).toBe('Amarillo');
    expect(activeSwatch.textContent).toContain('✓');
  });

  it('deselects the active sticky note when clicking outside it', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    expect(await screen.findByLabelText(/cambiar color de la nota/i)).toBeTruthy();

    fireEvent.pointerDown(screen.getByTestId('sticky-canvas'));

    expect(screen.queryByLabelText(/cambiar color de la nota/i)).toBeNull();
  });
});
