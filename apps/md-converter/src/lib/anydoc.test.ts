import { describe, expect, test, vi } from 'vitest';

vi.mock('@firecrawl/anydoc-wasm', () => ({
  default: vi.fn(),
  toMarkdownBytes: vi.fn((bytes: Uint8Array, format: string | null) => `# mocked ${format} ${bytes.length}`)
}));

import {
  anydocErrorToSpanish,
  anydocOutputBasename,
  convertAnydocToMarkdown,
  getAnydocHint,
  isAnydocMode
} from './anydoc';
import { toMarkdownBytes } from '@firecrawl/anydoc-wasm';

describe('anydoc', () => {
  test('routes only docx/epub imports through anydoc', () => {
    expect(isAnydocMode('docx-to-markdown')).toBe(true);
    expect(isAnydocMode('epub-to-markdown')).toBe(true);
    expect(isAnydocMode('html-to-markdown')).toBe(false);
    expect(isAnydocMode('markdown-to-epub')).toBe(false);
    expect(isAnydocMode('markdown-to-docx')).toBe(false);
    expect(isAnydocMode('markdown-to-html')).toBe(false);
  });

  test('derives wasm hint from filename', () => {
    expect(getAnydocHint('draft.docx')).toBe('docx');
    expect(getAnydocHint('BOOK.EPUB')).toBe('epub');
    expect(getAnydocHint('notes.txt')).toBeUndefined();
  });

  test('passes hint to toMarkdownBytes', () => {
    convertAnydocToMarkdown(new Uint8Array([1, 2, 3]), 'draft.docx');
    expect(toMarkdownBytes).toHaveBeenCalledWith(expect.any(Uint8Array), 'docx');

    convertAnydocToMarkdown(new Uint8Array([1]), 'book.epub');
    expect(toMarkdownBytes).toHaveBeenCalledWith(expect.any(Uint8Array), 'epub');
  });

  test('maps every ConvertErrorCode to offline spanish', () => {
    expect(anydocErrorToSpanish({ code: 'needsOcr', message: 'p1' })).toMatch(/offline/i);
    expect(anydocErrorToSpanish({ code: 'encrypted' })).toMatch(/cifrado/i);
    expect(anydocErrorToSpanish({ code: 'unsupported' })).toMatch(/No soportado/i);
    expect(anydocErrorToSpanish({ code: 'malformed' })).toMatch(/dañado/i);
    expect(anydocErrorToSpanish({ code: 'resourceLimit' })).toMatch(/límites/i);
    expect(anydocErrorToSpanish({ code: 'missingPart' })).toMatch(/falta/i);
    expect(anydocErrorToSpanish(new Error('boom'))).toBe('boom');
  });

  test('derives output basename', () => {
    expect(anydocOutputBasename('draft.docx', 'document')).toBe('draft');
    expect(anydocOutputBasename('.docx', 'document')).toBe('document');
  });
});
