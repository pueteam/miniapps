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

export function buildArgs(payload: WorkerJobInput, cover?: BinaryInput | null): string[] {
  const args = [
    'pandoc',
    '--from=markdown',
    '--to=epub3',
    '--standalone',
    '--metadata-file=metadata.yaml',
    '--resource-path=.',
    '--css=epub.css',
    `--toc-depth=${Math.max(1, Math.min(6, payload.tocDepth))}`,
    `--split-level=${Math.max(1, Math.min(6, payload.splitLevel))}`,
    '-o',
    'book.epub',
    'book.md'
  ];

  if (payload.toc) {
    args.splice(args.length + outputArgIndex, 0, '--toc');
  }

  if (cover) {
    args.splice(args.length + outputArgIndex, 0, `--epub-cover-image=${sanitizeFilename(cover.name)}`);
  }

  return args;
}

export function buildPreopenDirectory(payload: WorkerJobInput): PreopenDirectory {
  const contents = new Map<string, Inode>([
    ['book.md', new File(encoder.encode(payload.markdown))],
    ['epub.css', new File(encoder.encode(payload.css))],
    ['metadata.yaml', new File(encoder.encode(payload.metadataYaml))],
    ['book.epub', new File(new Uint8Array())]
  ]);

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

  const outputNode = root.dir.contents.get('book.epub');
  if (!(outputNode instanceof File) || outputNode.data.byteLength === 0) {
    const details = stderr.filter(Boolean).join('\n') || stdout.filter(Boolean).join('\n');
    throw new Error(details || 'Pandoc no generó el archivo EPUB.');
  }

  return {
    epubBytes: outputNode.data,
    logs: [stdout.join('\n'), stderr.join('\n')].filter(Boolean).join('\n')
  };
}
