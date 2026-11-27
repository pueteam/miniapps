import { fireEvent, render, screen } from '@testing-library/preact';
import { expect, it, vi } from 'vitest';
import { exportPng } from '../export/png';
import { emptyDiagram } from '../model/document';
import { downloadBlob } from '../persistence/files';
import { ExportDialog } from './ExportDialog';

vi.mock('../export/png', () => ({ exportPng: vi.fn() }));
vi.mock('../persistence/files', async (original) => ({ ...await original<typeof import('../persistence/files')>(), downloadBlob: vi.fn() }));

it('muestra el nombre del archivo que se descargará', () => {
  const doc = { ...emptyDiagram(), metadata: { ...emptyDiagram().metadata, title: 'Mi/Cadena' } };
  render(<ExportDialog doc={doc} onClose={vi.fn()} />);
  expect(screen.getByText((_content, el) => el?.textContent === 'Se descargará como Mi-Cadena.png.')).toBeTruthy();
});

it('contiene el foco y permite cerrar con Escape', () => {
  const onClose = vi.fn();
  render(<ExportDialog doc={emptyDiagram()} onClose={onClose} />);
  const first = screen.getByLabelText('Formato');
  const last = screen.getByRole('button', { name: 'Exportar PNG' });
  expect(document.activeElement).toBe(first);

  fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(last);
  fireEvent.keyDown(last, { key: 'Tab' });
  expect(document.activeElement).toBe(first);

  fireEvent.keyDown(first, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledOnce();
});

it('descarga SVG con el nombre saneado y conserva la resolución del PNG al cambiar de formato', async () => {
  const doc = emptyDiagram();
  doc.metadata.title = 'Mi/Cadena';
  const onClose = vi.fn();
  render(<ExportDialog doc={doc} onClose={onClose} />);
  const format = screen.getByLabelText('Formato');

  fireEvent.change(screen.getByLabelText('Resolución'), { target: { value: '1' } });
  fireEvent.change(format, { target: { value: 'svg' } });
  expect(screen.queryByLabelText('Resolución')).toBeNull();
  expect(screen.getByText('Se descargará como Mi-Cadena.svg.')).toBeTruthy();

  fireEvent.change(format, { target: { value: 'png' } });
  expect((screen.getByLabelText('Resolución') as HTMLSelectElement).value).toBe('1');
  fireEvent.change(format, { target: { value: 'svg' } });
  fireEvent.click(screen.getByRole('button', { name: 'Exportar SVG' }));

  expect(vi.mocked(downloadBlob)).toHaveBeenCalledWith(expect.objectContaining({ type: 'image/svg+xml' }), 'Mi-Cadena.svg');
  expect(onClose).toHaveBeenCalledOnce();
});

it('impide cerrar mientras genera la imagen y vuelve a permitirlo si falla', async () => {
  const onClose = vi.fn();
  let rejectExport: (error: Error) => void = () => {};
  vi.mocked(exportPng).mockReturnValueOnce(new Promise((_resolve, reject) => { rejectExport = reject; }));
  render(<ExportDialog doc={emptyDiagram()} onClose={onClose} />);
  const dialog = screen.getByRole('dialog', { name: 'Exportar como PNG' });
  const exportButton = screen.getByRole('button', { name: 'Exportar PNG' });
  exportButton.focus();
  fireEvent.click(exportButton);
  expect(dialog.contains(document.activeElement)).toBe(true);

  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  (document.activeElement as HTMLElement).blur();
  fireEvent.click(dialog.parentElement!);
  expect(onClose).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(dialog);

  rejectExport(new Error('Error de exportación'));
  await screen.findByRole('alert');
  fireEvent.click(dialog.parentElement!);
  expect(onClose).toHaveBeenCalledOnce();
});
