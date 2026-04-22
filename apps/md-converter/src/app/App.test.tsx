import { render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { vi, test, expect } from 'vitest';

vi.mock('./registerSW', () => ({
  registerSW: vi.fn(),
  getInstallState: () => ({ canInstall: false, isInstalled: false }),
  subscribeInstallState: () => () => {},
  triggerInstall: vi.fn()
}));

import { App } from './App';

test('shows a visible settings action and removes standalone metadata and css panels from the main screen', () => {
  render(<App />);

  expect(screen.getByRole('button', { name: 'Configuración' })).not.toBeNull();
  expect(screen.queryByRole('heading', { name: 'Metadatos del libro' })).toBeNull();
  expect(screen.queryByRole('heading', { name: 'CSS del EPUB' })).toBeNull();
  expect(screen.getByRole('heading', { name: 'Contenido Markdown' })).not.toBeNull();
  expect(screen.getByRole('heading', { name: 'Estado de la conversión' })).not.toBeNull();
});

test('opens a settings dialog with libro and estilos sections plus save and cancel actions', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Configuración' }));

  expect(screen.getByRole('dialog', { name: 'Configuración EPUB' })).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Libro' })).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Estilos' })).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Guardar' })).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Cancelar' })).not.toBeNull();
  expect(screen.getByRole('textbox', { name: 'Título' })).not.toBeNull();
});

test('saves confirmed book settings and restores them when reopening the dialog', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  const titleInput = screen.getByRole('textbox', { name: 'Título' });
  await user.clear(titleInput);
  await user.type(titleInput, 'Libro guardado');
  await user.click(screen.getByRole('button', { name: 'Guardar' }));

  await waitFor(() => {
    expect(localStorage.getItem('miniapps:md-converter:title')).toBe(JSON.stringify('Libro guardado'));
  });

  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  expect((screen.getByRole('textbox', { name: 'Título' }) as HTMLInputElement).value).toBe('Libro guardado');
});

test('shows cover upload in libro and css editor in estilos inside the settings dialog', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  expect(screen.getByLabelText('Portada')).not.toBeNull();

  await user.click(screen.getByRole('button', { name: 'Estilos' }));
  const dialog = screen.getByRole('dialog', { name: 'Configuración EPUB' });
  expect(within(dialog).getByRole('button', { name: 'Importar .css' })).not.toBeNull();
  expect(within(dialog).getByRole('textbox')).not.toBeNull();
});

test('imports css into the dialog draft and persists it only after saving', async () => {
  const user = userEvent.setup();

  render(<App />);

  const persistedCssBefore = localStorage.getItem('miniapps:md-converter:css');

  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  await user.click(screen.getByRole('button', { name: 'Estilos' }));

  const dialog = screen.getByRole('dialog', { name: 'Configuración EPUB' });
  const cssInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
  const cssFile = new File(['body { color: red; }'], 'theme.css', { type: 'text/css' });

  await user.upload(cssInput, cssFile);

  await waitFor(() => {
    expect((within(dialog).getByRole('textbox') as HTMLTextAreaElement).value).toContain('color: red');
  });
  expect(localStorage.getItem('miniapps:md-converter:css')).toBe(persistedCssBefore);

  await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

  await waitFor(() => {
    expect(localStorage.getItem('miniapps:md-converter:css')).toBe(JSON.stringify('body { color: red; }'));
  });
});

test('pressing escape closes the dialog and discards unsaved settings changes', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  const titleInput = screen.getByRole('textbox', { name: 'Título' });
  await user.clear(titleInput);
  await user.type(titleInput, 'Cambio descartado');

  await user.keyboard('{Escape}');

  expect(screen.queryByRole('dialog', { name: 'Configuración EPUB' })).toBeNull();

  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  expect((screen.getByRole('textbox', { name: 'Título' }) as HTMLInputElement).value).toBe('Mi libro');
});

test('clicking the backdrop closes the dialog and discards unsaved settings changes', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  const titleInput = screen.getByRole('textbox', { name: 'Título' });
  await user.clear(titleInput);
  await user.type(titleInput, 'Cambio por backdrop');

  await user.click(document.querySelector('.modal-backdrop') as HTMLElement);

  expect(screen.queryByRole('dialog', { name: 'Configuración EPUB' })).toBeNull();

  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  expect((screen.getByRole('textbox', { name: 'Título' }) as HTMLInputElement).value).toBe('Mi libro');
});
