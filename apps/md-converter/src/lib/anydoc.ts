import init, { toMarkdownBytes, type ConvertErrorCode, type InitOutput } from '@firecrawl/anydoc-wasm';
import type { ConversionMode } from './conversionModes';
import { getBaseFilename } from './fileUtils';

export type AnydocHint = 'docx' | 'epub';

export function isAnydocMode(mode: ConversionMode): boolean {
  return mode === 'docx-to-markdown' || mode === 'epub-to-markdown';
}

export function getAnydocHint(filename: string): AnydocHint | undefined {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.epub')) return 'epub';
  return undefined;
}

export function anydocErrorToSpanish(error: unknown): string {
  const code = (error as { code?: ConvertErrorCode } | null)?.code;
  const detail = error instanceof Error && error.message ? ` (${error.message})` : '';

  switch (code) {
    case 'needsOcr':
      return `El documento es escaneado o solo-imagen y necesitaría OCR. El modo offline no aplica OCR.${detail}`;
    case 'encrypted':
      return `El documento está cifrado o protegido con contraseña.${detail}`;
    case 'unsupported':
      return `Formato no soportado por el conversor offline (solo .docx y .epub).${detail}`;
    case 'malformed':
      return `El archivo está dañado o no contiene contenido aprovechable.${detail}`;
    case 'resourceLimit':
      return `El archivo supera los límites de seguridad del conversor offline.${detail}`;
    case 'missingPart':
      return `Al archivo le falta una parte necesaria para convertirlo.${detail}`;
    default:
      return error instanceof Error && error.message
        ? error.message
        : 'Error desconocido al convertir con AnyDoc.';
  }
}

let initPromise: Promise<InitOutput> | null = null;

export function ensureAnydocInit(): Promise<InitOutput> {
  if (!initPromise) {
    initPromise = init();
  }
  return initPromise;
}

export function convertAnydocToMarkdown(bytes: Uint8Array, filename: string): string {
  return toMarkdownBytes(bytes, getAnydocHint(filename) ?? null);
}

export function anydocOutputBasename(filename: string, fallback: string): string {
  const base = getBaseFilename(filename).trim();
  return base || fallback;
}
