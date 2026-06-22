import { useEffect, useState } from 'preact/hooks';
import { getInstallState, subscribeInstallState, triggerInstall } from '../app/registerSW';

export function InstallButton() {
  const [installState, setInstallState] = useState(() => getInstallState());

  useEffect(() => subscribeInstallState(() => {
    setInstallState(getInstallState());
  }), []);

  if (!installState.canInstall || installState.isInstalled) return null;

  return (
    <button type="button" class="install-btn" onClick={triggerInstall} aria-label="Instalar app" title="Instalar app">
      <svg class="install-btn__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20">
        <path d="M10 3v9.5M6 9l4 4 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 15.5h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
      <span class="install-btn__label" aria-hidden="true">Instalar</span>
    </button>
  );
}
