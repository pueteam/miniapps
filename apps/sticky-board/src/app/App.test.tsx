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

  it('shows rotation popover, updates degrees, and closes when clicking outside', async () => {
    render(<App />);
    await screen.findByText(/tablero listo/i);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    const rotateButton = await screen.findByRole('button', { name: /girar nota/i });

    fireEvent.click(rotateButton);
    const slider = screen.getByLabelText(/rotacion de la nota/i);
    expect(slider.getAttribute('min')).toBe('-35');
    expect(slider.getAttribute('max')).toBe('35');

    fireEvent.input(slider, { target: { value: '22' } });
    expect(screen.getByText('+22°')).toBeTruthy();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByLabelText(/rotacion de la nota/i)).toBeNull();
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
});
