import { fireEvent, render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  runPandocInWorker: vi.fn(),
  downloadBlob: vi.fn()
}));

vi.mock('./registerSW', () => ({
  registerSW: vi.fn(),
  getInstallState: () => ({ canInstall: false, isInstalled: false }),
  subscribeInstallState: () => () => {},
  triggerInstall: vi.fn()
}));

vi.mock('../lib/workerClient', () => ({
  runPandocInWorker: mocks.runPandocInWorker
}));

vi.mock('../lib/download', async () => {
  const actual = await vi.importActual<typeof import('../lib/download')>('../lib/download');
  return {
    ...actual,
    downloadBlob: mocks.downloadBlob
  };
});

import { App } from './App';

type WorkerResult = {
  outputBytes: Uint8Array;
  outputFilename: string;
  mimeType: string;
  logs: string;
};

beforeEach(() => {
  localStorage.clear();
  mocks.runPandocInWorker.mockReset();
  mocks.downloadBlob.mockReset();
});

test('rejects incompatible files for the active conversion mode', async () => {
  const user = userEvent.setup({ applyAccept: false });
  const { container } = render(<App />);

  await user.selectOptions(screen.getByRole('combobox', { name: 'Conversión' }), 'docx-to-markdown');
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;

  await user.upload(input, new File(['plain text'], 'notes.txt', { type: 'text/plain' }));

  expect(screen.getByRole('alert')).not.toBeNull();
  expect(screen.getByText('El archivo seleccionado no es compatible con la conversión activa.')).not.toBeNull();
});

test('shows a mode-specific running status and downloads html output', async () => {
  const user = userEvent.setup();
  let resolveJob: (value: WorkerResult) => void = () => {};
  mocks.runPandocInWorker.mockImplementation(() => new Promise<WorkerResult>((resolve) => {
    resolveJob = resolve;
  }));

  render(<App />);

  await user.selectOptions(screen.getByRole('combobox', { name: 'Conversión' }), 'markdown-to-html');
  await user.click(screen.getByRole('button', { name: 'Convertir y descargar HTML' }));

  expect(screen.getAllByText('Generando HTML…').length).toBeGreaterThan(0);

  resolveJob({
    outputBytes: new TextEncoder().encode('<h1>Hola</h1>'),
    outputFilename: 'mi-libro.html',
    mimeType: 'text/html',
    logs: 'html ok'
  });

  await waitFor(() => {
    expect(mocks.downloadBlob).toHaveBeenCalledTimes(1);
  });

  const [blob, filename] = mocks.downloadBlob.mock.calls[0];
  expect(filename).toBe('mi-libro.html');
  expect(blob).toBeInstanceOf(Blob);
  expect((blob as Blob).type).toBe('text/html');
  expect(mocks.runPandocInWorker).toHaveBeenCalledWith(expect.objectContaining({ conversionMode: 'markdown-to-html' }));
});

test('passes saved html configuration to the worker', async () => {
  const user = userEvent.setup();
  mocks.runPandocInWorker.mockResolvedValue({
    outputBytes: new TextEncoder().encode('<h1>Hola</h1>'),
    outputFilename: 'mi-libro.html',
    mimeType: 'text/html',
    logs: 'html ok'
  });

  render(<App />);

  await user.selectOptions(screen.getByRole('combobox', { name: 'Conversión' }), 'markdown-to-html');
  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  await user.selectOptions(screen.getByLabelText('Math rendering'), 'mathjax');
  await user.selectOptions(screen.getByLabelText('Highlight style'), 'zenburn');
  await user.click(screen.getByRole('button', { name: 'Estilos' }));
  const dialog = screen.getByRole('dialog', { name: 'Configuración HTML' });
  const cssEditor = within(dialog).getByRole('textbox');
  await user.clear(cssEditor);
  fireEvent.input(cssEditor, { target: { value: 'body { color: red; }' } });
  await user.click(screen.getByRole('button', { name: 'Guardar' }));
  await user.click(screen.getByRole('button', { name: 'Convertir y descargar HTML' }));

  await waitFor(() => {
    expect(mocks.runPandocInWorker).toHaveBeenCalledTimes(1);
  });

  expect(mocks.runPandocInWorker).toHaveBeenCalledWith(expect.objectContaining({
    conversionMode: 'markdown-to-html',
    css: 'body { color: red; }',
    mathRendering: 'mathjax',
    highlightStyle: 'zenburn'
  }));
});

test('passes uploaded docx reference document to the worker', async () => {
  const user = userEvent.setup();
  mocks.runPandocInWorker.mockResolvedValue({
    outputBytes: new Uint8Array([1, 2, 3]),
    outputFilename: 'mi-libro.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    logs: 'docx ok'
  });

  render(<App />);

  const referenceFile = new File([new Uint8Array([4, 5, 6])], 'reference.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  Object.defineProperty(referenceFile, 'arrayBuffer', {
    value: () => Promise.resolve(new Uint8Array([4, 5, 6]).buffer)
  });

  await user.selectOptions(screen.getByRole('combobox', { name: 'Conversión' }), 'markdown-to-docx');
  await user.click(screen.getByRole('button', { name: 'Configuración' }));
  await user.upload(screen.getByLabelText('Reference DOCX'), referenceFile);
  await user.click(screen.getByRole('button', { name: 'Guardar' }));
  await user.click(screen.getByRole('button', { name: 'Convertir y descargar Word' }));

  await waitFor(() => {
    expect(mocks.runPandocInWorker).toHaveBeenCalledTimes(1);
  });

  expect(mocks.runPandocInWorker).toHaveBeenCalledWith(expect.objectContaining({
    conversionMode: 'markdown-to-docx',
    referenceDoc: {
      name: 'reference.docx',
      bytes: new Uint8Array([4, 5, 6])
    }
  }));
});

test.skip('converts imported docx files into editable markdown before download', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.selectOptions(screen.getByRole('combobox', { name: 'Conversión' }), 'docx-to-markdown');
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  await user.upload(input, new File([new Uint8Array([1, 2, 3])], 'draft.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }));

  await user.click(screen.getByRole('button', { name: 'Convertir y descargar Markdown' }));

  await waitFor(() => {
    expect(mocks.runPandocInWorker).toHaveBeenCalledTimes(1);
  });

  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain('# Convertido');
  expect(mocks.runPandocInWorker).toHaveBeenCalledWith(expect.objectContaining({ conversionMode: 'docx-to-markdown' }));
});
