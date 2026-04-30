import type { ConversionMode } from './conversionModes';

export type BinaryInput = {
  name: string;
  bytes: Uint8Array;
};

export type WorkerJobInput = {
  conversionMode: ConversionMode;
  markdown?: string;
  sourceFile?: BinaryInput | null;
  outputBasename?: string;
  css?: string;
  metadataYaml?: string;
  toc?: boolean;
  tocDepth?: number;
  splitLevel?: number;
  cover?: BinaryInput | null;
  wasmBytes?: Uint8Array | null;
  referenceDoc?: BinaryInput | null;
  mathRendering?: string;
  highlightStyle?: string;
};

export type WorkerJobResult = {
  outputBytes: Uint8Array;
  outputFilename: string;
  mimeType: string;
  logs: string;
};

export type ConfigSection = 'book' | 'styles' | 'document';

export type ConfigDraft = {
  title: string;
  author: string;
  lang: string;
  toc: boolean;
  tocDepth: number;
  splitLevel: number;
  css: string;
  referenceDoc: File | null;
  mathRendering: string;
  highlightStyle: string;
};

export type { ConversionMode };
