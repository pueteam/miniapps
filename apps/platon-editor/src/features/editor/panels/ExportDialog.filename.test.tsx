import { render, screen } from '@testing-library/preact';
import { expect, it, vi } from 'vitest';
import { emptyDiagram } from '../model/document';
import { ExportDialog } from './ExportDialog';

it('muestra el nombre del archivo que se descargará', () => {
  const doc = { ...emptyDiagram(), metadata: { ...emptyDiagram().metadata, title: 'Mi/Cadena' } };
  render(<ExportDialog doc={doc} onClose={vi.fn()} />);
  expect(screen.getByText((_content, el) => el?.textContent === 'Se descargará como Mi-Cadena.png.')).toBeTruthy();
});
