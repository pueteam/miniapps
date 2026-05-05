import type { ComponentChildren } from 'preact';
import appConfig from '../../app.config.json';
import { InstallButton } from './InstallButton';

export function AppShell({
  children,
}: Readonly<{ children: ComponentChildren }>) {
  return (
    <div class="app-shell">
      <header class="app-shell__header">
        <section class="hero-compact" aria-labelledby="converter-title">
          <h2 id="converter-title">{appConfig.title}</h2>
          <p>{appConfig.description}</p>
        </section>
        <InstallButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
