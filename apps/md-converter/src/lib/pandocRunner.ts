import {
  ConsoleStdout,
  Fd,
  File,
  type Inode,
  PreopenDirectory,
  WASI,
  WASIProcExit
} from '@bjorn3/browser_wasi_shim';
import type { BinaryInput, WorkerJobInput, WorkerJobResult } from './types';
import { getConversionModeDefinition } from './conversionModes';

const encoder = new TextEncoder();
const outputArgIndex = -3;

class NullStdin extends Fd {
  fd_read(): { ret: number; data: Uint8Array } {
    return { ret: 0, data: new Uint8Array() };
  }
}

function createLineCollector(target: string[]): ConsoleStdout {
  return ConsoleStdout.lineBuffered((message) => {
    target.push(message);
  });
}

export function sanitizeFilename(name: string): string {
  const sanitized = name.replace(/[^a-zA-Z0-9._-]+/g, '_');
  return sanitized || 'file';
}

export async function loadWasmBytes(inputBytes?: Uint8Array | null): Promise<Uint8Array> {
  if (inputBytes && inputBytes.byteLength > 0) {
    return inputBytes;
  }

  const response = await fetch(`${import.meta.env.BASE_URL}pandoc.wasm`);
  if (!response.ok) {
    throw new Error('No se pudo cargar pandoc.wasm desde public/. Añade el binario real al proyecto.');
  }

  return new Uint8Array(await response.arrayBuffer());
}

function getSourceFilename(payload: WorkerJobInput): string {
  const modeDefinition = getConversionModeDefinition(payload.conversionMode);

  if (modeDefinition.sourceKind === 'markdown') {
    return modeDefinition.outputFormat === 'epub3' ? 'book.md' : 'document.md';
  }

  return sanitizeFilename(payload.sourceFile?.name || `source.${modeDefinition.sourceFormat}`);
}

function getOutputFilename(payload: WorkerJobInput): string {
  const modeDefinition = getConversionModeDefinition(payload.conversionMode);
  const basename = payload.outputBasename || (modeDefinition.outputFormat === 'epub3' ? 'book' : 'document');

  if (modeDefinition.outputFormat === 'epub3') {
    return `${basename}.epub`;
  }

  return `${basename}.${modeDefinition.outputExtension}`;
}

function needsStandalone(payload: WorkerJobInput): boolean {
  const modeDefinition = getConversionModeDefinition(payload.conversionMode);
  return modeDefinition.outputFormat !== 'markdown';
}

function buildEpubArgs(payload: WorkerJobInput, args: string[]): void {
  args.splice(3, 0, '--metadata-file=metadata.yaml', '--resource-path=.', '--css=epub.css');
  args.splice(args.length + outputArgIndex, 0, `--toc-depth=${Math.max(1, Math.min(6, payload.tocDepth ?? 3))}`);
  args.splice(args.length + outputArgIndex, 0, `--split-level=${Math.max(1, Math.min(6, payload.splitLevel ?? 1))}`);

  if (payload.toc) {
    args.splice(args.length + outputArgIndex, 0, '--toc');
  }

  if (payload.cover) {
    args.splice(args.length + outputArgIndex, 0, `--epub-cover-image=${sanitizeFilename(payload.cover.name)}`);
  }
}

