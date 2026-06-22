declare class PizZip {
  constructor(data?: ArrayBuffer | Uint8Array | string);
  files: Record<string, { asText(): string }>;
  generate(opts: { type: string; mimeType: string }): Blob;
}

interface DocxtemplaterOptions {
  paragraphLoop?: boolean;
  linebreaks?: boolean;
  parser?: (tag: string) => { get(scope: Record<string, unknown>): unknown };
}

interface DocxtemplaterInstance {
  getZip(): PizZip;
  getFullText(): string;
  setData(data: Record<string, string>): void;
  render(): void;
}

declare const docxtemplater: new (
  zip: PizZip,
  options?: DocxtemplaterOptions
) => DocxtemplaterInstance;

declare function saveAs(blob: Blob, filename: string): void;
