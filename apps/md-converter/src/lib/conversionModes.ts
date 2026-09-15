export type ConversionMode =
  | 'csv-to-markdown'
  | 'docx-to-markdown'
  | 'epub-to-markdown'
  | 'html-to-markdown'
  | 'markdown-to-docx'
  | 'markdown-to-epub'
  | 'markdown-to-html'
  | 'odt-to-markdown'
  | 'pdf-to-markdown'
  | 'pptx-to-markdown'
  | 'rtf-to-markdown'
  | 'xlsx-to-markdown';

export type ConversionModeDefinition = {
  value: ConversionMode;
  label: string;
  importLabel: string;
  importAccept: string;
  downloadLabel: string;
  supportsConfig: boolean;
  sourceKind: 'binary' | 'markdown';
  sourceFormat: 'csv' | 'docx' | 'epub' | 'html' | 'markdown' | 'odt' | 'pdf' | 'pptx' | 'rtf' | 'xlsx';
  outputFormat: 'docx' | 'epub3' | 'html' | 'markdown';
  outputExtension: 'docx' | 'epub' | 'html' | 'md';
  outputMimeType: string;
};

export const DEFAULT_CONVERSION_MODE: ConversionMode = 'markdown-to-epub';

export const CONVERSION_MODES: ConversionModeDefinition[] = [
  {
    value: 'docx-to-markdown',
    label: 'Word (.docx) → Markdown',
    importLabel: 'Importar .docx',
    importAccept: '.docx,.docm,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
    label: 'EPUB → Markdown',
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
    label: 'HTML → Markdown',
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
    value: 'pdf-to-markdown',
    label: 'PDF → Markdown',
    importLabel: 'Importar .pdf',
    importAccept: '.pdf,application/pdf',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'pdf',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'pptx-to-markdown',
    label: 'PowerPoint → Markdown',
    importLabel: 'Importar presentación',
    importAccept: '.ppt,.pps,.pot,.pptx,.pptm,.ppsx,.ppsm,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'pptx',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'xlsx-to-markdown',
    label: 'Excel → Markdown',
    importLabel: 'Importar hoja de cálculo',
    importAccept: '.xls,.xlsx,.xlsm,.xlsb,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'xlsx',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'odt-to-markdown',
    label: 'OpenDocument → Markdown',
    importLabel: 'Importar .odt',
    importAccept: '.odt,.ods,.odp,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'odt',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'rtf-to-markdown',
    label: 'RTF → Markdown',
    importLabel: 'Importar .rtf',
    importAccept: '.rtf,application/rtf,text/rtf',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'rtf',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'csv-to-markdown',
    label: 'CSV → Markdown',
    importLabel: 'Importar .csv',
    importAccept: '.csv,text/csv',
    downloadLabel: 'Convertir y descargar Markdown',
    supportsConfig: false,
    sourceKind: 'binary',
    sourceFormat: 'csv',
    outputFormat: 'markdown',
    outputExtension: 'md',
    outputMimeType: 'text/markdown'
  },
  {
    value: 'markdown-to-docx',
    label: 'Markdown → Word (.docx)',
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
    label: 'Markdown → EPUB',
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
    label: 'Markdown → HTML',
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
  return (
    CONVERSION_MODES.find((entry) => entry.value === mode) ??
    CONVERSION_MODES.find((entry) => entry.value === DEFAULT_CONVERSION_MODE) ??
    CONVERSION_MODES[0]
  );
}
