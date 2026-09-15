import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { initSync, toMarkdownBytes, type Format } from '@firecrawl/anydoc-wasm';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../../tests/fixtures');
const wasmBytes = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../node_modules/@firecrawl/anydoc-wasm/anydoc_wasm_bg.wasm')
);
initSync({ module: wasmBytes });

const cases: Array<[string, Format, RegExp]> = [
  ['draft.docx', 'docx', /Hola AnyDoc/],
  ['book.epub', 'epub', /Hola Epub/],
  ['sample.csv', 'csv', /Hola CSV/],
  ['sample.rtf', 'rtf', /Hola RTF/],
  ['sample.odt', 'odt', /Hola ODT/],
  ['sample.pptx', 'pptx', /Hola Slide/],
  ['sample.xlsx', 'xlsx', /Hola Celda/],
  ['sample.pdf', 'pdf', /Hola PDF/]
];

describe('anydoc fixtures', () => {
  test.each(cases)('converts minimal %s to markdown offline', (file, format, expected) => {
    const bytes = new Uint8Array(readFileSync(join(dir, file)));
    expect(toMarkdownBytes(bytes, format)).toMatch(expected);
  });
});
