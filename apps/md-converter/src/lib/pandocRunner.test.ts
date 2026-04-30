import { File } from '@bjorn3/browser_wasi_shim';
import { describe, expect, test } from 'vitest';
import { buildArgs, buildPreopenDirectory } from './pandocRunner';

describe('pandocRunner', () => {
  test('builds html conversion arguments without epub-only options', () => {
    const args = buildArgs({
      conversionMode: 'markdown-to-html',
      markdown: '# Hola',
      wasmBytes: null
    } as never);

    expect(args).toContain('--from=markdown');
    expect(args).toContain('--to=html');
    expect(args).toContain('document.md');
    expect(args).toContain('document.html');
    expect(args).not.toContain('--metadata-file=metadata.yaml');
    expect(args).not.toContain('--css=epub.css');
    expect(args).not.toContain('--toc');
  });

  test('mounts binary source files for imports to markdown', () => {
    const root = buildPreopenDirectory({
      conversionMode: 'docx-to-markdown',
      sourceFile: {
        name: 'draft.docx',
        bytes: new Uint8Array([1, 2, 3])
      },
      wasmBytes: null
    } as never);

    expect(root.dir.contents.get('draft.docx')).toBeInstanceOf(File);
    expect(root.dir.contents.get('document.md')).toBeInstanceOf(File);
    expect(root.dir.contents.has('metadata.yaml')).toBe(false);
    expect(root.dir.contents.has('epub.css')).toBe(false);
  });

  test('keeps epub-specific resources for markdown to epub conversions', () => {
    const args = buildArgs({
      conversionMode: 'markdown-to-epub',
      markdown: '# Hola',
      css: 'body {}',
      metadataYaml: 'title: Libro',
      toc: true,
      tocDepth: 3,
      splitLevel: 1,
      cover: {
        name: 'portada final.png',
        bytes: new Uint8Array([1, 2, 3])
      },
      wasmBytes: null
    } as never);

    expect(args).toContain('--to=epub3');
    expect(args).toContain('--metadata-file=metadata.yaml');
    expect(args).toContain('--css=epub.css');
    expect(args).toContain('--toc');
    expect(args).toContain('--epub-cover-image=portada_final.png');
    expect(args).toContain('book.epub');
  });

  test('builds docx arguments with reference-doc and toc options', () => {
    const args = buildArgs({
      conversionMode: 'markdown-to-docx',
      markdown: '# Hola',
      referenceDoc: {
        name: 'template.docx',
        bytes: new Uint8Array([1, 2, 3])
      },
      toc: true,
      tocDepth: 2,
      highlightStyle: 'pygments',
      wasmBytes: null
    } as never);

    expect(args).toContain('--to=docx');
    expect(args).toContain('--reference-doc=template.docx');
    expect(args).toContain('--toc');
    expect(args).toContain('--toc-depth=2');
    expect(args).toContain('--highlight-style=pygments');
    expect(args).toContain('document.docx');
  });

  test('builds html arguments with css, mathjax and highlight options', () => {
    const args = buildArgs({
      conversionMode: 'markdown-to-html',
      markdown: '# Hola',
      css: 'body { color: red; }',
      toc: true,
      tocDepth: 3,
      mathRendering: 'mathjax',
      highlightStyle: 'zenburn',
      wasmBytes: null
    } as never);

    expect(args).toContain('--to=html');
    expect(args).toContain('--css=document.css');
    expect(args).toContain('--toc');
    expect(args).toContain('--toc-depth=3');
    expect(args).toContain('--mathjax');
    expect(args).toContain('--highlight-style=zenburn');
    expect(args).not.toContain('--reference-doc');
  });

  test('builds html arguments with katex option', () => {
    const args = buildArgs({
      conversionMode: 'markdown-to-html',
      markdown: '# Hola',
      mathRendering: 'katex',
      wasmBytes: null
    } as never);

    expect(args).toContain('--katex');
    expect(args).not.toContain('--mathjax');
  });

  test('mounts reference-doc for docx conversions', () => {
    const root = buildPreopenDirectory({
      conversionMode: 'markdown-to-docx',
      markdown: '# Hola',
      referenceDoc: {
        name: 'template.docx',
        bytes: new Uint8Array([1, 2, 3])
      },
      wasmBytes: null
    } as never);

    expect(root.dir.contents.get('template.docx')).toBeInstanceOf(File);
    expect(root.dir.contents.has('document.css')).toBe(false);
  });

  test('mounts css for html conversions', () => {
    const root = buildPreopenDirectory({
      conversionMode: 'markdown-to-html',
      markdown: '# Hola',
      css: 'body { color: red; }',
      wasmBytes: null
    } as never);

    expect(root.dir.contents.get('document.css')).toBeInstanceOf(File);
    expect(root.dir.contents.has('epub.css')).toBe(false);
  });
});
