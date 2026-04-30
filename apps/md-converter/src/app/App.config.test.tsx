import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { saveModeConfig, clearConfig } from '../lib/modeConfig';
import { STORAGE_PREFIX } from '../lib/constants';

describe('Config Modal Dynamic Sections', () => {
  beforeEach(() => {
    localStorage.clear();
    clearConfig();
  });

  it('SHALL show "Documento" section for markdown-to-docx mode', () => {
    // Set mode to markdown-to-docx via localStorage
    localStorage.setItem(`${STORAGE_PREFIX}conversionMode`, '"markdown-to-docx"');

    render(<App />);

    const configButton = screen.getByText('Configuración');
    fireEvent.click(configButton);

    // Should show "Documento" section (not "Libro")
    expect(screen.queryByText('Documento')).not.toBeNull();
    expect(screen.queryByText('Libro')).toBeNull();
  });

  it('SHALL show only document-specific inputs for markdown-to-docx mode', async () => {
    const user = userEvent.setup();
    localStorage.setItem(`${STORAGE_PREFIX}conversionMode`, '"markdown-to-docx"');

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Configuración' }));
    const dialog = screen.getByRole('dialog', { name: 'Configuración DOCX' });

    expect(within(dialog).getByRole('button', { name: 'Documento' })).not.toBeNull();
    expect(within(dialog).queryByRole('button', { name: 'Estilos' })).toBeNull();
    expect(within(dialog).getByLabelText('Reference DOCX')).not.toBeNull();
    expect(within(dialog).getByLabelText('Highlight style')).not.toBeNull();
    expect(within(dialog).queryByLabelText('Math rendering')).toBeNull();
    expect(within(dialog).queryByLabelText('Título')).toBeNull();
  });

  it('SHALL show "Documento" and "Estilos" sections for markdown-to-html mode', () => {
    localStorage.setItem(`${STORAGE_PREFIX}conversionMode`, '"markdown-to-html"');

    render(<App />);

    const configButton = screen.getByText('Configuración');
    fireEvent.click(configButton);

    // Should show both "Documento" and "Estilos" sections
    expect(screen.queryByText('Documento')).not.toBeNull();
    expect(screen.queryByText('Estilos')).not.toBeNull();
  });

  it('SHALL show html document inputs without reference-doc and reuse the css section', async () => {
    const user = userEvent.setup();
    localStorage.setItem(`${STORAGE_PREFIX}conversionMode`, '"markdown-to-html"');

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Configuración' }));
    const dialog = screen.getByRole('dialog', { name: 'Configuración HTML' });

    expect(within(dialog).getByLabelText('Math rendering')).not.toBeNull();
    expect(within(dialog).getByLabelText('Highlight style')).not.toBeNull();
    expect(within(dialog).queryByLabelText('Reference DOCX')).toBeNull();

    await user.click(within(dialog).getByRole('button', { name: 'Estilos' }));

    expect(within(dialog).getByRole('button', { name: 'Importar .css' })).not.toBeNull();
    expect(within(dialog).getByRole('textbox')).not.toBeNull();
  });

  it('SHALL load mode-specific config when opening config', async () => {
    // Save config for docx mode
    saveModeConfig('markdown-to-docx', { tocDepth: 5, highlightStyle: 'zenburn' });

    localStorage.setItem(`${STORAGE_PREFIX}conversionMode`, '"markdown-to-docx"');

    render(<App />);

    const configButton = screen.getByText('Configuración');
    fireEvent.click(configButton);

    // Should load the saved document config
    await waitFor(() => {
      expect((screen.getByLabelText('Profundidad del TOC') as HTMLInputElement).value).toBe('5');
      expect((screen.getByLabelText('Highlight style') as HTMLSelectElement).value).toBe('zenburn');
    });
  });
});
