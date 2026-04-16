import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getInstallState, registerSW } from './registerSW';

describe('registerSW', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('logs service worker registration failures', async () => {
    const error = new Error('sw failed');
    const register = vi.fn().mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    });

    registerSW();
    window.dispatchEvent(new Event('load'));
    await Promise.resolve();

    expect(register).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    });
    expect(errorSpy).toHaveBeenCalledWith('[registerSW] service worker registration failed', error);
  });

  it('stores beforeinstallprompt and resets install state after appinstalled', () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event('beforeinstallprompt');
    Object.assign(event, {
      preventDefault: vi.fn(),
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });

    registerSW();
    window.dispatchEvent(event);

    expect(getInstallState()).toEqual({ canInstall: true, isInstalled: false });

    window.dispatchEvent(new Event('appinstalled'));
    expect(getInstallState()).toEqual({ canInstall: false, isInstalled: true });
  });
});
