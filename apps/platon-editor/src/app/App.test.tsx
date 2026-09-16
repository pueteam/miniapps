import { expect, it, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

it('importar App no registra listeners ni service workers (sin side-effects)', async () => {
  const addSpy = vi.spyOn(window, 'addEventListener');
  await import('./App');
  const swRelated = addSpy.mock.calls.filter(([type]) => type === 'beforeinstallprompt' || type === 'load');
  expect(swRelated).toHaveLength(0);
});
