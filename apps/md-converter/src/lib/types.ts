export type BinaryInput = {
  name: string;
  bytes: Uint8Array;
};

export type WorkerJobInput = {
  markdown: string;
  css: string;
  metadataYaml: string;
  toc: boolean;
  tocDepth: number;
  splitLevel: number;
  cover?: BinaryInput | null;
  wasmBytes?: Uint8Array | null;
};

export type WorkerJobResult = {
  epubBytes: Uint8Array;
  logs: string;
};
