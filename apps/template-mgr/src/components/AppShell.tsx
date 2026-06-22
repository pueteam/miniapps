import type { ComponentChildren } from 'preact';
import appConfig from '../../app.config.json';
import { InstallButton } from './InstallButton';

interface Props {
  children: ComponentChildren;
  onHelpClick?: () => void;
}

export function AppShell({ children, onHelpClick }: Readonly<Props>) {
  return (
    <div class="app-shell">
      <header class="app-shell__header">
        <section class="hero-compact" aria-labelledby="app-title">
          <div class="hero-content">
            <h2 id="app-title">{appConfig.title}</h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <p style={{ margin: 0 }}>{appConfig.description}</p>
              {onHelpClick && (
              <button
                class="tm-btn-help"
                onClick={onHelpClick}
                aria-label="Ayuda"
              >
                ?
              </button>
            )}
            </div>
          </div>
          <div class="hero-actions">
            <InstallButton />
          </div>
        </section>
        <div class="header-actions"></div>
      </header>
      <main>{children}</main>
    </div>
  );
}
