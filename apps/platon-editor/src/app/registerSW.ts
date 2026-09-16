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

function isStandalone(): boolean {
  if (installed) return true;
  if (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) return true;
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function doRegister(): void {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL
  }).catch((error) => {
    console.error('[registerSW] service worker registration failed', error);
  });
}

export function registerSW(): void {
  if (hasRegistered) return;
  hasRegistered = true;

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    installPrompt = null;
    notify();
  });

  if ('serviceWorker' in navigator) {
    if (document.readyState === 'complete') doRegister();
    else window.addEventListener('load', doRegister, { once: true });
  }
}

export function getInstallState(): InstallState {
  return {
    canInstall: installPrompt !== null,
    isInstalled: isStandalone()
  };
}

export function subscribeInstallState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function triggerInstall(): Promise<'accepted' | 'dismissed' | null> {
  const prompt = installPrompt;
  if (!prompt) return null;

  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') {
      installPrompt = null;
      notify();
    }
    return choice.outcome;
  } catch {
    return null;
  }
}
