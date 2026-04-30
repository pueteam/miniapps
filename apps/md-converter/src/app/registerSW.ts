interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallState {
  canInstall: boolean;
  isInstalled: boolean;
}

let installPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
let hasRegistered = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function registerSW(): void {
  if (hasRegistered) return;
  hasRegistered = true;

  globalThis.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  globalThis.addEventListener('appinstalled', () => {
    installed = true;
    installPrompt = null;
    notify();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL
      }).catch((error) => {
        console.error('[registerSW] service worker registration failed', error);
      });
    }, { once: true });
  }
}

export function getInstallState(): InstallState {
  return {
    canInstall: installPrompt !== null,
    isInstalled: installed
  };
}

export function subscribeInstallState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function triggerInstall(): void {
  const prompt = installPrompt;
  if (!prompt) return;

  prompt.prompt();
  void prompt.userChoice.then(() => {
    installPrompt = null;
    notify();
  });
}
