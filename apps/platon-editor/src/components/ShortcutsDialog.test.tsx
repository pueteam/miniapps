import { fireEvent, render, screen } from '@testing-library/preact';
import { useState } from 'preact/hooks';
import { expect, it, vi } from 'vitest';
import { ShortcutsDialog } from './ShortcutsDialog';

it('lista los atajos de teclado y se cierra', () => {
  const onClose = vi.fn();
  render(<ShortcutsDialog onClose={onClose} />);
  for (const shortcut of ['Supr', 'Ctrl+Z', 'Ctrl+Y', 'Ctrl+D', 'Escape', 'Espacio']) {
    expect(screen.getByText(shortcut, { exact: false })).toBeTruthy();
  }
  fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
  expect(onClose).toHaveBeenCalledOnce();
});

it.each(['Escape', 'backdrop'])('devuelve el foco al disparador tras cerrar con %s', (dismissal) => {
  function WithTrigger() {
    const [open, setOpen] = useState(false);

    return <><button onClick={() => setOpen(true)}>Abrir ayuda</button>{open && <ShortcutsDialog onClose={() => setOpen(false)} />}</>;
  }

  render(<WithTrigger />);
  const opener = screen.getByRole('button', { name: 'Abrir ayuda' });
  opener.focus();
  fireEvent.click(opener);
  const dialog = screen.getByRole('dialog', { name: 'Atajos de teclado' });
  const close = screen.getByRole('button', { name: 'Cerrar' });
  expect(document.activeElement).toBe(close);

  fireEvent.click(dialog);
  expect(screen.queryByRole('dialog')).toBe(dialog);

  if (dismissal === 'Escape') fireEvent.keyDown(close, { key: 'Escape' });
  else fireEvent.click(dialog.parentElement!);

  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
});
