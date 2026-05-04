import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { db } from '../features/sticky-board/persistence/notesRepository';

describe('Sticky Board app', () => {
  afterEach(async () => {
    cleanup();
    await db.notes.clear();
  });

  it('creates, edits and searches a sticky note', async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: /nueva nota/i }));
    const editor = await screen.findByLabelText(/contenido de la nota/i);
    fireEvent.input(editor, { target: { value: 'Prioridad semanal' } });
    fireEvent.input(screen.getByLabelText(/buscar notas/i), { target: { value: 'semanal' } });

    expect(await screen.findByDisplayValue('Prioridad semanal')).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(/sin resultados/i)).toBeNull());
  });
});
