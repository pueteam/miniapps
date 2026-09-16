import { afterEach, expect, it, vi } from 'vitest';

async function freshSW() {
  vi.resetModules();
  return import('./registerSW');
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

it('registra el SW de inmediato si el documento ya terminó de cargar', async () => {
  const register = vi.fn().mockResolvedValue({} as never);
  Object.defineProperty(window.navigator, 'serviceWorker', { value: { register }, configurable: true });
  Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
  const { registerSW } = await freshSW();
  registerSW();
  expect(register).toHaveBeenCalledOnce();
});

it('detecta la PWA instalada vía display-mode standalone', async () => {
  Object.defineProperty(window, 'matchMedia', {
    value: () => ({ matches: true }),
    configurable: true,
  });
  const { getInstallState } = await freshSW();
  expect(getInstallState().isInstalled).toBe(true);
});

it('conserva el prompt si el usuario descarta la instalación', async () => {
  const { registerSW, triggerInstall, getInstallState } = await freshSW();
  registerSW();
  const ev = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  ev.prompt = vi.fn().mockResolvedValue(undefined);
  ev.userChoice = Promise.resolve({ outcome: 'dismissed' });
  window.dispatchEvent(ev);
  expect(getInstallState().canInstall).toBe(true);
  await triggerInstall();
  expect(getInstallState().canInstall).toBe(true);
});

it('limpia el prompt si el usuario acepta la instalación', async () => {
  const { registerSW, triggerInstall, getInstallState } = await freshSW();
  registerSW();
  const ev = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  ev.prompt = vi.fn().mockResolvedValue(undefined);
  ev.userChoice = Promise.resolve({ outcome: 'accepted' });
  window.dispatchEvent(ev);
  await triggerInstall();
  expect(getInstallState().canInstall).toBe(false);
});
