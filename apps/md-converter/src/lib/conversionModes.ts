export type ConversionMode =
  | 'docx-to-markdown'
  | 'epub-to-markdown'
  | 'html-to-markdown'
  | 'markdown-to-docx'
  | 'markdown-to-epub'
  | 'markdown-to-html';

export type ConversionModeDefinition = {
  value: ConversionMode;
  label: string;
  importLabel: string;
  importAccept: string;
  downloadLabel: string;
  supportsConfig: boolean;
  sourceKind: 'binary' | 'markdown';
  sourceFormat: 'docx' | 'epub' | 'html' | 'markdown';
  outputFormat: 'docx' | 'epub3' | 'html' | 'markdown';
  outputExtension: 'docx' | 'epub' | 'html' | 'md';
  outputMimeType: string;
};

export const DEFAULT_CONVERSION_MODE: ConversionMode = 'markdown-to-epub';

export const CONVERSION_MODES: ConversionModeDefinition[] = [
  {
    value: 'docx-to-markdown',
    label: 'Word (.docx) -> Markdown',
    importLabel: 'Importar .docx',
    importAccept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'docx',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'epub-to-markdown',
    label: 'EPUB -> Markdown',
    importLabel: 'Importar .epub',
    importAccept: '.epub,application/epub+zip',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'epub',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'html-to-markdown',
    label: 'HTML -> Markdown',
    importLabel: 'Importar .html',
    importAccept: '.html,.htm,text/html',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'html',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'markdown-to-docx',
    label: 'Markdown -> Word (.docx)',
    importLabel: 'Importar .md',
    importAccept: '.md,.markdown,text/markdown,text/plain',
    downloadLabel: 'Convertir y descargar Word',
    supportsConfig: true,
    sourceKind: 'markdown',
    sourceFormat: 'markdown',
    outputFormat: 'docx',
    outputExtension: 'docx',
    outputMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  {
    value: 'markdown-to-epub',
    label: 'Markdown -> EPUB',
    importLabel: 'Importar .md',
    importAccept: '.md,.markdown,text/markdown,text/plain',
    downloadLabel: 'Convertir y descargar EPUB',
    supportsConfig: true,
    sourceKind: 'markdown',
    sourceFormat: 'markdown',
    outputFormat: 'epub3',
    outputExtension: 'epub',
    outputMimeType: 'application/epub+zip'
  },
  {
    value: 'markdown-to-html',
    label: 'Markdown -> HTML',
    importLabel: 'Importar .md',
    importAccept: '.md,.markdown,text/markdown,text/plain',
    downloadLabel: 'Convertir y descargar HTML',
    supportsConfig: true,
    sourceKind: 'markdown',
    sourceFormat: 'markdown',
    outputFormat: 'html',
    outputExtension: 'html',
    outputMimeType: 'text/html'
  }
];

export function getConversionModeDefinition(mode: ConversionMode): ConversionModeDefinition {
  return CONVERSION_MODES.find((entry) => entry.value === mode) ?? CONVERSION_MODES[4];
}
