import init, { toMarkdownBytes, type ConvertErrorCode, type Format, type InitOutput } from '@firecrawl/anydoc-wasm';
import type { ConversionMode } from './conversionModes';
import { getBaseFilename, getFileExtension } from './fileUtils';

export type AnydocHint = Format;

const EXTENSION_HINTS: Record<string, Format> = {
  '.doc': 'doc',
  '.docm': 'docx',
  '.docx': 'docx',
  '.epub': 'epub',
  '.pdf': 'pdf',
  '.ppt': 'ppt',
  '.pps': 'pptx',
  '.ppsm': 'pptx',
  '.ppsx': 'pptx',
  '.pot': 'pptx',
  '.potm': 'pptx',
  '.potx': 'pptx',
  '.pptm': 'pptx',
  '.pptx': 'pptx',
  '.xls': 'xlsx',
  '.xlsb': 'xlsx',
  '.xlsm': 'xlsx',
  '.xlsx': 'xlsx',
  '.odp': 'odp',
  '.ods': 'ods',
  '.odt': 'odt',
  '.rtf': 'rtf',
  '.csv': 'csv'
};

export function isAnydocMode(mode: ConversionMode): boolean {
  return mode.endsWith('-to-markdown') && mode !== 'html-to-markdown';
}

export function getAnydocHint(filename: string): AnydocHint | undefined {
  return EXTENSION_HINTS[getFileExtension(filename)];
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
      return `Formato no soportado por el conversor offline.${detail}`;
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
