import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { initSync, toMarkdownBytes } from '@firecrawl/anydoc-wasm';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../tests/fixtures');
const wasmBytes = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../node_modules/@firecrawl/anydoc-wasm/anydoc_wasm_bg.wasm')
);
initSync({ module: wasmBytes });

describe('anydoc fixtures', () => {
  test('converts minimal docx to markdown offline', () => {
    const bytes = new Uint8Array(readFileSync(join(dir, 'draft.docx')));
    const md = toMarkdownBytes(bytes, 'docx');
    expect(md).toMatch(/Hola AnyDoc/);
  });

  test('converts minimal epub to markdown offline', () => {
    const bytes = new Uint8Array(readFileSync(join(dir, 'book.epub')));
    const md = toMarkdownBytes(bytes, 'epub');
    expect(md).toMatch(/Hola Epub/);
  });
});
