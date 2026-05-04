import type { ComponentChildren } from 'preact';
import { InstallButton } from './InstallButton';

export function AppShell({ children }: Readonly<{ children: ComponentChildren }>) {
  return (
    <div class="app-shell">
      <header class="app-shell__header">
        <section class="hero-compact" aria-labelledby="sticky-board-title">
          <h2 id="sticky-board-title">Sticky Board</h2>
          <p>Tablero PWA de notas post-it con autoguardado local</p>
        </section>
        
        <InstallButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
