import { expect, it, vi, afterEach } from 'vitest';
import { downloadBlob } from './files';

afterEach(() => vi.restoreAllMocks());

it('difiere revokeObjectURL para no abortar la descarga en Firefox/Safari', () => {
  vi.useFakeTimers();
  try {
    const blob = new Blob(['contenido']);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:diferida');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    downloadBlob(blob, 'cadena.png');
    expect(revoke).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith('blob:diferida');
  } finally {
    vi.useRealTimers();
  }
});
