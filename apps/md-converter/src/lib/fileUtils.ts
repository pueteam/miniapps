import type { BinaryInput } from './types';

export function getFileExtension(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index).toLowerCase() : '';
}

export function getBaseFilename(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(0, index) : name;
}

export function isAcceptedFile(name: string, accept: string): boolean {
  const extension = getFileExtension(name);
  return accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.startsWith('.'))
    .includes(extension);
}

export function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }

  if (typeof Blob !== 'undefined' && typeof Blob.prototype.arrayBuffer === 'function') {
    return new Blob([file], { type: file.type }).arrayBuffer();
  }

  return new Response(file).arrayBuffer();
}

export function readTextFile(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return readFileArrayBuffer(file).then((buffer) => new TextDecoder().decode(buffer));
}

export async function toBinaryInput(file: File | null): Promise<BinaryInput | null> {
  if (!file) return null;

  const buffer = await readFileArrayBuffer(file);

  return {
    name: file.name,
    bytes: new Uint8Array(buffer)
  };
}
