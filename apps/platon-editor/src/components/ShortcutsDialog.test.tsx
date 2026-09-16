import { fireEvent, render, screen } from '@testing-library/preact';
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
