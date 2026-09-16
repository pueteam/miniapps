import { afterEach, expect, it, vi } from 'vitest';
import { emptyDiagram } from '../model/document';
import { downloadBlob, downloadJson } from './files';

afterEach(() => vi.restoreAllMocks());

it('descarga blobs y revoca la URL temporal de forma diferida', () => {
  vi.useFakeTimers();
  try {
    const blob = new Blob(['contenido']);
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:prueba');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    downloadBlob(blob, 'cadena.png');
    expect(create).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledOnce();
    expect(revoke).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith('blob:prueba');
  } finally {
    vi.useRealTimers();
  }
});

it('serializa el documento editable como JSON', () => {
  vi.useFakeTimers();
  try {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:json');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const doc = emptyDiagram();
    doc.metadata.title = 'Mi/Cadena';
    downloadJson(doc);
    vi.runAllTimers();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  } finally {
    vi.useRealTimers();
  }
});