export function buildArgs(payload: WorkerJobInput, cover?: BinaryInput | null): string[] {
  const modeDefinition = getConversionModeDefinition(payload.conversionMode);
  const sourceFilename = getSourceFilename(payload);
  const outputFilename = getOutputFilename(payload);
  const args = [
    'pandoc',
    `--from=${modeDefinition.sourceFormat}`,
    `--to=${modeDefinition.outputFormat}`,
    '-o',
    outputFilename,
    sourceFilename
  ];

  if (needsStandalone(payload)) {
    args.splice(3, 0, '--standalone');
  }

  if (modeDefinition.outputFormat === 'epub3') {
    buildEpubArgs({ ...payload, cover: cover ?? payload.cover }, args);
  }

  if (modeDefinition.outputFormat === 'docx') {
    if (payload.referenceDoc) {
      args.splice(args.length + outputArgIndex, 0, `--reference-doc=${sanitizeFilename(payload.referenceDoc.name)}`);
    }
  }

  if (modeDefinition.outputFormat === 'html') {
    if (payload.css) {
      args.splice(args.length + outputArgIndex, 0, '--css=document.css');
    }
    if (payload.mathRendering === 'mathjax') {
      args.splice(args.length + outputArgIndex, 0, '--mathjax');
    } else if (payload.mathRendering === 'katex') {
      args.splice(args.length + outputArgIndex, 0, '--katex');
    }
  }

  if (payload.toc) {
    args.splice(args.length + outputArgIndex, 0, '--toc');
  }

  if (payload.tocDepth !== undefined) {
    args.splice(args.length + outputArgIndex, 0, `--toc-depth=${Math.max(1, Math.min(6, payload.tocDepth))}`);
  }

  if (payload.highlightStyle) {
    args.splice(args.length + outputArgIndex, 0, `--highlight-style=${payload.highlightStyle}`);
  }

  return args;
}

export function buildPreopenDirectory(payload: WorkerJobInput): PreopenDirectory {
  const modeDefinition = getConversionModeDefinition(payload.conversionMode);
  const sourceFilename = getSourceFilename(payload);
  const outputFilename = getOutputFilename(payload);
  const contents = new Map<string, Inode>([[outputFilename, new File(new Uint8Array())]]);

  if (modeDefinition.sourceKind === 'markdown') {
    contents.set(sourceFilename, new File(encoder.encode(payload.markdown || '')));
  } else if (payload.sourceFile) {
    contents.set(sourceFilename, new File(payload.sourceFile.bytes));
  }

  if (modeDefinition.outputFormat === 'epub3') {
    contents.set('epub.css', new File(encoder.encode(payload.css || '')));
    contents.set('metadata.yaml', new File(encoder.encode(payload.metadataYaml || '')));
  }

  if (modeDefinition.outputFormat === 'docx' && payload.referenceDoc) {
    contents.set(sanitizeFilename(payload.referenceDoc.name), new File(payload.referenceDoc.bytes));
  }

  if (modeDefinition.outputFormat === 'html' && payload.css) {
    contents.set('document.css', new File(encoder.encode(payload.css)));
  }

  if (payload.cover) {
    contents.set(sanitizeFilename(payload.cover.name), new File(payload.cover.bytes));
  }

  return new PreopenDirectory('/', contents);
}

export async function runPandoc(payload: WorkerJobInput): Promise<WorkerJobResult> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const root = buildPreopenDirectory(payload);
  const args = buildArgs(payload, payload.cover);
  const outputFilename = getOutputFilename(payload);
  const { outputMimeType } = getConversionModeDefinition(payload.conversionMode);

  const wasmBytes = new Uint8Array(await loadWasmBytes(payload.wasmBytes));
  const module = await WebAssembly.compile(wasmBytes);
  const wasi = new WASI(args, [], [
    new NullStdin(),
    createLineCollector(stdout),
    createLineCollector(stderr),
    root
  ]);

  const instance = await WebAssembly.instantiate(module, {
    wasi_snapshot_preview1: wasi.wasiImport
  });

  try {
    wasi.start(instance as WebAssembly.Instance & {
      exports: WebAssembly.Exports & {
        memory: WebAssembly.Memory;
        _start: () => unknown;
      };
    });
  } catch (error) {
    if (!(error instanceof WASIProcExit)) {
      throw error;
    }

    if (error.code !== 0) {
      const details = stderr.filter(Boolean).join('\n') || stdout.filter(Boolean).join('\n');
      throw new Error(details || `pandoc finalizó con código ${error.code}.`);
    }
  }

  const outputNode = root.dir.contents.get(outputFilename);
  if (!(outputNode instanceof File) || outputNode.data.byteLength === 0) {
    const details = stderr.filter(Boolean).join('\n') || stdout.filter(Boolean).join('\n');
    throw new Error(details || `Pandoc no generó el archivo ${outputFilename}.`);
  }

  return {
    outputBytes: outputNode.data,
    outputFilename,
    mimeType: outputMimeType,
    logs: [stdout.join('\n'), stderr.join('\n')].filter(Boolean).join('\n')
  };
}
